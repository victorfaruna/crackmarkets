import { NextResponse, type NextRequest } from "next/server";
import { db } from "@/src/lib/db";
import {
  users,
  wallets,
  referralNodes,
  binaryPlacements,
  auditLogs,
} from "@/src/lib/db/schema";
import { registerSchema } from "@/src/lib/auth/validation";
import { hashPassword } from "@/src/lib/auth/password";
import { eq, sql } from "drizzle-orm";
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
        .select({ id: users.id, status: users.status })
        .from(users)
        .where(eq(users.referralCode, referral_code.trim().toUpperCase()))
        .limit(1);

      if (!referrer || referrer.status !== "ACTIVE") {
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

      // Sponsorship drives commissions; binary placement drives the display.
      // Fill the first vacancy beneath this sponsor so every direct referral
      // remains visible in the sponsor's branch. Serialize concurrent signups.
      if (referrerId) {
        await tx.execute(sql`select pg_advisory_xact_lock(7461930)`);

        const [position] = await tx.execute<{
          parent_user_id: string;
          side: "LEFT" | "RIGHT";
        }>(sql`
          with recursive subtree as (
            select ${referrerId}::uuid as user_id, ''::text as path,
              0::integer as depth, array[${referrerId}::uuid] as visited
            union all
            select child.user_id,
              subtree.path || case child.side when 'LEFT' then '0' else '1' end,
              subtree.depth + 1, subtree.visited || child.user_id
            from binary_placements child
            join subtree on child.parent_user_id = subtree.user_id
            where not child.user_id = any(subtree.visited)
          )
          select subtree.user_id as parent_user_id,
            case when left_slot.user_id is null then 'LEFT' else 'RIGHT' end as side
          from subtree
          left join binary_placements left_slot
            on left_slot.parent_user_id = subtree.user_id and left_slot.side = 'LEFT'
          left join binary_placements right_slot
            on right_slot.parent_user_id = subtree.user_id and right_slot.side = 'RIGHT'
          where left_slot.user_id is null or right_slot.user_id is null
          order by subtree.depth, subtree.path
          limit 1
        `);
        if (!position) throw new Error("No binary position available");

        await tx.insert(binaryPlacements).values({
          userId: insertedUser.id,
          parentUserId: position.parent_user_id,
          side: position.side,
        });
      }

      // 4c. Build the closure links from direct parent pointers, not legacy
      // closure rows that may have been imported with incorrect depths.
      if (referrerId) {
        const ancestors = await tx.execute<{ id: string; depth: number }>(sql`
          with recursive chain as (
            select id, referred_by_id, 1::integer as depth
            from users where id = ${referrerId}
            union all
            select parent.id, parent.referred_by_id, chain.depth + 1
            from users parent
            inner join chain on chain.referred_by_id = parent.id
            where chain.depth < 10
          )
          select id, depth from chain
        `);
        await tx.insert(referralNodes).values(
          Array.from(ancestors, (ancestor) => ({
            ancestorId: ancestor.id,
            descendantId: insertedUser.id,
            depth: ancestor.depth,
          })),
        );
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
