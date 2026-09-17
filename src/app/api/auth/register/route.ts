import { NextResponse, type NextRequest } from "next/server";
import { db } from "@/src/lib/db";
import {
  users,
  wallets,
  referralNodes,
  auditLogs,
} from "@/src/lib/db/schema";
import { registerSchema } from "@/src/lib/auth/validation";
import { hashPassword } from "@/src/lib/auth/password";
import { eq } from "drizzle-orm";
import crypto from "crypto";
import { checkRateLimit } from "@/src/lib/security/rateLimit";
import { getRequestMetadata } from "@/src/lib/security/request";
import { verifyTurnstile } from "@/src/lib/security/turnstile";

function generateReferralCode(): string {
  return "TM" + crypto.randomBytes(4).toString("hex").toUpperCase();
}

export async function POST(request: NextRequest) {
  try {
    const { ipAddress, userAgent } = getRequestMetadata(request);
    const rateLimit = await checkRateLimit({
      namespace: "auth:register",
      identifier: ipAddress,
      limit: 5,
      windowSeconds: 15 * 60,
    });
    if (!rateLimit.allowed) {
      return NextResponse.json(
        { success: false, message: "Too many registration attempts. Please try again later." },
        { status: 429 },
      );
    }

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
      turnstile_token,
    } = validationResult.data;

    if (!(await verifyTurnstile(turnstile_token, ipAddress))) {
      return NextResponse.json(
        { success: false, message: "Bot verification failed. Please try again." },
        { status: 400 },
      );
    }

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

    // 4. Execute creation within database transaction. Email verification is
    // temporarily disabled, so new accounts are activated immediately.
    const newUser = await db.transaction(async (tx) => {
      // 4a. Insert user
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
          status: "ACTIVE",
          kycStatus: "NOT_SUBMITTED",
          fundingStatus: "LOCKED",
          role: "USER",
        })
        .returning();

      // 4b. Create user wallet
      await tx.insert(wallets).values({
        userId: insertedUser.id,
        balance: "0.0000",
        availableBalance: "0.0000",
        totalWithdrawn: "0.0000",
        lifetimeEarnings: "0.0000",
      });

      // 4c. Build 10-level referral tree
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

      // 4d. Audit log
      await tx.insert(auditLogs).values({
        userId: insertedUser.id,
        action: "USER_REGISTER",
        ipAddress,
        userAgent,
        details: {
          email: normalizedEmail,
          referredBy: referrerId,
          emailVerificationRequired: false,
        },
      });

      return insertedUser;
    });

    const response = NextResponse.json(
      {
        success: true,
        message: "Registration successful. You can now sign in.",
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
        },
      },
      { status: 201 },
    );

    return response;
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
