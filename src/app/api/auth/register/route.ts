import { NextResponse, type NextRequest } from "next/server";
import { db } from "@/src/lib/db";
import {
  users,
  wallets,
  referralNodes,
  refreshTokens,
  emailVerificationTokens,
  auditLogs,
} from "@/src/lib/db/schema";
import { registerSchema } from "@/src/lib/auth/validation";
import { hashPassword } from "@/src/lib/auth/password";
import {
  signAccessToken,
  generateRandomToken,
  hashToken,
  REFRESH_TOKEN_MAX_AGE_SECONDS,
} from "@/src/lib/auth/jwt";
import { setAuthCookies } from "@/src/lib/auth/cookies";
import { eq } from "drizzle-orm";
import crypto from "crypto";

function generateReferralCode(): string {
  return "CRK" + crypto.randomBytes(4).toString("hex").toUpperCase();
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const validationResult = registerSchema.safeParse(body);

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

    const {
      first_name,
      last_name,
      email,
      phone_number,
      country,
      password,
      referral_code,
    } = validationResult.data;

    const normalizedEmail = email.toLowerCase().trim();

    // 1. Check for existing user
    const [existingUser] = await db
      .select({ id: users.id })
      .from(users)
      .where(eq(users.email, normalizedEmail))
      .limit(1);

    if (existingUser) {
      return NextResponse.json(
        {
          success: false,
          message: "An account with this email address already exists.",
        },
        { status: 409 },
      );
    }

    // 2. Validate referral code if provided
    let referrerId: string | null = null;
    if (referral_code && referral_code.trim().length > 0) {
      const [referrer] = await db
        .select({ id: users.id })
        .from(users)
        .where(eq(users.referralCode, referral_code.trim().toUpperCase()))
        .limit(1);

      if (!referrer) {
        return NextResponse.json(
          {
            success: false,
            message: "The referral code provided is invalid or inactive.",
          },
          { status: 400 },
        );
      }
      referrerId = referrer.id;
    }

    // 3. Hash password and generate unique referral code for user
    const passwordHash = await hashPassword(password);
    let userReferralCode = generateReferralCode();

    // Ensure referral code uniqueness
    let attempts = 0;
    while (attempts < 5) {
      const [codeConflict] = await db
        .select({ id: users.id })
        .from(users)
        .where(eq(users.referralCode, userReferralCode))
        .limit(1);
      if (!codeConflict) break;
      userReferralCode = generateReferralCode();
      attempts++;
    }

    // 4. Create raw tokens
    const rawRefreshToken = generateRandomToken();
    const hashedRefreshToken = hashToken(rawRefreshToken);
    const refreshTokenExpiresAt = new Date(
      Date.now() + REFRESH_TOKEN_MAX_AGE_SECONDS * 1000,
    );

    const rawVerificationToken = generateRandomToken(32);
    const hashedVerificationToken = hashToken(rawVerificationToken);
    const verificationExpiresAt = new Date(
      Date.now() + 24 * 60 * 60 * 1000, // 24 hours
    );

    const ipAddress =
      request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
      request.headers.get("x-real-ip") ||
      "unknown";
    const userAgent = request.headers.get("user-agent") || "unknown";

    // 5. Execute creation within database transaction
    const newUser = await db.transaction(async (tx) => {
      // 5a. Insert user
      const [insertedUser] = await tx
        .insert(users)
        .values({
          firstName: first_name.trim(),
          lastName: last_name.trim(),
          email: normalizedEmail,
          phoneNumber: phone_number.trim(),
          country: country.trim(),
          passwordHash,
          referralCode: userReferralCode,
          referredById: referrerId,
          status: "EMAIL_VERIFICATION_PENDING",
          kycStatus: "NOT_SUBMITTED",
          fundingStatus: "LOCKED",
          role: "USER",
        })
        .returning();

      // 5b. Create user wallet
      await tx.insert(wallets).values({
        userId: insertedUser.id,
        balance: "0.0000",
        availableBalance: "0.0000",
        totalWithdrawn: "0.0000",
        lifetimeEarnings: "0.0000",
      });

      // 5c. Build 10-level referral tree
      if (referrerId) {
        // Direct Level 1 link
        await tx.insert(referralNodes).values({
          ancestorId: referrerId,
          descendantId: insertedUser.id,
          depth: 1,
        });

        // Pull higher ancestors up to depth 9 (so new node is depth <= 10)
        const higherAncestors = await tx
          .select({
            ancestorId: referralNodes.ancestorId,
            depth: referralNodes.depth,
          })
          .from(referralNodes)
          .where(eq(referralNodes.descendantId, referrerId));

        for (const anc of higherAncestors) {
          if (anc.depth < 10) {
            await tx.insert(referralNodes).values({
              ancestorId: anc.ancestorId,
              descendantId: insertedUser.id,
              depth: anc.depth + 1,
            });
          }
        }
      }

      // 5d. Store email verification token
      await tx.insert(emailVerificationTokens).values({
        userId: insertedUser.id,
        tokenHash: hashedVerificationToken,
        expiresAt: verificationExpiresAt,
      });

      // 5e. Store initial refresh token
      await tx.insert(refreshTokens).values({
        userId: insertedUser.id,
        tokenHash: hashedRefreshToken,
        userAgent,
        ipAddress,
        expiresAt: refreshTokenExpiresAt,
      });

      // 5f. Audit log
      await tx.insert(auditLogs).values({
        userId: insertedUser.id,
        action: "USER_REGISTER",
        ipAddress,
        userAgent,
        details: {
          email: normalizedEmail,
          referredBy: referrerId,
        },
      });

      return insertedUser;
    });

    // 6. Sign JWT Access Token
    const accessToken = await signAccessToken({
      userId: newUser.id,
      email: newUser.email,
      role: newUser.role,
      status: newUser.status,
      kycStatus: newUser.kycStatus,
      fundingStatus: newUser.fundingStatus,
    });

    const response = NextResponse.json(
      {
        success: true,
        message:
          "Registration successful. Please verify your email to activate full platform features.",
        data: {
          user: {
            id: newUser.id,
            first_name: newUser.firstName,
            last_name: newUser.lastName,
            email: newUser.email,
            phone_number: newUser.phoneNumber,
            country: newUser.country,
            referral_code: newUser.referralCode,
            status: newUser.status,
            kyc_status: newUser.kycStatus,
            funding_status: newUser.fundingStatus,
            role: newUser.role,
            created_at: newUser.createdAt,
          },
          accessToken,
          verificationToken: rawVerificationToken, // Provided for direct verification / dev email test
        },
      },
      { status: 201 },
    );

    // 7. Set HTTP-only Cookies
    return setAuthCookies(response, accessToken, rawRefreshToken);
  } catch (error) {
    console.error("Registration error:", error);
    return NextResponse.json(
      {
        success: false,
        message: "An unexpected error occurred during registration.",
      },
      { status: 500 },
    );
  }
}
