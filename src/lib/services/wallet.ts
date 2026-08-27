import api from "./api";

const getWalletBalance = async (orgId: string) => {
  try {
    const { data } = await api.get(`/wallet/${orgId}/balance`);
    return data;
  } catch (error: any) {
    throw new Error(error);
  }
};

export { getWalletBalance };
