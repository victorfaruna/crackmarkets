import { NextResponse, type NextRequest } from "next/server";
import { eq } from "drizzle-orm";
import { db } from "@/src/lib/db";
import { auditLogs, refreshTokens, users } from "@/src/lib/db/schema";
import { verifyPassword } from "@/src/lib/auth/password";
import { adminLoginSchema } from "@/src/lib/auth/admin-validation";
import { signAdminAccessToken } from "@/src/lib/auth/admin";
import { setAdminAuthCookies } from "@/src/lib/auth/admin-cookies";
import {
  generateRandomToken,
  hashToken,
  REFRESH_TOKEN_MAX_AGE_SECONDS,
} from "@/src/lib/auth/jwt";
import { checkRateLimit } from "@/src/lib/security/rateLimit";
import { getRequestMetadata } from "@/src/lib/security/request";
import { verifyTurnstile } from "@/src/lib/security/turnstile";

const INVALID_CREDENTIALS = "Invalid administrator credentials.";

export async function POST(request: NextRequest) {
  try {
    const { ipAddress, userAgent } = getRequestMetadata(request);
    const rateLimit = await checkRateLimit({
      namespace: "auth:admin-login",
      identifier: ipAddress,
      limit: 5,
      windowSeconds: 15 * 60,
    });

    if (!rateLimit.allowed) {
      return NextResponse.json(
        { success: false, message: "Too many login attempts. Try again later." },
        { status: 429 },
      );
    }

    const parsed = adminLoginSchema.safeParse(await request.json());
    if (!parsed.success) {
      return NextResponse.json(
        { success: false, message: "Invalid login request." },
        { status: 400 },
      );
    }

    const email = parsed.data.email.trim().toLowerCase();
    if (!(await verifyTurnstile(parsed.data.turnstile_token, ipAddress))) {
      return NextResponse.json(
        { success: false, message: "Bot verification failed. Please try again." },
        { status: 400 },
      );
    }

    const [admin] = await db
      .select()
      .from(users)
      .where(eq(users.email, email))
      .limit(1);

    if (
      !admin ||
      admin.role !== "ADMIN" ||
      admin.status !== "ACTIVE" ||
      !(await verifyPassword(parsed.data.password, admin.passwordHash))
    ) {
      return NextResponse.json(
        { success: false, message: INVALID_CREDENTIALS },
        { status: 401 },
      );
    }

    const rawRefreshToken = generateRandomToken();
    const accessToken = await signAdminAccessToken({
      userId: admin.id,
      email: admin.email,
      role: "ADMIN",
    });

    await db.transaction(async (tx) => {
      await tx.insert(refreshTokens).values({
        userId: admin.id,
        tokenHash: hashToken(rawRefreshToken),
        userAgent,
        ipAddress,
        expiresAt: new Date(Date.now() + REFRESH_TOKEN_MAX_AGE_SECONDS * 1000),
      });
      await tx.insert(auditLogs).values({
        userId: admin.id,
        action: "ADMIN_LOGIN",
        ipAddress,
        userAgent,
        details: { email },
      });
    });

    return setAdminAuthCookies(
      NextResponse.json({ success: true, message: "Admin login successful." }),
      accessToken,
      rawRefreshToken,
    );
  } catch (error) {
    console.error("Admin login error:", error);
    return NextResponse.json(
      { success: false, message: "Unable to sign in right now." },
      { status: 500 },
    );
  }
}
