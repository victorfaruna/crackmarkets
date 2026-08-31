import api from "./api";

export type TransactionType =
  | "COMMISSION_BONUS_1"
  | "LOT_BONUS_2"
  | "STRONG_LEG_BONUS_3"
  | "VOLUME_BONUS_4"
  | "LEADERSHIP_REWARD"
  | "WITHDRAWAL"
  | "DEPOSIT";

export type TransactionStatus = "COMPLETED" | "PENDING" | "FAILED" | "REVERSED";

export interface TransactionItem {
  id: string;
  user_id: string;
  source_user_id: string | null;
  amount: string;
  transaction_type: TransactionType;
  reference_id: string | null;
  level: number | null;
  status: TransactionStatus;
  created_at: string;
}

export interface WalletSummary {
  balance: string;
  available_balance: string;
  total_withdrawn: string;
  lifetime_earnings: string;
}

export interface TransactionsResponse {
  success: boolean;
  data: {
    wallet: WalletSummary;
    transactions: TransactionItem[];
    total: number;
  };
  message?: string;
}

export interface TransactionsFilterParams {
  type?: string; // "ALL" | "COMMISSION" | "WITHDRAWAL" | "DEPOSIT"
  status?: string; // "ALL" | "COMPLETED" | "PENDING" | "FAILED"
  search?: string;
}

export const getTransactions = async (
  params?: TransactionsFilterParams,
): Promise<TransactionsResponse> => {
  try {
    const searchParams = new URLSearchParams();
    if (params?.type && params.type !== "ALL") {
      searchParams.set("type", params.type);
    }
    if (params?.status && params.status !== "ALL") {
      searchParams.set("status", params.status);
    }
    if (params?.search && params.search.trim()) {
      searchParams.set("search", params.search.trim());
    }

    const query = searchParams.toString();
    const url = `/wallet/transactions${query ? `?${query}` : ""}`;
    const response = await api.get<TransactionsResponse>(url);
    return response.data;
  } catch (error) {
    console.error("Error fetching transactions:", error);
    throw error;
  }
};

export interface WithdrawPayload {
  amount: number;
  address: string;
  network: string;
}

export const withdrawFunds = async (payload: WithdrawPayload) => {
  try {
    const response = await api.post("/wallet/withdraw", payload);
    return response.data;
  } catch (error) {
    console.error("Error withdrawing funds:", error);
    throw error;
  }
};
