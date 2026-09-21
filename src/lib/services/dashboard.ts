import api from "./api";

export interface FinancialStats {
  totalTradingCapital: number;
  totalTradingProfit: number;
  totalReferralProfit: number;
  totalLotBonus: number;
  availableBalance: number;
  lifetimeEarnings: number;
  totalWithdrawn: number;
}

export interface LevelBreakdown {
  level: number;
  ratePercent: number;
  lotRate: number;
  membersCount: number;
  activeTradersCount: number;
  teamDeposits: number;
  totalVolume: number;
  lotsTraded: number;
  commissionEarned: number;
}

export interface TradingMetrics {
  todayProfit: number;
  weeklyProfit: number;
  monthlyProfit: number;
  totalTradingVolume: number;
  totalLotsTraded: number;
  openPositionsCount: number;
  lastSyncedAt: string | null;
  dataAvailable: boolean;
  brokerAccount: {
    accountId: string | null;
    server: string | null;
    brokerName: string;
    status: "CONNECTED" | "DISCONNECTED" | "SYNCING";
    balance: number;
    equity: number;
    margin: number;
    freeMargin: number;
  };
}

export interface LadderTier {
  level: number;
  volumeRequired: number;
  percentage: number;
  isUnlocked: boolean;
  currentVolume: number;
}

export interface LeadershipPool {
  id: string;
  title: string;
  rewardDescription: string;
  maxRewardValue: number;
  qualificationCriteria: string;
  consecutiveMonthsRequired: number;
  currentStreakMonths: number;
  isQualified: boolean;
}

export type CommissionTransactionType =
  | "REFERRAL_PROFIT"
  | "LOT_BONUS"
  | "STRONG_LEG_BONUS"
  | "LADDER_BONUS"
  | "LEADERSHIP_REWARD"
  | "WITHDRAWAL";

export interface CommissionTransaction {
  id: string;
  amount: number;
  type: CommissionTransactionType;
  level?: number;
  referenceId: string;
  status: "COMPLETED" | "PENDING" | "FAILED" | "REVERSED" | "PROCESSING";
  createdAt: string;
}

export interface DashboardSummary {
  financialStats: FinancialStats;
  tradingMetrics: TradingMetrics;
  referralTree: {
    totalTraders: number;
    activeTraders: number;
    totalTeamDeposits: number;
    strongLegVolume: number;
    weakLegVolume: number;
    levels: LevelBreakdown[];
  };
  qualificationLadder: {
    currentTier: number;
    currentPercentage: number;
    totalVolume: number;
    tiers: LadderTier[];
    strongLegTier1Qualified: boolean;
    strongLegTier2Qualified: boolean;
  };
  leadershipPools: LeadershipPool[];
  recentTransactions: CommissionTransaction[];
}

export const getDashboardSummary = async (): Promise<DashboardSummary> => {
  const response = await api.get<{ success: boolean; data: DashboardSummary }>(
    "/dashboard/summary",
  );
  return response.data.data;
};
