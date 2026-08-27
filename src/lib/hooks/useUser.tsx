import { useQuery } from "@tanstack/react-query";
import { getUser } from "../services/user";

export const useUser = () => {
  return useQuery({
    queryKey: ["auth", "me"],
    queryFn: () => getUser(),
    staleTime: 30 * 1000,
    retry: 1,
  });
};

