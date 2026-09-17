import api from "./api";
import axios from "axios";

export type BeneficiaryPayload = Record<string, unknown>;

function errorMessage(error: unknown): string {
  if (axios.isAxiosError<{ message?: string }>(error)) {
    return error.response?.data?.message || "Beneficiary request failed";
  }
  return "Beneficiary request failed";
}

export const getBeneficiaries = async (orgId: string) => {
  try {
    const { data } = await api.get(`/beneficiaries/${orgId}`);
    return data;
  } catch (error: unknown) {
    throw new Error(errorMessage(error));
  }
};

export const getBeneficiary = async (orgId: string, beneficiaryId: string) => {
  try {
    const { data } = await api.get(
      `/beneficiaries/${orgId}/${beneficiaryId}`,
    );
    return data;
  } catch (error: unknown) {
    throw new Error(errorMessage(error));
  }
};

export const createBeneficiary = async (orgId: string, data: BeneficiaryPayload) => {
  try {
    const res = await api.post(`/beneficiaries/${orgId}`, data);
    return res.data;
  } catch (error: unknown) {
    throw new Error(errorMessage(error));
  }
};

export const updateBeneficiary = async (
  orgId: string,
  beneficiaryId: string,
  data: BeneficiaryPayload,
) => {
  try {
    const res = await api.put(
      `/beneficiaries/${orgId}/${beneficiaryId}`,
      data,
    );
    return res.data;
  } catch (error: unknown) {
    throw new Error(errorMessage(error));
  }
};

export const deleteBeneficiary = async (
  orgId: string,
  beneficiaryId: string,
) => {
  try {
    const { data } = await api.delete(
      `/beneficiaries/${orgId}/${beneficiaryId}`,
    );
    return data;
  } catch (error: unknown) {
    throw new Error(errorMessage(error));
  }
};
