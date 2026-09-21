import { NextResponse, type NextRequest } from "next/server";
import { desc, eq, inArray } from "drizzle-orm";
import { getSessionFromRequest } from "@/src/lib/auth/session";
import { db } from "@/src/lib/db";
import { transactions, users, wallets } from "@/src/lib/db/schema";
import { getReferralLineage } from "@/src/lib/referrals/lineage";
import type {
  CommissionTransactionType,
  DashboardSummary,
} from "@/src/lib/services/dashboard";

const LEVEL_RATES: Record<number, { percent: number; lot: number }> = {
  1: { percent: 5, lot: 2 },
  2: { percent: 4, lot: 2 },
  3: { percent: 3, lot: 2 },
  4: { percent: 2, lot: 1 },
  5: { percent: 2, lot: 0.5 },
  6: { percent: 2, lot: 0.5 },
  7: { percent: 2, lot: 0.5 },
  8: { percent: 2, lot: 0.5 },
  9: { percent: 2, lot: 0.5 },
  10: { percent: 1, lot: 0.5 },
};

const LADDER = [
  [10_000, 1],
  [50_000, 2],
  [200_000, 3.5],
  [1_000_000, 5],
  [3_500_000, 5.5],
  [8_000_000, 6],
  [15_000_000, 6.5],
  [30_000_000, 7],
  [50_000_000, 8],
] as const;

function mapTransactionType(value: string): CommissionTransactionType {
  switch (value) {
    case "LOT_BONUS_2":
      return "LOT_BONUS";
    case "STRONG_LEG_BONUS_3":
      return "STRONG_LEG_BONUS";
    case "VOLUME_BONUS_4":
      return "LADDER_BONUS";
    case "LEADERSHIP_REWARD":
      return "LEADERSHIP_REWARD";
    case "WITHDRAWAL":
      return "WITHDRAWAL";
    default:
      return "REFERRAL_PROFIT";
  }
}

export async function GET(request: NextRequest) {
  try {
    const session = await getSessionFromRequest(request);
    if (!session) {
      return NextResponse.json(
        { success: false, message: "Unauthenticated" },
        { status: 401 },
      );
    }

    const [user] = await db
      .select({
        id: users.id,
        roboforexId: users.roboforexId,
        roboforexLinked: users.roboforexLinked,
      })
      .from(users)
      .where(eq(users.id, session.userId))
      .limit(1);
    if (!user) {
      return NextResponse.json(
        { success: false, message: "User not found" },
        { status: 404 },
      );
    }

    const [userWallet, userTransactions, downlineRows] = await Promise.all([
      db
        .select({
          availableBalance: wallets.availableBalance,
          lifetimeEarnings: wallets.lifetimeEarnings,
          totalWithdrawn: wallets.totalWithdrawn,
        })
        .from(wallets)
        .where(eq(wallets.userId, session.userId))
        .limit(1),
      db
        .select()
        .from(transactions)
        .where(eq(transactions.userId, session.userId))
        .orderBy(desc(transactions.createdAt)),
      getReferralLineage(session.userId),
    ]);

    const downlineUsers = downlineRows.length
      ? await db
          .select({ id: users.id, status: users.status })
          .from(users)
          .where(inArray(users.id, downlineRows.map((row) => row.id)))
      : [];
    const statusById = new Map(downlineUsers.map((row) => [row.id, row.status]));

    const wallet = userWallet[0];
    const completedTransactions = userTransactions.filter(
      (transaction) => transaction.status === "COMPLETED",
    );
    const sumType = (type: string) =>
      completedTransactions
        .filter((transaction) => transaction.transactionType === type)
        .reduce((sum, transaction) => sum + Number(transaction.amount), 0);

    // Broker-derived volume fields intentionally remain zero until a verified
    // broker sync writes authoritative data to the platform.
    const totalTeamVolume = 0;
    const levels = Array.from({ length: 10 }, (_, index) => {
      const level = index + 1;
      const members = downlineRows.filter((row) => row.depth === level);
      return {
        level,
        ratePercent: LEVEL_RATES[level].percent,
        lotRate: LEVEL_RATES[level].lot,
        membersCount: members.length,
        activeTradersCount: members.filter((row) => statusById.get(row.id) === "ACTIVE").length,
        teamDeposits: 0,
        totalVolume: 0,
        lotsTraded: 0,
        commissionEarned: completedTransactions
          .filter((transaction) => transaction.level === level)
          .reduce((sum, transaction) => sum + Number(transaction.amount), 0),
      };
    });

    const summary: DashboardSummary = {
      financialStats: {
        totalTradingCapital: 0,
        totalTradingProfit: 0,
        totalReferralProfit: sumType("COMMISSION_BONUS_1"),
        totalLotBonus: sumType("LOT_BONUS_2"),
        availableBalance: Number(wallet?.availableBalance || 0),
        lifetimeEarnings: Number(wallet?.lifetimeEarnings || 0),
        totalWithdrawn: Number(wallet?.totalWithdrawn || 0),
      },
      tradingMetrics: {
        todayProfit: 0,
        weeklyProfit: 0,
        monthlyProfit: 0,
        totalTradingVolume: 0,
        totalLotsTraded: 0,
        openPositionsCount: 0,
        lastSyncedAt: null,
        dataAvailable: false,
        brokerAccount: {
          accountId: user.roboforexId,
          server: null,
          brokerName: "RoboForex",
          status: user.roboforexLinked ? "CONNECTED" : "DISCONNECTED",
          balance: 0,
          equity: 0,
          margin: 0,
          freeMargin: 0,
        },
      },
      referralTree: {
        totalTraders: downlineRows.length,
        activeTraders: downlineRows.filter((row) => statusById.get(row.id) === "ACTIVE").length,
        totalTeamDeposits: 0,
        strongLegVolume: 0,
        weakLegVolume: 0,
        levels,
      },
      qualificationLadder: {
        currentTier: 0,
        currentPercentage: 0,
        totalVolume: totalTeamVolume,
        strongLegTier1Qualified: false,
        strongLegTier2Qualified: false,
        tiers: LADDER.map(([volumeRequired, percentage], index) => ({
          level: index + 1,
          volumeRequired,
          percentage,
          isUnlocked: false,
          currentVolume: totalTeamVolume,
        })),
      },
      leadershipPools: [
        ["travel-benefit", "Travel Benefit", "$2,000 Cash or Travel Vacation", 2_000, 3],
        ["leader-pool-1", "Leader Pool 1", "Family Luxury Trip up to $15,000", 15_000, 2],
        ["leader-pool-2", "Leader Pool 2", "Luxury Car up to $25,000", 25_000, 2],
        ["grand-estate", "Grand Prize Estate", "Estate up to $1,200,000", 1_200_000, 6],
      ].map(([id, title, rewardDescription, maxRewardValue, months]) => ({
        id: String(id),
        title: String(title),
        rewardDescription: String(rewardDescription),
        maxRewardValue: Number(maxRewardValue),
        qualificationCriteria: "Awaiting authoritative broker volume data",
        consecutiveMonthsRequired: Number(months),
        currentStreakMonths: 0,
        isQualified: false,
      })),
      recentTransactions: userTransactions.slice(0, 10).map((transaction) => ({
        id: transaction.id,
        amount: Number(transaction.amount),
        type: mapTransactionType(transaction.transactionType),
        level: transaction.level || undefined,
        referenceId: transaction.referenceId || `TX-${transaction.id.slice(0, 8)}`,
        status:
          transaction.status === "COMPLETED" ||
          transaction.status === "PENDING" ||
          transaction.status === "FAILED" ||
          transaction.status === "REVERSED"
            ? transaction.status
            : "PROCESSING",
        createdAt: transaction.createdAt.toISOString(),
      })),
    };

    return NextResponse.json({ success: true, data: summary });
  } catch (error) {
    console.error("[DASHBOARD_SUMMARY_ERROR]", error);
    return NextResponse.json(
      { success: false, message: "Failed to generate dashboard summary" },
      { status: 500 },
    );
  }
}
