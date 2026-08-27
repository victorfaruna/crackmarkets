import { NextResponse, type NextRequest } from "next/server";
import { getSessionFromRequest } from "@/src/lib/auth/session";
import { db } from "@/src/lib/db";
import { users, wallets } from "@/src/lib/db/schema";
import { eq } from "drizzle-orm";

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
