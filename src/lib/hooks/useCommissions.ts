import { useQuery } from "@tanstack/react-query";
import {
  getCommissionsSummary,
  type CommissionsFilterParams,
} from "../services/commissions";

export const COMMISSIONS_QUERY_KEY = ["commissions-summary"];

export function useCommissions(filters?: CommissionsFilterParams) {
  return useQuery({
    queryKey: [...COMMISSIONS_QUERY_KEY, filters],
    queryFn: () => getCommissionsSummary(filters),
    staleTime: 1000 * 30, // 30 seconds
  });
}
