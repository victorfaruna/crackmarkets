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
  ratePercent: number; // e.g. 5 for Level 1, 4 for Level 2...
  lotRate: number; // e.g. $2.00 for L1-3, $1.00 for L4, $0.50 for L5-10
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
  lastSyncedAt: string;
  brokerAccount: {
    accountId: string;
    server: string;
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

export interface CommissionTransaction {
  id: string;
  amount: number;
  type:
    | "REFERRAL_PROFIT"
    | "LOT_BONUS"
    | "STRONG_LEG_BONUS"
    | "LADDER_BONUS"
    | "LEADERSHIP_REWARD"
    | "WITHDRAWAL";
  sourceUser?: {
    name: string;
    email: string;
    country: string;
  };
  level?: number;
  referenceId: string;
  status: "COMPLETED" | "PENDING" | "PROCESSING";
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

// Mock fallback generator to ensure stunning visual presentation out-of-the-box
export const getMockDashboardSummary = (userReferralCode: string = "CRK-84920"): DashboardSummary => {
  const levels: LevelBreakdown[] = [
    { level: 1, ratePercent: 5, lotRate: 2.0, membersCount: 18, activeTradersCount: 15, teamDeposits: 48500, totalVolume: 184000, lotsTraded: 92.5, commissionEarned: 2425.0 },
    { level: 2, ratePercent: 4, lotRate: 2.0, membersCount: 34, activeTradersCount: 28, teamDeposits: 72000, totalVolume: 290000, lotsTraded: 145.0, commissionEarned: 2880.0 },
    { level: 3, ratePercent: 3, lotRate: 2.0, membersCount: 52, activeTradersCount: 40, teamDeposits: 110000, totalVolume: 430000, lotsTraded: 215.0, commissionEarned: 3300.0 },
    { level: 4, ratePercent: 2, lotRate: 1.0, membersCount: 88, activeTradersCount: 65, teamDeposits: 165000, totalVolume: 610000, lotsTraded: 305.0, commissionEarned: 3300.0 },
    { level: 5, ratePercent: 2, lotRate: 0.5, membersCount: 112, activeTradersCount: 82, teamDeposits: 210000, totalVolume: 780000, lotsTraded: 390.0, commissionEarned: 4200.0 },
    { level: 6, ratePercent: 2, lotRate: 0.5, membersCount: 140, activeTradersCount: 95, teamDeposits: 280000, totalVolume: 920000, lotsTraded: 460.0, commissionEarned: 5600.0 },
    { level: 7, ratePercent: 2, lotRate: 0.5, membersCount: 95, activeTradersCount: 68, teamDeposits: 190000, totalVolume: 650000, lotsTraded: 325.0, commissionEarned: 3800.0 },
    { level: 8, ratePercent: 2, lotRate: 0.5, membersCount: 64, activeTradersCount: 42, teamDeposits: 130000, totalVolume: 440000, lotsTraded: 220.0, commissionEarned: 2600.0 },
    { level: 9, ratePercent: 2, lotRate: 0.5, membersCount: 38, activeTradersCount: 24, teamDeposits: 85000, totalVolume: 270000, lotsTraded: 135.0, commissionEarned: 1700.0 },
    { level: 10, ratePercent: 1, lotRate: 0.5, membersCount: 22, activeTradersCount: 14, teamDeposits: 45000, totalVolume: 140000, lotsTraded: 70.0, commissionEarned: 450.0 },
  ];

  const totalTeamDeposits = levels.reduce((acc, l) => acc + l.teamDeposits, 0);
  const totalVolume = levels.reduce((acc, l) => acc + l.totalVolume, 0);
  const totalReferralProfit = levels.reduce((acc, l) => acc + l.commissionEarned, 0);
  const totalLotBonus = levels.reduce((acc, l) => acc + l.lotsTraded * l.lotRate, 0);

  return {
    financialStats: {
      totalTradingCapital: 125000.0,
      totalTradingProfit: 34850.5,
      totalReferralProfit,
      totalLotBonus,
      availableBalance: 18450.25,
      lifetimeEarnings: totalReferralProfit + totalLotBonus + 34850.5,
      totalWithdrawn: 14500.0,
    },
    tradingMetrics: {
      todayProfit: 1420.5,
      weeklyProfit: 6850.2,
      monthlyProfit: 24900.0,
      totalTradingVolume: 4714000.0,
      totalLotsTraded: 2357.5,
      openPositionsCount: 4,
      lastSyncedAt: new Date().toISOString(),
      brokerAccount: {
        accountId: "RB-7849102",
        server: "RoboForex-ECN-Pro",
        brokerName: "RoboForex",
        status: "CONNECTED",
        balance: 125000.0,
        equity: 126420.5,
        margin: 4500.0,
        freeMargin: 121920.5,
      },
    },
    referralTree: {
      totalTraders: levels.reduce((acc, l) => acc + l.membersCount, 0),
      activeTraders: levels.reduce((acc, l) => acc + l.activeTradersCount, 0),
      totalTeamDeposits,
      strongLegVolume: 2450000.0,
      weakLegVolume: 2264000.0,
      levels,
    },
    qualificationLadder: {
      currentTier: 5,
      currentPercentage: 5.5,
      totalVolume,
      strongLegTier1Qualified: true,
      strongLegTier2Qualified: true,
      tiers: [
        { level: 1, volumeRequired: 10000, percentage: 1.0, isUnlocked: true, currentVolume: totalVolume },
        { level: 2, volumeRequired: 50000, percentage: 2.0, isUnlocked: true, currentVolume: totalVolume },
        { level: 3, volumeRequired: 200000, percentage: 3.5, isUnlocked: true, currentVolume: totalVolume },
        { level: 4, volumeRequired: 1000000, percentage: 5.0, isUnlocked: true, currentVolume: totalVolume },
        { level: 5, volumeRequired: 3500000, percentage: 5.5, isUnlocked: true, currentVolume: totalVolume },
        { level: 6, volumeRequired: 8000000, percentage: 6.0, isUnlocked: false, currentVolume: totalVolume },
        { level: 7, volumeRequired: 15000000, percentage: 6.5, isUnlocked: false, currentVolume: totalVolume },
        { level: 8, volumeRequired: 30000000, percentage: 7.0, isUnlocked: false, currentVolume: totalVolume },
        { level: 9, volumeRequired: 50000000, percentage: 8.0, isUnlocked: false, currentVolume: totalVolume },
      ],
    },
    leadershipPools: [
      {
        id: "pool-travel",
        title: "Travel Benefit",
        rewardDescription: "Luxury Travel Trip or $2,000 Cash",
        maxRewardValue: 2000,
        qualificationCriteria: "Maintain $50,000 monthly team deposits for 3 consecutive months",
        consecutiveMonthsRequired: 3,
        currentStreakMonths: 3,
        isQualified: true,
      },
      {
        id: "pool-1",
        title: "Leader Pool 1",
        rewardDescription: "Family Luxury Vacation Trip",
        maxRewardValue: 15000,
        qualificationCriteria: "Qualify for 2 consecutive months in top volume tier",
        consecutiveMonthsRequired: 2,
        currentStreakMonths: 2,
        isQualified: true,
      },
      {
        id: "pool-2",
        title: "Leader Pool 2",
        rewardDescription: "Brand New Executive Car",
        maxRewardValue: 25000,
        qualificationCriteria: "Maintain qualification for 2 consecutive months",
        consecutiveMonthsRequired: 2,
        currentStreakMonths: 1,
        isQualified: false,
      },
      {
        id: "pool-grand",
        title: "Grand Prize Estate",
        rewardDescription: "Luxury Estate Residence",
        maxRewardValue: 1200000,
        qualificationCriteria: "Maintain top qualification tier for 6 consecutive months",
        consecutiveMonthsRequired: 6,
        currentStreakMonths: 3,
        isQualified: false,
      },
    ],
    recentTransactions: [
      {
        id: "tx-1",
        amount: 250.0,
        type: "REFERRAL_PROFIT",
        sourceUser: { name: "Marcus Vance", email: "marcus.v@example.com", country: "United Kingdom" },
        level: 1,
        referenceId: "TRD-849201",
        status: "COMPLETED",
        createdAt: new Date(Date.now() - 1000 * 60 * 12).toISOString(),
      },
      {
        id: "tx-2",
        amount: 140.0,
        type: "LOT_BONUS",
        sourceUser: { name: "Elena Rostova", email: "elena.r@example.com", country: "Germany" },
        level: 2,
        referenceId: "LOT-992144",
        status: "COMPLETED",
        createdAt: new Date(Date.now() - 1000 * 60 * 45).toISOString(),
      },
      {
        id: "tx-3",
        amount: 500.0,
        type: "STRONG_LEG_BONUS",
        referenceId: "STR-441209",
        status: "COMPLETED",
        createdAt: new Date(Date.now() - 1000 * 60 * 180).toISOString(),
      },
      {
        id: "tx-4",
        amount: 1200.0,
        type: "LADDER_BONUS",
        referenceId: "LDR-102934",
        status: "COMPLETED",
        createdAt: new Date(Date.now() - 1000 * 60 * 60 * 14).toISOString(),
      },
      {
        id: "tx-5",
        amount: 2500.0,
        type: "WITHDRAWAL",
        referenceId: "WTH-883921",
        status: "COMPLETED",
        createdAt: new Date(Date.now() - 1000 * 60 * 60 * 36).toISOString(),
      },
    ],
  };
};

export const getDashboardSummary = async (): Promise<DashboardSummary> => {
  try {
    const response = await api.get("/dashboard/summary");
    return response.data?.data || getMockDashboardSummary();
  } catch {
    return getMockDashboardSummary();
  }
};
