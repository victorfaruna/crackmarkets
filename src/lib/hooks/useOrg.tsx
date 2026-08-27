import { useMutation, useQuery } from "@tanstack/react-query";
import { createOrg, getOrgs } from "../services/org";
import { orgKeys } from "../keys/org.keys";

export const useGetOrgs = () => {
  return useQuery({
    queryKey: orgKeys.ALL,
    queryFn: async () => await getOrgs(),
  });
};

export const useCreateOrg = (data: { name: string; slug: string }) => {
  return useMutation({
    mutationFn: async () => await createOrg(data),
    mutationKey: orgKeys.CREATE,
  });
};
