import crypto from "crypto";
import { NextResponse, type NextRequest } from "next/server";
import { and, eq, gte, sql } from "drizzle-orm";
import { z } from "zod";
import { getSessionFromRequest } from "@/src/lib/auth/session";
import { withdrawalSchema } from "@/src/lib/auth/validation";
import { db } from "@/src/lib/db";
import { auditLogs, transactions, users, wallets } from "@/src/lib/db/schema";
import { getRequestMetadata } from "@/src/lib/security/request";

const idempotencyKeySchema = z.string().uuid();
const NETWORK_FEES: Record<string, number> = {
  TRC20: 1,
  BEP20: 0.5,
  ERC20: 3.5,
  SOL: 0.2,
};

class WithdrawalError extends Error {
  constructor(
    message: string,
    readonly status: number,
  ) {
    super(message);
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getSessionFromRequest(request);
    if (!session) {
      return NextResponse.json(
        { success: false, message: "Unauthenticated" },
        { status: 401 },
      );
    }

    const parsedBody = withdrawalSchema.safeParse(
      await request.json().catch(() => ({})),
    );
    const parsedKey = idempotencyKeySchema.safeParse(
      request.headers.get("idempotency-key"),
    );
    if (!parsedBody.success || !parsedKey.success) {
      return NextResponse.json(
        { success: false, message: "Invalid withdrawal request." },
        { status: 400 },
      );
    }

    const { amount, address, network } = parsedBody.data;
    const idempotencyKey = parsedKey.data;
    const fee = NETWORK_FEES[network];
    if (amount <= fee) {
      return NextResponse.json(
        { success: false, message: "Amount must be greater than the network fee." },
        { status: 400 },
      );
    }

    const [account] = await db
      .select({
        status: users.status,
        kycStatus: users.kycStatus,
        fundingStatus: users.fundingStatus,
        roboforexLinked: users.roboforexLinked,
      })
      .from(users)
      .where(eq(users.id, session.userId))
      .limit(1);

    if (!account || account.status !== "ACTIVE") {
      return NextResponse.json(
        { success: false, message: "An active account is required." },
        { status: 403 },
      );
    }
    if (account.kycStatus !== "APPROVED" || account.fundingStatus !== "UNLOCKED") {
      return NextResponse.json(
        { success: false, message: "Approved KYC and unlocked funding are required." },
        { status: 403 },
      );
    }
    if (!account.roboforexLinked) {
      return NextResponse.json(
        { success: false, message: "A verified broker account is required." },
        { status: 403 },
      );
    }

    const [existing] = await db
      .select({ id: transactions.id, status: transactions.status })
      .from(transactions)
      .where(
        and(
          eq(transactions.userId, session.userId),
          eq(transactions.idempotencyKey, idempotencyKey),
        ),
      )
      .limit(1);
    if (existing) {
      return NextResponse.json({
        success: true,
        message: "Withdrawal request already received.",
        data: { transaction: existing },
      });
    }

    const amountValue = amount.toFixed(4);
    const referenceId = `WTH-${crypto.randomUUID().replaceAll("-", "").slice(0, 16).toUpperCase()}`;
    const { ipAddress, userAgent } = getRequestMetadata(request);

    const result = await db.transaction(async (tx) => {
      const [updatedWallet] = await tx
        .update(wallets)
        .set({
          availableBalance: sql`${wallets.availableBalance} - ${amountValue}`,
          updatedAt: new Date(),
        })
        .where(
          and(
            eq(wallets.userId, session.userId),
            gte(wallets.availableBalance, amountValue),
          ),
        )
        .returning({
          balance: wallets.balance,
          availableBalance: wallets.availableBalance,
          totalWithdrawn: wallets.totalWithdrawn,
          lifetimeEarnings: wallets.lifetimeEarnings,
        });

      if (!updatedWallet) {
        throw new WithdrawalError("Insufficient available commission balance.", 409);
      }

      const [transaction] = await tx
        .insert(transactions)
        .values({
          userId: session.userId,
          amount: amountValue,
          transactionType: "WITHDRAWAL",
          referenceId,
          status: "PENDING",
          idempotencyKey,
          metadata: {
            network,
            destinationAddress: address,
            networkFee: fee.toFixed(4),
          },
        })
        .returning({
          id: transactions.id,
          amount: transactions.amount,
          referenceId: transactions.referenceId,
          status: transactions.status,
          createdAt: transactions.createdAt,
        });

      await tx.insert(auditLogs).values({
        userId: session.userId,
        action: "WITHDRAWAL_REQUEST",
        ipAddress,
        userAgent,
        details: { transactionId: transaction.id, referenceId, network },
      });

      return { updatedWallet, transaction };
    });

    return NextResponse.json(
      {
        success: true,
        message: "Withdrawal request submitted for processing.",
        data: {
          transaction: result.transaction,
          wallet: {
            balance: result.updatedWallet.balance,
            available_balance: result.updatedWallet.availableBalance,
            total_withdrawn: result.updatedWallet.totalWithdrawn,
            lifetime_earnings: result.updatedWallet.lifetimeEarnings,
          },
        },
      },
      { status: 202 },
    );
  } catch (error) {
    if (error instanceof WithdrawalError) {
      return NextResponse.json(
        { success: false, message: error.message },
        { status: error.status },
      );
    }
    console.error("[WITHDRAWAL_REQUEST_ERROR]", error);
    return NextResponse.json(
      { success: false, message: "Unable to submit withdrawal request." },
      { status: 500 },
    );
  }
}
