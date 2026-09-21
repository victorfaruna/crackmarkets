import { NextResponse, type NextRequest } from "next/server";
import { getSessionFromRequest } from "@/src/lib/auth/session";
import { db } from "@/src/lib/db";
import { transactions } from "@/src/lib/db/schema";
import { eq, and, desc, or } from "drizzle-orm";
import { z } from "zod";
import { decimalUnits, formatUnits } from "@/src/lib/commissions/calculations";

const commissionsQuerySchema = z
  .object({
    timeframe: z.enum(["weekly", "monthly", "all time"]).optional(),
    month: z.string().regex(/^\d{4}-(0[1-9]|1[0-2])$/).optional(),
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

    const parsed = commissionsQuerySchema.safeParse(
      Object.fromEntries(request.nextUrl.searchParams.entries()),
    );
    if (!parsed.success) {
      return NextResponse.json(
        { success: false, message: "Invalid commission filters." },
        { status: 400 },
      );
    }
    const timeframe = parsed.data.timeframe || "monthly";
    const month = parsed.data.month;

    const now = new Date();

    // Query all commissions for this user to compute preview indicators accurately
    const allCommissionTxs = await db
      .select({
        id: transactions.id,
        user_id: transactions.userId,
        source_user_id: transactions.sourceUserId,
        amount: transactions.amount,
        transaction_type: transactions.transactionType,
        reference_id: transactions.referenceId,
        level: transactions.level,
        status: transactions.status,
        metadata: transactions.metadata,
        created_at: transactions.createdAt,
      })
      .from(transactions)
      .where(
        and(
          eq(transactions.userId, session.userId),
          eq(transactions.status, "COMPLETED"),
          or(
            eq(transactions.transactionType, "COMMISSION_BONUS_1"),
            eq(transactions.transactionType, "LOT_BONUS_2"),
            eq(transactions.transactionType, "STRONG_LEG_BONUS_3"),
            eq(transactions.transactionType, "VOLUME_BONUS_4"),
            eq(transactions.transactionType, "LEADERSHIP_REWARD"),
          )!,
        ),
      )
      .orderBy(desc(transactions.createdAt));

    // Weekly cards use the trailing seven days. The monthly card and selected
    // ledger use the chosen UTC month, or the current UTC month by default.
    const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    const [year, monthIndex] = month
      ? month.split("-").map(Number)
      : [now.getUTCFullYear(), now.getUTCMonth() + 1];
    const startOfMonth = new Date(Date.UTC(year, monthIndex - 1, 1));
    const startOfNextMonth = new Date(Date.UTC(year, monthIndex, 1));
    const inSelectedMonth = (date: Date) =>
      date >= startOfMonth && date < startOfNextMonth;
    let weeklyProfitShare = 0n;
    let weeklyLotCommission = 0n;
    let monthlyVolumePools = 0n;

    allCommissionTxs.forEach((tx) => {
      const amt = decimalUnits(tx.amount);
      const txDate = new Date(tx.created_at);

      if (txDate >= sevenDaysAgo) {
        if (tx.transaction_type === "COMMISSION_BONUS_1") {
          weeklyProfitShare += amt;
        }
        if (tx.transaction_type === "LOT_BONUS_2") {
          weeklyLotCommission += amt;
        }
      }

      if (
        inSelectedMonth(txDate) &&
        ["STRONG_LEG_BONUS_3", "VOLUME_BONUS_4", "LEADERSHIP_REWARD"].includes(
          tx.transaction_type,
        )
      ) {
        monthlyVolumePools += amt;
      }
    });

    // Filter transactions based on selected timeframe
    let filteredTxs = allCommissionTxs;

    if (timeframe === "weekly") {
      filteredTxs = allCommissionTxs.filter(
        (tx) => new Date(tx.created_at) >= sevenDaysAgo,
      );
    } else if (timeframe === "monthly") {
      filteredTxs = allCommissionTxs.filter((tx) =>
        inSelectedMonth(new Date(tx.created_at)),
      );
    }

    const activeSet = filteredTxs;

    // Calculate streams from activeSet
    let profitShareTotal = 0n;
    let profitShareCount = 0;

    let lotCommissionTotal = 0n;
    let lotCommissionCount = 0;

    let strongLegTotal = 0n;
    let strongLegCount = 0;

    let volumeLadderTotal = 0n;
    let volumeLadderCount = 0;

    let leaderPool1Total = 0n;
    let leaderPool1Count = 0;
    let leaderPool2Total = 0n;
    let leaderPool2Count = 0;
    let grandEstateTotal = 0n;
    let grandEstateCount = 0;
    let travelBenefitTotal = 0n;
    let travelBenefitCount = 0;
    let otherLeadershipTotal = 0n;
    let otherLeadershipCount = 0;

    activeSet.forEach((tx) => {
      const amt = decimalUnits(tx.amount);
      switch (tx.transaction_type) {
        case "COMMISSION_BONUS_1":
          profitShareTotal += amt;
          profitShareCount++;
          break;
        case "LOT_BONUS_2":
          lotCommissionTotal += amt;
          lotCommissionCount++;
          break;
        case "STRONG_LEG_BONUS_3":
          strongLegTotal += amt;
          strongLegCount++;
          break;
        case "VOLUME_BONUS_4":
          volumeLadderTotal += amt;
          volumeLadderCount++;
          break;
        case "LEADERSHIP_REWARD":
          const rewardMetadata =
            tx.metadata &&
            typeof tx.metadata === "object" &&
            !Array.isArray(tx.metadata)
              ? (tx.metadata as Record<string, unknown>)
              : {};
          const rewardType =
            typeof rewardMetadata.rewardType === "string"
              ? rewardMetadata.rewardType
              : null;
          if (rewardType === "LEADER_POOL_1") {
            leaderPool1Total += amt;
            leaderPool1Count++;
          } else if (rewardType === "LEADER_POOL_2") {
            leaderPool2Total += amt;
            leaderPool2Count++;
          } else if (rewardType === "GRAND_ESTATE") {
            grandEstateTotal += amt;
            grandEstateCount++;
          } else if (rewardType === "TRAVEL_BENEFIT") {
            travelBenefitTotal += amt;
            travelBenefitCount++;
          } else {
            otherLeadershipTotal += amt;
            otherLeadershipCount++;
          }
          break;
      }
    });

    const totalCommissions =
      profitShareTotal +
      lotCommissionTotal +
      strongLegTotal +
      volumeLadderTotal +
      leaderPool1Total +
      leaderPool2Total +
      grandEstateTotal +
      travelBenefitTotal +
      otherLeadershipTotal;

    const calcPercent = (val: bigint) =>
      totalCommissions > 0n
        ? (Number((val * 1_000n + totalCommissions / 2n) / totalCommissions) / 10).toFixed(1)
        : "0.0";

    const streams = [
      {
        id: "lot-commission",
        name: "Lot Commissions",
        bonusCode: "Bonus 2",
        frequency: "Weekly",
        count: lotCommissionCount,
        amount: formatUnits(lotCommissionTotal),
        percentage: calcPercent(lotCommissionTotal),
        dotColor: "bg-accent",
        description: "$2.00/lot (L1-L3), $1.00/lot (L4), $0.50/lot (L5-L10)",
      },
      {
        id: "profit-share",
        name: "Profit Share",
        bonusCode: "Bonus 1",
        frequency: "Weekly",
        count: profitShareCount,
        amount: formatUnits(profitShareTotal),
        percentage: calcPercent(profitShareTotal),
        dotColor: "bg-success",
        description: "5% L1 down to 1% L10 on downline trading profits",
      },
      {
        id: "strong-leg",
        name: "Team Volume (Strong Leg)",
        bonusCode: "Bonus 3",
        frequency: "Monthly",
        count: strongLegCount,
        amount: formatUnits(strongLegTotal),
        percentage: calcPercent(strongLegTotal),
        dotColor: "bg-secondary",
        description: "$1 x Strong Leg Lots for volume >= $500k",
      },
      {
        id: "volume-ladder",
        name: "Percentage Volume Ladder",
        bonusCode: "Bonus 4",
        frequency: "Monthly",
        count: volumeLadderCount,
        amount: formatUnits(volumeLadderTotal),
        percentage: calcPercent(volumeLadderTotal),
        dotColor: "bg-error",
        description: "1% to 8% team trading volume bonus ladder",
      },
      {
        id: "leader-pool-1",
        name: "Leader Pool 1 (Vacation)",
        bonusCode: "Bonus 5",
        frequency: "Monthly",
        count: leaderPool1Count,
        amount: formatUnits(leaderPool1Total),
        percentage: calcPercent(leaderPool1Total),
        dotColor: "bg-accent",
        description: "Family luxury trip for 2 consecutive qualification months",
      },
      {
        id: "leader-pool-2",
        name: "Leader Pool 2 (Luxury Car)",
        bonusCode: "Bonus 5",
        frequency: "Monthly",
        count: leaderPool2Count,
        amount: formatUnits(leaderPool2Total),
        percentage: calcPercent(leaderPool2Total),
        dotColor: "bg-success",
        description: "Car incentive reward for 2 consecutive qualification months",
      },
      {
        id: "grand-estate",
        name: "Grand Prize Estate Pool",
        bonusCode: "Bonus 5",
        frequency: "Monthly",
        count: grandEstateCount,
        amount: formatUnits(grandEstateTotal),
        percentage: calcPercent(grandEstateTotal),
        dotColor: "bg-secondary",
        description: "Estate prize pool for 6 months sustained qualification",
      },
      {
        id: "travel-benefit",
        name: "Travel Benefit Streak",
        bonusCode: "Bonus 5",
        frequency: "Monthly",
        count: travelBenefitCount,
        amount: formatUnits(travelBenefitTotal),
        percentage: calcPercent(travelBenefitTotal),
        dotColor: "bg-error",
        description: "$50,000 monthly team deposits for 3 consecutive months",
      },
      ...(otherLeadershipCount
        ? [{
            id: "other-leadership",
            name: "Other Leadership Rewards",
            bonusCode: "Bonus 5",
            frequency: "Monthly",
            count: otherLeadershipCount,
            amount: formatUnits(otherLeadershipTotal),
            percentage: calcPercent(otherLeadershipTotal),
            dotColor: "bg-subtext",
            description: "Leadership rewards without a specific pool classification",
          }]
        : []),
    ];

    const preview = {
      profitShareWeekly: formatUnits(weeklyProfitShare),
      lotCommissionWeekly: formatUnits(weeklyLotCommission),
      cpaMonthly: formatUnits(monthlyVolumePools),
      totalCommissions: formatUnits(totalCommissions),
    };

    return NextResponse.json({
      success: true,
      data: {
        preview,
        streams,
        transactions: activeSet.map((transaction) => ({
          id: transaction.id,
          user_id: transaction.user_id,
          source_user_id: transaction.source_user_id,
          amount: transaction.amount,
          transaction_type: transaction.transaction_type,
          reference_id: transaction.reference_id,
          level: transaction.level,
          status: transaction.status,
          created_at: transaction.created_at,
        })),
        total: activeSet.length,
      },
    });
  } catch (error) {
    console.error("Error fetching commissions summary:", error);
    return NextResponse.json(
      {
        success: false,
        message: "An unexpected error occurred while fetching commissions.",
      },
      { status: 500 },
    );
  }
}
