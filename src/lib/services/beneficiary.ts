import api from "./api";

export const getBeneficiaries = async (orgId: string) => {
  try {
    const { data } = await api.get(`/beneficiaries/${orgId}`);
    return data;
  } catch (error: any) {
    throw new Error(error?.response?.data?.message);
  }
};

export const getBeneficiary = async (orgId: string, beneficiaryId: string) => {
  try {
    const { data } = await api.get(
      `/beneficiaries/${orgId}/${beneficiaryId}`,
    );
    return data;
  } catch (error: any) {
    throw new Error(error?.response?.data?.message);
  }
};

export const createBeneficiary = async (orgId: string, data: any) => {
  try {
    const res = await api.post(`/beneficiaries/${orgId}`, data);
    return res.data;
  } catch (error: any) {
    throw new Error(error?.response?.data?.message);
  }
};

export const updateBeneficiary = async (
  orgId: string,
  beneficiaryId: string,
  data: any,
) => {
  try {
    const res = await api.put(
      `/beneficiaries/${orgId}/${beneficiaryId}`,
      data,
    );
    return res.data;
  } catch (error: any) {
    throw new Error(error?.response?.data?.message);
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
  } catch (error: any) {
    throw new Error(error?.response?.data?.message);
  }
};
