import { NextResponse, type NextRequest } from "next/server";
import { getSessionFromRequest } from "@/src/lib/auth/session";
import { db } from "@/src/lib/db";
import { transactions, wallets } from "@/src/lib/db/schema";
import { eq, and, desc, SQL, ilike, or } from "drizzle-orm";
import { z } from "zod";

const transactionQuerySchema = z
  .object({
    type: z.enum(["ALL", "COMMISSION", "WITHDRAWAL", "DEPOSIT"]).optional(),
    status: z.enum(["ALL", "COMPLETED", "PENDING", "FAILED", "REVERSED"]).optional(),
    search: z.string().trim().max(255).optional(),
  })
  .strict();

export async function GET(request: NextRequest) {
  try {
    const session = await getSessionFromRequest(request);

    if (!session) {
      return NextResponse.json(
        { success: false, message: "Unauthenticated" },
        { status: 401 },
      );
    }

    const parsed = transactionQuerySchema.safeParse(
      Object.fromEntries(request.nextUrl.searchParams.entries()),
    );
    if (!parsed.success) {
      return NextResponse.json(
        { success: false, message: "Invalid transaction filters." },
        { status: 400 },
      );
    }
    const { type, status, search } = parsed.data;

    // Fetch user's real wallet from database
    const [wallet] = await db
      .select()
      .from(wallets)
      .where(eq(wallets.userId, session.userId))
      .limit(1);

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
          balance: wallet?.balance || "0.0000",
          available_balance: wallet?.availableBalance || "0.0000",
          total_withdrawn: wallet?.totalWithdrawn || "0.0000",
          lifetime_earnings: wallet?.lifetimeEarnings || "0.0000",
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
