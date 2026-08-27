import { useQuery } from "@tanstack/react-query";
import { getImpressions } from "../services/impressions";

export const useImpressions = () => {
  return useQuery({
    queryKey: ["impressions", "summary"],
    queryFn: () => getImpressions(),
    staleTime: 30 * 1000,
    retry: 1,
  });
};
