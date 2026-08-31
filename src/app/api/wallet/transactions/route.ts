import { NextResponse, type NextRequest } from "next/server";
import { getSessionFromRequest } from "@/src/lib/auth/session";
import { db } from "@/src/lib/db";
import { transactions, wallets } from "@/src/lib/db/schema";
import { eq, and, desc, SQL, ilike, or } from "drizzle-orm";

export async function GET(request: NextRequest) {
  try {
    const session = await getSessionFromRequest(request);

    if (!session) {
      return NextResponse.json(
        { success: false, message: "Unauthenticated" },
        { status: 401 },
      );
    }

    const { searchParams } = new URL(request.url);
    const type = searchParams.get("type"); // "ALL" | "COMMISSION" | "WITHDRAWAL" | "DEPOSIT"
    const status = searchParams.get("status"); // "ALL" | "COMPLETED" | "PENDING" | "FAILED"
    const search = searchParams.get("search");

    // Fetch user's real wallet from database
    let [wallet] = await db
      .select()
      .from(wallets)
      .where(eq(wallets.userId, session.userId))
      .limit(1);

    if (!wallet) {
      const [newWallet] = await db
        .insert(wallets)
        .values({
          userId: session.userId,
          balance: "0.0000",
          availableBalance: "0.0000",
          totalWithdrawn: "0.0000",
          lifetimeEarnings: "0.0000",
        })
        .returning();
      wallet = newWallet;
    }

    const conditions: SQL[] = [eq(transactions.userId, session.userId)];

    // Type filtering
    if (type && type !== "ALL") {
      if (type === "COMMISSION") {
        conditions.push(
          or(
            eq(transactions.transactionType, "COMMISSION_BONUS_1"),
            eq(transactions.transactionType, "LOT_BONUS_2"),
            eq(transactions.transactionType, "STRONG_LEG_BONUS_3"),
            eq(transactions.transactionType, "VOLUME_BONUS_4"),
            eq(transactions.transactionType, "LEADERSHIP_REWARD"),
          )!,
        );
      } else {
        conditions.push(eq(transactions.transactionType, type.toUpperCase()));
      }
    }

    // Status filtering
    if (status && status !== "ALL") {
      conditions.push(eq(transactions.status, status.toUpperCase()));
    }

    // Search by referenceId
    if (search && search.trim()) {
      conditions.push(ilike(transactions.referenceId, `%${search.trim()}%`));
    }

    // Query real user transactions from the database
    const txList = await db
      .select({
        id: transactions.id,
        user_id: transactions.userId,
        source_user_id: transactions.sourceUserId,
        amount: transactions.amount,
        transaction_type: transactions.transactionType,
        reference_id: transactions.referenceId,
        level: transactions.level,
        status: transactions.status,
        created_at: transactions.createdAt,
      })
      .from(transactions)
      .where(and(...conditions))
      .orderBy(desc(transactions.createdAt));

    return NextResponse.json({
      success: true,
      data: {
        wallet: {
          balance: wallet.balance,
          available_balance: wallet.availableBalance,
          total_withdrawn: wallet.totalWithdrawn,
          lifetime_earnings: wallet.lifetimeEarnings,
        },
        transactions: txList,
        total: txList.length,
      },
    });
  } catch (error) {
    console.error("Error fetching transactions:", error);
    return NextResponse.json(
      {
        success: false,
        message: "An unexpected error occurred while fetching transactions.",
      },
      { status: 500 },
    );
  }
}
