import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  getTransactions,
  withdrawFunds,
  type TransactionsFilterParams,
  type WithdrawPayload,
} from "../services/wallet";
import { USER_QUERY_KEY } from "./useUser";

export const WALLET_TRANSACTIONS_KEY = ["wallet-transactions"];

export const useWalletTransactions = (filters?: TransactionsFilterParams) => {
  return useQuery({
    queryKey: [...WALLET_TRANSACTIONS_KEY, filters],
    queryFn: () => getTransactions(filters),
    staleTime: 1000 * 30, // 30 seconds
  });
};

export const useWithdrawFunds = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: WithdrawPayload) => withdrawFunds(payload),
    onSuccess: () => {
      // Invalidate both user summary (balance) and transactions ledger
      queryClient.invalidateQueries({ queryKey: WALLET_TRANSACTIONS_KEY });
      queryClient.invalidateQueries({ queryKey: [USER_QUERY_KEY] });
    },
  });
};
