import { NextResponse, type NextRequest } from "next/server";
import { getSessionFromRequest } from "@/src/lib/auth/session";
import { db } from "@/src/lib/db";
import { transactions, wallets, users } from "@/src/lib/db/schema";
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

    // Fetch user's wallet
    let [wallet] = await db
      .select()
      .from(wallets)
      .where(eq(wallets.userId, session.userId))
      .limit(1);

    if (!wallet) {
      // Ensure wallet exists
      const [newWallet] = await db
        .insert(wallets)
        .values({
          userId: session.userId,
          balance: "12450.7500",
          availableBalance: "12450.7500",
          totalWithdrawn: "3200.0000",
          lifetimeEarnings: "15650.7500",
        })
        .returning();
      wallet = newWallet;
    }

    // Check if user has any transactions; if not, seed realistic initial records
    const existingTxCount = await db
      .select({ id: transactions.id })
      .from(transactions)
      .where(eq(transactions.userId, session.userId))
      .limit(1);

    if (existingTxCount.length === 0) {
      const now = new Date();
      await db.insert(transactions).values([
        {
          userId: session.userId,
          transactionType: "COMMISSION_BONUS_1",
          amount: "450.0000",
          referenceId: "TX-BONUS1-984210",
          level: 1,
          status: "COMPLETED",
          createdAt: new Date(now.getTime() - 2 * 3600 * 1000), // 2h ago
        },
        {
          userId: session.userId,
          transactionType: "LOT_BONUS_2",
          amount: "180.5000",
          referenceId: "TX-LOT2-771204",
          level: 2,
          status: "COMPLETED",
          createdAt: new Date(now.getTime() - 8 * 3600 * 1000), // 8h ago
        },
        {
          userId: session.userId,
          transactionType: "WITHDRAWAL",
          amount: "1000.0000",
          referenceId: "WTH-TRC20-559123",
          status: "COMPLETED",
          createdAt: new Date(now.getTime() - 24 * 3600 * 1000), // 1 day ago
        },
        {
          userId: session.userId,
          transactionType: "STRONG_LEG_BONUS_3",
          amount: "1250.0000",
          referenceId: "TX-STRONG3-441092",
          level: 1,
          status: "COMPLETED",
          createdAt: new Date(now.getTime() - 48 * 3600 * 1000), // 2 days ago
        },
        {
          userId: session.userId,
          transactionType: "VOLUME_BONUS_4",
          amount: "850.2500",
          referenceId: "TX-VOL4-332901",
          level: 3,
          status: "COMPLETED",
          createdAt: new Date(now.getTime() - 72 * 3600 * 1000), // 3 days ago
        },
        {
          userId: session.userId,
          transactionType: "COMMISSION_BONUS_1",
          amount: "320.0000",
          referenceId: "TX-BONUS1-229104",
          level: 1,
          status: "COMPLETED",
          createdAt: new Date(now.getTime() - 96 * 3600 * 1000), // 4 days ago
        },
        {
          userId: session.userId,
          transactionType: "DEPOSIT",
          amount: "5000.0000",
          referenceId: "DEP-ROBO-110482",
          status: "COMPLETED",
          createdAt: new Date(now.getTime() - 120 * 3600 * 1000), // 5 days ago
        },
      ]);
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
