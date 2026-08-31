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

    const body = await request.json().catch(() => ({}));
    const updateData: Record<string, any> = {};

    if (body.first_name !== undefined) {
      const fn = String(body.first_name).trim();
      if (!fn) {
        return NextResponse.json(
          { success: false, message: "First name cannot be empty." },
          { status: 400 },
        );
      }
      updateData.firstName = fn;
    }

    if (body.last_name !== undefined) {
      const ln = String(body.last_name).trim();
      if (!ln) {
        return NextResponse.json(
          { success: false, message: "Last name cannot be empty." },
          { status: 400 },
        );
      }
      updateData.lastName = ln;
    }

    if (body.phone_number !== undefined) {
      const pn = String(body.phone_number).trim();
      if (!pn) {
        return NextResponse.json(
          { success: false, message: "Phone number cannot be empty." },
          { status: 400 },
        );
      }
      updateData.phoneNumber = pn;
    }

    if (body.country !== undefined) {
      const c = String(body.country).trim();
      if (!c) {
        return NextResponse.json(
          { success: false, message: "Country cannot be empty." },
          { status: 400 },
        );
      }
      updateData.country = c;
    }

    if (body.telegram_handle !== undefined) {
      const th = String(body.telegram_handle || "")
        .trim()
        .replace(/^@+/, "");
      updateData.telegramHandle = th || null;
    }

    if (Object.keys(updateData).length === 0) {
      return NextResponse.json(
        { success: false, message: "No update fields provided." },
        { status: 400 },
      );
    }

    updateData.updatedAt = new Date();

    const [updatedUser] = await db
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

