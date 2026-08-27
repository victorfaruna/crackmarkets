import api from "./api";
import { AuthResponse } from "./auth";

export interface NetworkMemberDTO {
  id: string;
  name: string;
  email: string;
  country: string;
  level: number;
  status: string;
  createdAt: string;
}

export interface NetworkSummaryResponse {
  totalMembers: number;
  activeCount: number;
  members: NetworkMemberDTO[];
}

export const getNetworkSummary = async (): Promise<
  AuthResponse<NetworkSummaryResponse>
> => {
  try {
    const { data } = await api.get("/network");
    return data;
  } catch (error) {
    throw error;
  }
};
