import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  getBeneficiaries,
  getBeneficiary,
  createBeneficiary,
  updateBeneficiary,
  deleteBeneficiary,
  type BeneficiaryPayload,
} from "../services/beneficiary";
import { beneficiaryKeys } from "../keys/beneficiary.keys";

export const useGetBeneficiaries = (orgId: string) => {
  return useQuery({
    queryKey: beneficiaryKeys.lists(orgId),
    queryFn: () => getBeneficiaries(orgId),
    enabled: !!orgId,
  });
};

export const useGetBeneficiary = (orgId: string, beneficiaryId: string) => {
  return useQuery({
    queryKey: beneficiaryKeys.detail(orgId, beneficiaryId),
    queryFn: () => getBeneficiary(orgId, beneficiaryId),
    enabled: !!orgId && !!beneficiaryId,
  });
};

export const useCreateBeneficiary = (orgId: string) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: BeneficiaryPayload) => createBeneficiary(orgId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: beneficiaryKeys.lists(orgId),
      });
    },
  });
};

export const useUpdateBeneficiary = (orgId: string) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      beneficiaryId,
      data,
    }: {
      beneficiaryId: string;
      data: BeneficiaryPayload;
    }) => updateBeneficiary(orgId, beneficiaryId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: beneficiaryKeys.all(orgId),
      });
    },
  });
};

export const useDeleteBeneficiary = (orgId: string) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (beneficiaryId: string) =>
      deleteBeneficiary(orgId, beneficiaryId),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: beneficiaryKeys.all(orgId),
      });
    },
  });
};
