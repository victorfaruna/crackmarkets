import { useQuery } from "@tanstack/react-query";
import { getNetworkSummary } from "../services/network";

export const useNetwork = () => {
  return useQuery({
    queryKey: ["network", "summary"],
    queryFn: () => getNetworkSummary(),
    staleTime: 30 * 1000,
    retry: 1,
  });
};
