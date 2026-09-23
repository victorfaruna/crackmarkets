import { NextResponse, type NextRequest } from "next/server";
import { and, eq, gt, isNull } from "drizzle-orm";
import { db } from "@/src/lib/db";
import { auditLogs, refreshTokens, users } from "@/src/lib/db/schema";
import {
  ADMIN_REFRESH_COOKIE_NAME,
  signAdminAccessToken,
} from "@/src/lib/auth/admin";
import { clearAdminAuthCookies, setAdminAuthCookies } from "@/src/lib/auth/admin-cookies";
import {
  generateRandomToken,
  hashToken,
} from "@/src/lib/auth/jwt";
import { ADMIN_REFRESH_TOKEN_MAX_AGE_SECONDS } from "@/src/lib/auth/refresh-duration";
import { getRequestMetadata } from "@/src/lib/security/request";

export async function POST(request: NextRequest) {
  try {
    const rawToken = request.cookies.get(ADMIN_REFRESH_COOKIE_NAME)?.value;
    if (!rawToken) {
      return clearAdminAuthCookies(
        NextResponse.json({ success: false, message: "Admin session expired." }, { status: 401 }),
      );
    }

    const now = new Date();
    const [storedToken] = await db
      .select()
      .from(refreshTokens)
      .where(
        and(
          eq(refreshTokens.tokenHash, hashToken(rawToken)),
          isNull(refreshTokens.revokedAt),
          gt(refreshTokens.expiresAt, now),
        ),
      )
      .limit(1);

    if (!storedToken) {
      return clearAdminAuthCookies(
        NextResponse.json({ success: false, message: "Admin session expired." }, { status: 401 }),
      );
    }

    const [admin] = await db
      .select()
      .from(users)
      .where(eq(users.id, storedToken.userId))
      .limit(1);

    if (!admin || admin.role !== "ADMIN" || admin.status !== "ACTIVE") {
      return clearAdminAuthCookies(
        NextResponse.json({ success: false, message: "Administrator access denied." }, { status: 403 }),
      );
    }

    const replacement = generateRandomToken();
    const { ipAddress, userAgent } = getRequestMetadata(request);
    await db.transaction(async (tx) => {
      const [revoked] = await tx
        .update(refreshTokens)
        .set({ revokedAt: now })
        .where(and(eq(refreshTokens.id, storedToken.id), isNull(refreshTokens.revokedAt)))
        .returning({ id: refreshTokens.id });
      if (!revoked) throw new Error("Admin refresh token already rotated");

      await tx.insert(refreshTokens).values({
        userId: admin.id,
        tokenHash: hashToken(replacement),
        userAgent,
        ipAddress,
        expiresAt: new Date(Date.now() + ADMIN_REFRESH_TOKEN_MAX_AGE_SECONDS * 1000),
      });
      await tx.insert(auditLogs).values({
        userId: admin.id,
        action: "ADMIN_TOKEN_REFRESH",
        ipAddress,
        userAgent,
      });
    });

    const accessToken = await signAdminAccessToken({
      userId: admin.id,
      email: admin.email,
      role: "ADMIN",
    });
    return setAdminAuthCookies(
      NextResponse.json({ success: true }),
      accessToken,
      replacement,
    );
  } catch (error) {
    console.error("Admin token refresh error:", error);
    return clearAdminAuthCookies(
      NextResponse.json({ success: false, message: "Unable to refresh admin session." }, { status: 500 }),
    );
  }
}
