import { NextResponse, type NextRequest } from "next/server";
import { db } from "@/src/lib/db";
import { users, refreshTokens, auditLogs } from "@/src/lib/db/schema";
import { loginSchema } from "@/src/lib/auth/validation";
import { verifyPassword } from "@/src/lib/auth/password";
import {
  signAccessToken,
  generateRandomToken,
  hashToken,
} from "@/src/lib/auth/jwt";
import {
  createCustomerRefreshToken,
  customerRefreshTokenMaxAgeSeconds,
} from "@/src/lib/auth/refresh-duration";
import { setAuthCookies } from "@/src/lib/auth/cookies";
import { eq } from "drizzle-orm";
import { checkRateLimit } from "@/src/lib/security/rateLimit";
import { getRequestMetadata } from "@/src/lib/security/request";
import { verifyTurnstile } from "@/src/lib/security/turnstile";

export async function POST(request: NextRequest) {
  try {
    const { ipAddress, userAgent } = getRequestMetadata(request);
    const rateLimit = await checkRateLimit({
      namespace: "auth:login",
      identifier: ipAddress,
      limit: 10,
      windowSeconds: 15 * 60,
    });
    if (!rateLimit.allowed) {
      return NextResponse.json(
        { success: false, message: "Too many login attempts. Please try again later." },
        { status: 429 },
      );
    }

    const body = await request.json();
    const validationResult = loginSchema.safeParse(body);

    if (!validationResult.success) {
      return NextResponse.json(
        {
          success: false,
          message: "Validation failed",
          errors: validationResult.error.flatten().fieldErrors,
        },
        { status: 400 },
      );
    }

    const { email, password, turnstile_token, remember_me } = validationResult.data;
    if (!(await verifyTurnstile(turnstile_token, ipAddress))) {
      return NextResponse.json(
        { success: false, message: "Bot verification failed. Please try again." },
        { status: 400 },
      );
    }
    const normalizedEmail = email.toLowerCase().trim();

    // 1. Fetch user by email
    const [user] = await db
      .select()
      .from(users)
      .where(eq(users.email, normalizedEmail))
      .limit(1);

    if (!user) {
      return NextResponse.json(
        {
          success: false,
          message: "Invalid email or password.",
        },
        { status: 401 },
      );
    }

    // 2. Check if account is suspended
    if (user.status === "SUSPENDED") {
      return NextResponse.json(
        {
          success: false,
          message: "Your account has been suspended. Please contact support.",
        },
        { status: 403 },
      );
    }

    // 3. Verify password
    const isPasswordValid = await verifyPassword(password, user.passwordHash);
    if (!isPasswordValid) {
      return NextResponse.json(
        {
          success: false,
          message: "Invalid email or password.",
        },
        { status: 401 },
      );
    }

    let accountStatus = user.status;
    if (accountStatus === "EMAIL_VERIFICATION_PENDING") {
      await db
        .update(users)
        .set({
          status: "ACTIVE",
          updatedAt: new Date(),
        })
        .where(eq(users.id, user.id));
      accountStatus = "ACTIVE";
    }

    if (accountStatus !== "ACTIVE") {
      return NextResponse.json(
        { success: false, message: "This account cannot sign in." },
        { status: 403 },
      );
    }

    // 4. Generate new refresh token
    const rawRefreshToken = createCustomerRefreshToken(
      generateRandomToken(),
      remember_me,
    );
    const hashedRefreshToken = hashToken(rawRefreshToken);
    const refreshTokenExpiresAt = new Date(
      Date.now() + customerRefreshTokenMaxAgeSeconds(rawRefreshToken) * 1000,
    );

    await db.insert(refreshTokens).values({
      userId: user.id,
      tokenHash: hashedRefreshToken,
      userAgent,
      ipAddress,
      expiresAt: refreshTokenExpiresAt,
    });

    // 5. Audit log
    await db.insert(auditLogs).values({
      userId: user.id,
      action: "USER_LOGIN",
      ipAddress,
      userAgent,
      details: { email: normalizedEmail },
    });

    // 6. Sign JWT Access Token
    const accessToken = await signAccessToken({
      userId: user.id,
      email: user.email,
      role: user.role,
      status: accountStatus,
      kycStatus: user.kycStatus,
      fundingStatus: user.fundingStatus,
    });

    const response = NextResponse.json(
      {
        success: true,
        message: "Login successful.",
        data: {
          user: {
            id: user.id,
            first_name: user.firstName,
            last_name: user.lastName,
            email: user.email,
            phone_number: user.phoneNumber,
            country: user.country,
            roboforex_linked: user.roboforexLinked,
            roboforex_id: user.roboforexId,
            referral_code: user.referralCode,
            status: accountStatus,
            kyc_status: user.kycStatus,
            funding_status: user.fundingStatus,
            role: user.role,
            created_at: user.createdAt,
          },
        },
      },
      { status: 200 },
    );

    // 7. Attach HTTP-only cookies
    return setAuthCookies(response, accessToken, rawRefreshToken);
  } catch (error) {
    console.error("Login error:", error);
    return NextResponse.json(
      {
        success: false,
        message: "An unexpected error occurred during login.",
      },
      { status: 500 },
    );
  }
}
