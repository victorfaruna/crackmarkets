import { NextResponse, type NextRequest } from "next/server";
import { getSessionFromRequest } from "@/src/lib/auth/session";
import { db } from "@/src/lib/db";
import { transactions } from "@/src/lib/db/schema";
import { eq, and, desc, or } from "drizzle-orm";
import { z } from "zod";

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

    // Calculate Weekly Previews (last 7 days) and Monthly Previews (current month or selected month)
    const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    let weeklyProfitShare = 0;
    let weeklyLotCommission = 0;
    let monthlyVolumePools = 0;

    allCommissionTxs.forEach((tx) => {
      const amt = parseFloat(tx.amount) || 0;
      const txDate = new Date(tx.created_at);

      // Weekly preview: within last 7 days (or all if within recent period)
      if (txDate >= sevenDaysAgo) {
        if (tx.transaction_type === "COMMISSION_BONUS_1") {
          weeklyProfitShare += amt;
        }
        if (tx.transaction_type === "LOT_BONUS_2") {
          weeklyLotCommission += amt;
        }
      }

      // Monthly preview: within current month (or all recent volume bonuses)
      if (
        tx.transaction_type === "STRONG_LEG_BONUS_3" ||
        tx.transaction_type === "VOLUME_BONUS_4" ||
        tx.transaction_type === "LEADERSHIP_REWARD"
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
      if (month) {
        const [yStr, mStr] = month.split("-");
        const y = parseInt(yStr, 10);
        const m = parseInt(mStr, 10) - 1;
        const startOfMonth = new Date(Date.UTC(y, m, 1, 0, 0, 0));
        const endOfMonth = new Date(Date.UTC(y, m + 1, 0, 23, 59, 59));
        filteredTxs = allCommissionTxs.filter((tx) => {
          const d = new Date(tx.created_at);
          return d >= startOfMonth && d <= endOfMonth;
        });
      }
    }

    const activeSet = filteredTxs;

    // Calculate streams from activeSet
    let profitShareTotal = 0;
    let profitShareCount = 0;

    let lotCommissionTotal = 0;
    let lotCommissionCount = 0;

    let strongLegTotal = 0;
    let strongLegCount = 0;

    let volumeLadderTotal = 0;
    let volumeLadderCount = 0;

    let leaderPool1Total = 0;
    let leaderPool1Count = 0;

    const leaderPool2Total = 0;
    const leaderPool2Count = 0;

    const grandEstateTotal = 0;
    const grandEstateCount = 0;

    const travelBenefitTotal = 0;
    const travelBenefitCount = 0;

    activeSet.forEach((tx) => {
      const amt = parseFloat(tx.amount) || 0;
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
          leaderPool1Total += amt;
          leaderPool1Count++;
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
      travelBenefitTotal;

    const calcPercent = (val: number) =>
      totalCommissions > 0 ? ((val / totalCommissions) * 100).toFixed(1) : "0";

    const streams = [
      {
        id: "lot-commission",
        name: "Lot Commissions",
        bonusCode: "Bonus 2",
        frequency: "Weekly",
        count: lotCommissionCount,
        amount: lotCommissionTotal.toFixed(2),
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
        amount: profitShareTotal.toFixed(2),
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
        amount: strongLegTotal.toFixed(2),
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
        amount: volumeLadderTotal.toFixed(2),
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
        amount: leaderPool1Total.toFixed(2),
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
        amount: leaderPool2Total.toFixed(2),
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
        amount: grandEstateTotal.toFixed(2),
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
        amount: travelBenefitTotal.toFixed(2),
        percentage: calcPercent(travelBenefitTotal),
        dotColor: "bg-error",
        description: "$50,000 monthly team deposits for 3 consecutive months",
      },
    ];

    const preview = {
      profitShareWeekly: weeklyProfitShare.toFixed(2),
      lotCommissionWeekly: weeklyLotCommission.toFixed(2),
      cpaMonthly: monthlyVolumePools.toFixed(2),
      totalCommissions: totalCommissions.toFixed(2),
    };

    return NextResponse.json({
      success: true,
      data: {
        preview,
        streams,
        transactions: activeSet,
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
