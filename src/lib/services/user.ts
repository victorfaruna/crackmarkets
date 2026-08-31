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

export interface UpdateUserPayload {
  first_name?: string;
  last_name?: string;
  phone_number?: string;
  country?: string;
  telegram_handle?: string;
}

const getUser = async (): Promise<AuthResponse<CurrentUserResponse>> => {
  try {
    const { data } = await api.get("/auth/me");
    return data;
  } catch (error) {
    throw error;
  }
};

const updateUser = async (
  payload: UpdateUserPayload,
): Promise<AuthResponse<{ user: UserProfile }>> => {
  try {
    const { data } = await api.patch("/auth/me", payload);
    return data;
  } catch (error) {
    throw error;
  }
};

const linkRoboForex = async (roboforexId: string): Promise<AuthResponse> => {
  try {
    const { data } = await api.post("/auth/link-roboforex", {
      roboforex_id: roboforexId,
    });
    return data;
  } catch (error) {
    throw error;
  }
};

export { getUser, updateUser, linkRoboForex };
