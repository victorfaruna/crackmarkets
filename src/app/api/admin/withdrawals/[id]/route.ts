import { NextResponse, type NextRequest } from "next/server";
import { and, eq, sql } from "drizzle-orm";
import { z } from "zod";
import { getAdminFromRequest } from "@/src/lib/auth/admin";
import { adminWithdrawalActionSchema } from "@/src/lib/auth/admin-validation";
import { db } from "@/src/lib/db";
import { auditLogs, transactions, wallets } from "@/src/lib/db/schema";
import { getRequestMetadata } from "@/src/lib/security/request";

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const admin = await getAdminFromRequest(request);
    if (!admin) {
      return NextResponse.json(
        { success: false, message: "Administrator access required." },
        { status: 401 },
      );
    }

    const parsedId = z.string().uuid().safeParse((await params).id);
    const parsedBody = adminWithdrawalActionSchema.safeParse(
      await request.json().catch(() => ({})),
    );
    if (!parsedId.success || !parsedBody.success) {
      return NextResponse.json(
        { success: false, message: "A reversal reason is required." },
        { status: 400 },
      );
    }

    const [withdrawal] = await db
      .select({
        id: transactions.id,
        userId: transactions.userId,
        amount: transactions.amount,
        status: transactions.status,
        transactionType: transactions.transactionType,
        referenceId: transactions.referenceId,
      })
      .from(transactions)
      .where(eq(transactions.id, parsedId.data))
      .limit(1);
    if (!withdrawal || withdrawal.transactionType !== "WITHDRAWAL") {
      return NextResponse.json(
        { success: false, message: "Withdrawal not found." },
        { status: 404 },
      );
    }
    if (withdrawal.status !== "PENDING") {
      return NextResponse.json(
        { success: false, message: "Only pending withdrawals can be reversed." },
        { status: 409 },
      );
    }

    const { ipAddress, userAgent } = getRequestMetadata(request);
    const reversed = await db.transaction(async (tx) => {
      const [record] = await tx
        .update(transactions)
        .set({ status: "REVERSED" })
        .where(
          and(
            eq(transactions.id, withdrawal.id),
            eq(transactions.status, "PENDING"),
          ),
        )
        .returning({ id: transactions.id, status: transactions.status });
      if (!record) return null;

      const [wallet] = await tx
        .update(wallets)
        .set({
          availableBalance: sql`${wallets.availableBalance} + ${withdrawal.amount}`,
          updatedAt: new Date(),
        })
        .where(eq(wallets.userId, withdrawal.userId))
        .returning({ id: wallets.id });
      if (!wallet) {
        throw new Error("Withdrawal wallet not found.");
      }

      await tx.insert(auditLogs).values({
        userId: admin.id,
        action: "ADMIN_WITHDRAWAL_REVERSED",
        ipAddress,
        userAgent,
        details: {
          targetUserId: withdrawal.userId,
          transactionId: withdrawal.id,
          referenceId: withdrawal.referenceId,
          amount: withdrawal.amount,
          reason: parsedBody.data.reason,
        },
      });
      return record;
    });

    if (!reversed) {
      return NextResponse.json(
        { success: false, message: "Withdrawal was already processed." },
        { status: 409 },
      );
    }

    return NextResponse.json({
      success: true,
      message: "Withdrawal reversed and reserved funds returned.",
      data: reversed,
    });
  } catch (error) {
    console.error("Admin withdrawal reversal error:", error);
    return NextResponse.json(
      { success: false, message: "Unable to reverse the withdrawal." },
      { status: 500 },
    );
  }
}
