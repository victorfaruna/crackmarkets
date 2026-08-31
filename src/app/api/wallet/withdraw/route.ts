import { NextResponse, type NextRequest } from "next/server";
import { getSessionFromRequest } from "@/src/lib/auth/session";
import { db } from "@/src/lib/db";
import { transactions, wallets } from "@/src/lib/db/schema";
import { eq } from "drizzle-orm";

export async function POST(request: NextRequest) {
  try {
    const session = await getSessionFromRequest(request);

    if (!session) {
      return NextResponse.json(
        { success: false, message: "Unauthenticated" },
        { status: 401 },
      );
    }

    const body = await request.json().catch(() => ({}));
    const { amount, address, network } = body;

    const numAmount = parseFloat(amount);
    if (isNaN(numAmount) || numAmount <= 0) {
      return NextResponse.json(
        { success: false, message: "Please enter a valid withdrawal amount." },
        { status: 400 },
      );
    }

    if (!address || typeof address !== "string" || !address.trim()) {
      return NextResponse.json(
        { success: false, message: "Please provide a valid recipient wallet address." },
        { status: 400 },
      );
    }

    // Fetch user wallet
    const [wallet] = await db
      .select()
      .from(wallets)
      .where(eq(wallets.userId, session.userId))
      .limit(1);

    if (!wallet) {
      return NextResponse.json(
        { success: false, message: "Wallet not found." },
        { status: 404 },
      );
    }

    const curAvailable = parseFloat(wallet.availableBalance || "0");
    if (numAmount > curAvailable) {
      return NextResponse.json(
        { success: false, message: "Insufficient available commission balance." },
        { status: 400 },
      );
    }

    // Atomic transaction: deduct available balance, increase total withdrawn, create transaction
    const newAvailable = (curAvailable - numAmount).toFixed(4);
    const curWithdrawn = parseFloat(wallet.totalWithdrawn || "0");
    const newWithdrawn = (curWithdrawn + numAmount).toFixed(4);

    const refId = `WTH-${(network || "USDT").toUpperCase()}-${Math.floor(100000 + Math.random() * 900000)}`;

    const result = await db.transaction(async (tx) => {
      const [updatedWallet] = await tx
        .update(wallets)
        .set({
          availableBalance: newAvailable,
          totalWithdrawn: newWithdrawn,
          updatedAt: new Date(),
        })
        .where(eq(wallets.userId, session.userId))
        .returning();

      const [newTx] = await tx
        .insert(transactions)
        .values({
          userId: session.userId,
          amount: numAmount.toFixed(4),
          transactionType: "WITHDRAWAL",
          referenceId: refId,
          status: "COMPLETED",
        })
        .returning();

      return { updatedWallet, newTx };
    });

    return NextResponse.json({
      success: true,
      message: "Withdrawal processed successfully.",
      data: {
        transaction: result.newTx,
        wallet: {
          balance: result.updatedWallet.balance,
          available_balance: result.updatedWallet.availableBalance,
          total_withdrawn: result.updatedWallet.totalWithdrawn,
          lifetime_earnings: result.updatedWallet.lifetimeEarnings,
        },
      },
    });
  } catch (error) {
    console.error("Error processing withdrawal:", error);
    return NextResponse.json(
      {
        success: false,
        message: "An error occurred while processing withdrawal.",
      },
      { status: 500 },
    );
  }
}
