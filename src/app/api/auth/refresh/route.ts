import { NextResponse, type NextRequest } from "next/server";
import { db } from "@/src/lib/db";
import { users, refreshTokens, auditLogs } from "@/src/lib/db/schema";
import {
  signAccessToken,
  generateRandomToken,
  hashToken,
  REFRESH_TOKEN_MAX_AGE_SECONDS,
} from "@/src/lib/auth/jwt";
import { setAuthCookies, REFRESH_COOKIE_NAME } from "@/src/lib/auth/cookies";
import { eq, and, isNull, gt } from "drizzle-orm";

export async function POST(request: NextRequest) {
  try {
    // 1. Extract refresh token from cookie or authorization header/body
    let rawRefreshToken = request.cookies.get(REFRESH_COOKIE_NAME)?.value;

    if (!rawRefreshToken) {
      try {
        const body = await request.json();
        rawRefreshToken = body?.refreshToken || body?.refresh_token;
      } catch {
        // Body may be empty
      }
    }

    if (!rawRefreshToken) {
      return NextResponse.json(
        {
          success: false,
          message: "No refresh token provided.",
        },
        { status: 401 },
      );
    }

    // 2. Hash and look up token in DB
    const hashedToken = hashToken(rawRefreshToken);
    const now = new Date();

    const [storedToken] = await db
      .select()
      .from(refreshTokens)
      .where(
        and(
          eq(refreshTokens.tokenHash, hashedToken),
          isNull(refreshTokens.revokedAt),
          gt(refreshTokens.expiresAt, now),
        ),
      )
      .limit(1);

    if (!storedToken) {
      return NextResponse.json(
        {
          success: false,
          message: "Invalid, expired, or revoked refresh token.",
        },
        { status: 401 },
      );
    }

    // 3. Fetch user
    const [user] = await db
      .select()
      .from(users)
      .where(eq(users.id, storedToken.userId))
      .limit(1);

    if (!user || user.status === "SUSPENDED") {
      return NextResponse.json(
        {
          success: false,
          message: "User account not active or suspended.",
        },
        { status: 403 },
      );
    }

    // 4. Token Rotation: Revoke old token & generate new token pair
    await db
      .update(refreshTokens)
      .set({ revokedAt: now })
      .where(eq(refreshTokens.id, storedToken.id));

    const newRawRefreshToken = generateRandomToken();
    const newHashedRefreshToken = hashToken(newRawRefreshToken);
    const newExpiresAt = new Date(
      Date.now() + REFRESH_TOKEN_MAX_AGE_SECONDS * 1000,
    );

    const ipAddress =
      request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
      request.headers.get("x-real-ip") ||
      "unknown";
    const userAgent = request.headers.get("user-agent") || "unknown";

    await db.insert(refreshTokens).values({
      userId: user.id,
      tokenHash: newHashedRefreshToken,
      userAgent,
      ipAddress,
      expiresAt: newExpiresAt,
    });

    // 5. Audit log
    await db.insert(auditLogs).values({
      userId: user.id,
      action: "TOKEN_REFRESH",
      ipAddress,
      userAgent,
    });

    // 6. Sign new access token
    const newAccessToken = await signAccessToken({
      userId: user.id,
      email: user.email,
      role: user.role,
      status: user.status,
      kycStatus: user.kycStatus,
      fundingStatus: user.fundingStatus,
    });

    const response = NextResponse.json(
      {
        success: true,
        message: "Tokens refreshed successfully.",
        data: {
          accessToken: newAccessToken,
        },
      },
      { status: 200 },
    );

    // 7. Attach rotated cookies
    return setAuthCookies(response, newAccessToken, newRawRefreshToken);
  } catch (error) {
    console.error("Token refresh error:", error);
    return NextResponse.json(
      {
        success: false,
        message: "An unexpected error occurred during token refresh.",
      },
      { status: 500 },
    );
  }
}
