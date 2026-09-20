import { NextResponse, type NextRequest } from "next/server";
import { and, eq, isNull } from "drizzle-orm";
import { db } from "@/src/lib/db";
import { auditLogs, refreshTokens } from "@/src/lib/db/schema";
import { ADMIN_REFRESH_COOKIE_NAME, getAdminFromRequest } from "@/src/lib/auth/admin";
import { clearAdminAuthCookies } from "@/src/lib/auth/admin-cookies";
import { hashToken } from "@/src/lib/auth/jwt";
import { getRequestMetadata } from "@/src/lib/security/request";

export async function POST(request: NextRequest) {
  try {
    const admin = await getAdminFromRequest(request);
    const refreshToken = request.cookies.get(ADMIN_REFRESH_COOKIE_NAME)?.value;
    const { ipAddress, userAgent } = getRequestMetadata(request);

    await db.transaction(async (tx) => {
      if (refreshToken) {
        await tx
          .update(refreshTokens)
          .set({ revokedAt: new Date() })
          .where(
            and(
              eq(refreshTokens.tokenHash, hashToken(refreshToken)),
              isNull(refreshTokens.revokedAt),
            ),
          );
      }
      if (admin) {
        await tx.insert(auditLogs).values({
          userId: admin.id,
          action: "ADMIN_LOGOUT",
          ipAddress,
          userAgent,
        });
      }
    });
  } catch (error) {
    console.error("Admin logout error:", error);
  }

  return clearAdminAuthCookies(NextResponse.json({ success: true }));
}
