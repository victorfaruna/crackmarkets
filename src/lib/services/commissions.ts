import api from "./api";
import { TransactionItem } from "./wallet";

export interface IncomeStreamItem {
  id: string;
  name: string;
  bonusCode: string;
  frequency: "Weekly" | "Monthly";
  count: number;
  amount: string;
  percentage: string;
  dotColor: string;
  description: string;
}

export interface CommissionPreview {
  profitShareWeekly: string;
  lotCommissionWeekly: string;
  cpaMonthly: string;
  totalCommissions: string;
}

export interface CommissionsResponse {
  success: boolean;
  data: {
    preview: CommissionPreview;
    streams: IncomeStreamItem[];
    transactions: TransactionItem[];
    total: number;
  };
  message?: string;
}

export interface CommissionsFilterParams {
  timeframe?: string; // "monthly" | "weekly" | "all"
  month?: string; // "YYYY-MM"
}

export const getCommissionsSummary = async (
  params?: CommissionsFilterParams,
): Promise<CommissionsResponse> => {
  try {
    const searchParams = new URLSearchParams();
    if (params?.timeframe) {
      searchParams.set("timeframe", params.timeframe);
    }
    if (params?.month) {
      searchParams.set("month", params.month);
    }
    const query = searchParams.toString();
    const url = `/commissions${query ? `?${query}` : ""}`;
    const response = await api.get<CommissionsResponse>(url);
    return response.data;
  } catch (error) {
    console.error("Error fetching commissions summary:", error);
    throw error;
  }
};
