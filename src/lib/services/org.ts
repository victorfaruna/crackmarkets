import api from "./api";
import axios from "axios";

type OrganisationPayload = Record<string, unknown>;

function errorMessage(error: unknown): string {
  if (axios.isAxiosError<{ message?: string }>(error)) {
    return error.response?.data?.message || "Organisation request failed";
  }
  return "Organisation request failed";
}

export const getOrgs = async () => {
  try {
    const res = await api.get("/organisations");
    return res.data;
  } catch (error) {
    console.log(error);
    throw error;
  }
};

export const createOrg = async (data: OrganisationPayload) => {
  try {
    const res = await api.post("/organisations", data);
    return res.data;
  } catch (error: unknown) {
    throw new Error(errorMessage(error));
  }
};

export const getOrgByHandle = async (handle: string, cookieHeader?: string) => {
  try {
    const res = await api.get(`/organisations/${handle}`, {
      headers: cookieHeader ? { Cookie: cookieHeader } : {},
    });
    return res.data;
  } catch (error: unknown) {
    throw new Error(errorMessage(error));
  }
};

export const checkOrgHandle = async (handle: string) => {
  try {
    const res = await api.get(`/organisations/check-handle/${handle}`);
    return res.data;
  } catch (error: unknown) {
    throw new Error(errorMessage(error));
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
  } catch (error: unknown) {
    throw new Error(errorMessage(error));
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
  } catch (error: unknown) {
    throw new Error(errorMessage(error));
  }
};
