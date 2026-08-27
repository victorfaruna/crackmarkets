import api from "./api";

export const getOrgs = async () => {
  try {
    const res = await api.get("/organisations");
    return res.data;
  } catch (error) {
    console.log(error);
    throw error;
  }
};

export const createOrg = async (data: any) => {
  try {
    const res = await api.post("/organisations", data);
    return res.data;
  } catch (error: any) {
    console.log(error);
    throw new Error(error?.response?.data?.message);
  }
};

export const getOrgByHandle = async (handle: string, cookieHeader?: string) => {
  try {
    const res = await api.get(`/organisations/${handle}`, {
      headers: cookieHeader ? { Cookie: cookieHeader } : {},
    });
    return res.data;
  } catch (error: any) {
    console.log(error);
    throw new Error(error?.response?.data?.message);
  }
};

export const checkOrgHandle = async (handle: string) => {
  try {
    const res = await api.get(`/organisations/check-handle/${handle}`);
    return res.data;
  } catch (error: any) {
    console.log(error);
    throw new Error(error?.response?.data?.message);
  }
};

export const inviteTeamMembers = async (
  orgId: string,
  data: {
    invitees: { email: string; role?: "finance" | "contributor" | "admin" }[];
  },
) => {
  try {
    const res = await api.post(`/organisations/${orgId}/invitations`, data);
    return res.data;
  } catch (error: any) {
    console.log(error);
    throw new Error(error?.response?.data?.message);
  }
};

export const setPayrollPreferences = async (
  orgId: string,
  data: { payFrequency: string; primaryCurrencyId: string },
) => {
  try {
    const res = await api.put(
      `/organisations/${orgId}/payroll-preference`,
      data,
    );
    return res.data;
  } catch (error: any) {
    console.log(error);
    throw new Error(error?.response?.data?.message);
  }
};
