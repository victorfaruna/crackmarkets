import { useQuery } from "@tanstack/react-query";
import { getWalletBalance } from "../services/wallet";

export const useWallet = (orgId: string) => {
  const { data, isLoading } = useQuery({
    queryFn: () => getWalletBalance(orgId),
    queryKey: ["wallet-balance", orgId],
    staleTime: 30000,
    refetchInterval: 600000,
  });

  return { isLoading, data };
};
