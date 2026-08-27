import { NextResponse, type NextRequest } from "next/server";
import { db } from "@/src/lib/db";
import { refreshTokens, auditLogs } from "@/src/lib/db/schema";
import { hashToken } from "@/src/lib/auth/jwt";
import { clearAuthCookies, REFRESH_COOKIE_NAME } from "@/src/lib/auth/cookies";
import { getSessionFromRequest } from "@/src/lib/auth/session";
import { eq } from "drizzle-orm";

export async function POST(request: NextRequest) {
  try {
    const rawRefreshToken = request.cookies.get(REFRESH_COOKIE_NAME)?.value;
    const session = await getSessionFromRequest(request);

    if (rawRefreshToken) {
      const hashedToken = hashToken(rawRefreshToken);
      await db
        .update(refreshTokens)
        .set({ revokedAt: new Date() })
        .where(eq(refreshTokens.tokenHash, hashedToken));
    }

    if (session?.userId) {
      const ipAddress =
        request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
        request.headers.get("x-real-ip") ||
        "unknown";
      const userAgent = request.headers.get("user-agent") || "unknown";

      await db.insert(auditLogs).values({
        userId: session.userId,
        action: "USER_LOGOUT",
        ipAddress,
        userAgent,
      });
    }

    const response = NextResponse.json(
      {
        success: true,
        message: "Logged out successfully.",
      },
      { status: 200 },
    );

    return clearAuthCookies(response);
  } catch (error) {
    console.error("Logout error:", error);
    const response = NextResponse.json(
      {
        success: true,
        message: "Logged out successfully.",
      },
      { status: 200 },
    );
    return clearAuthCookies(response);
  }
}
