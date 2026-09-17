import { NextResponse, type NextRequest } from "next/server";
import { getSessionFromRequest } from "@/src/lib/auth/session";
import { db } from "@/src/lib/db";
import { auditLogs, users, wallets } from "@/src/lib/db/schema";
import { eq } from "drizzle-orm";
import { profileUpdateSchema } from "@/src/lib/auth/validation";
import type { NewUser } from "@/src/lib/db/schema/users";
import { getRequestMetadata } from "@/src/lib/security/request";

export async function GET(request: NextRequest) {
  try {
    const session = await getSessionFromRequest(request);

    if (!session) {
      return NextResponse.json(
        {
          success: false,
          message: "Unauthenticated",
        },
        { status: 401 },
      );
    }

    const [user] = await db
      .select({
        id: users.id,
        first_name: users.firstName,
        last_name: users.lastName,
        email: users.email,
        phone_number: users.phoneNumber,
        country: users.country,
        telegram_handle: users.telegramHandle,
        roboforex_linked: users.roboforexLinked,
        roboforex_id: users.roboforexId,
        referral_code: users.referralCode,
        referred_by_id: users.referredById,
        status: users.status,
        kyc_status: users.kycStatus,
        funding_status: users.fundingStatus,
        role: users.role,
        created_at: users.createdAt,
        updated_at: users.updatedAt,
      })
      .from(users)
      .where(eq(users.id, session.userId))
      .limit(1);

    if (!user) {
      return NextResponse.json(
        {
          success: false,
          message: "User not found.",
        },
        { status: 404 },
      );
    }

    // Also get wallet summary
    const [wallet] = await db
      .select({
        balance: wallets.balance,
        available_balance: wallets.availableBalance,
        total_withdrawn: wallets.totalWithdrawn,
        lifetime_earnings: wallets.lifetimeEarnings,
      })
      .from(wallets)
      .where(eq(wallets.userId, user.id))
      .limit(1);

    return NextResponse.json(
      {
        success: true,
        data: {
          user,
          wallet: wallet || {
            balance: "0.0000",
            available_balance: "0.0000",
            total_withdrawn: "0.0000",
            lifetime_earnings: "0.0000",
          },
        },
      },
      { status: 200 },
    );
  } catch (error) {
    console.error("Error fetching current user profile:", error);
    return NextResponse.json(
      {
        success: false,
        message: "An unexpected error occurred.",
      },
      { status: 500 },
    );
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const session = await getSessionFromRequest(request);

    if (!session) {
      return NextResponse.json(
        {
          success: false,
          message: "Unauthenticated",
        },
        { status: 401 },
      );
    }

    const parsed = profileUpdateSchema.safeParse(
      await request.json().catch(() => ({})),
    );
    if (!parsed.success) {
      return NextResponse.json(
        { success: false, message: "Invalid profile update." },
        { status: 400 },
      );
    }
    const data = parsed.data;
    const updateData: Partial<NewUser> = {
      ...(data.first_name !== undefined && { firstName: data.first_name }),
      ...(data.last_name !== undefined && { lastName: data.last_name }),
      ...(data.phone_number !== undefined && { phoneNumber: data.phone_number }),
      ...(data.country !== undefined && { country: data.country }),
      ...(data.telegram_handle !== undefined && {
        telegramHandle: data.telegram_handle?.replace(/^@+/, "") || null,
      }),
      updatedAt: new Date(),
    };

    const { ipAddress, userAgent } = getRequestMetadata(request);
    const updatedUser = await db.transaction(async (tx) => {
      const [updated] = await tx
        .update(users)
        .set(updateData)
        .where(eq(users.id, session.userId))
        .returning({
          id: users.id,
          first_name: users.firstName,
          last_name: users.lastName,
          email: users.email,
          phone_number: users.phoneNumber,
          country: users.country,
          telegram_handle: users.telegramHandle,
          roboforex_linked: users.roboforexLinked,
          roboforex_id: users.roboforexId,
          referral_code: users.referralCode,
          referred_by_id: users.referredById,
          status: users.status,
          kyc_status: users.kycStatus,
          funding_status: users.fundingStatus,
          role: users.role,
          created_at: users.createdAt,
          updated_at: users.updatedAt,
        });
      await tx.insert(auditLogs).values({
        userId: session.userId,
        action: "PROFILE_UPDATE",
        ipAddress,
        userAgent,
        details: { fields: Object.keys(data) },
      });
      return updated;
    });

    return NextResponse.json(
      {
        success: true,
        message: "Profile updated successfully.",
        data: {
          user: updatedUser,
        },
      },
      { status: 200 },
    );
  } catch (error) {
    console.error("Error updating user profile:", error);
    return NextResponse.json(
      {
        success: false,
        message: "An unexpected error occurred while updating profile.",
      },
      { status: 500 },
    );
  }
}
