import api from "./api";
import { AuthResponse } from "./auth";

export interface ImpressionsData {
  totalClicks: number;
  growthRate: number;
  growthLabel: string;
  conversionRate: number;
  totalMembers: number;
  sparkline: Array<{ v: number; date?: string }>;
}

export const getImpressions = async (): Promise<AuthResponse<ImpressionsData>> => {
  try {
    const { data } = await api.get("/impressions");
    return data;
  } catch (error) {
    throw error;
  }
};

export const trackReferralImpression = async (referralCode: string, country?: string) => {
  try {
    await api.post("/impressions/track", { referralCode, country });
  } catch (error) {
    // Non-blocking tracking error
    console.debug("Impression tracking failed:", error);
  }
};
