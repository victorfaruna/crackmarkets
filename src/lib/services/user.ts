import api from "./api";
import { AuthResponse, UserProfile } from "./auth";

export interface CurrentUserResponse {
  user: UserProfile;
  wallet: {
    balance: string;
    available_balance: string;
    total_withdrawn: string;
    lifetime_earnings: string;
  };
}

const getUser = async (): Promise<AuthResponse<CurrentUserResponse>> => {
  try {
    const { data } = await api.get("/auth/me");
    return data;
  } catch (error) {
    throw error;
  }
};

export { getUser };

