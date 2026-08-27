import api from "./api";

export interface RegisterPayload {
  first_name: string;
  last_name: string;
  email: string;
  phone_number: string;
  country: string;
  password: string;
  referral_code?: string;
}

export interface LoginPayload {
  email: string;
  password: string;
}

export interface AuthResponse<T = unknown> {
  success: boolean;
  message?: string;
  data?: T;
  errors?: Record<string, string[]>;
}

export interface UserProfile {
  id: string;
  first_name: string;
  last_name: string;
  email: string;
  phone_number: string;
  country: string;
  referral_code: string;
  referred_by_id?: string | null;
  status: "EMAIL_VERIFICATION_PENDING" | "ACTIVE" | "SUSPENDED";
  kyc_status: "NOT_SUBMITTED" | "PENDING" | "APPROVED" | "REJECTED";
  funding_status: "LOCKED" | "UNLOCKED";
  role: "USER" | "ADMIN" | "SUPPORT";
  created_at: string;
}

export const register = async (data: RegisterPayload): Promise<AuthResponse<{ user: UserProfile; accessToken: string; verificationToken?: string }>> => {
  try {
    const response = await api.post("/auth/register", data);
    return response.data;
  } catch (error) {
    console.error("Error registering:", error);
    throw error;
  }
};

export const loginWithCredentials = async (
  data: LoginPayload,
): Promise<AuthResponse<{ user: UserProfile; accessToken: string }>> => {
  try {
    const response = await api.post("/auth/login", data);
    return response.data;
  } catch (error) {
    console.error("Error logging in:", error);
    throw error;
  }
};

export const logout = async (): Promise<AuthResponse<void>> => {
  try {
    const response = await api.post("/auth/logout");
    return response.data;
  } catch (error) {
    console.error("Error logging out:", error);
    throw error;
  }
};

export const getMe = async (): Promise<AuthResponse<{ user: UserProfile; wallet: unknown }>> => {
  try {
    const response = await api.get("/auth/me");
    return response.data;
  } catch (error) {
    console.error("Error fetching current user:", error);
    throw error;
  }
};

export const refreshToken = async (): Promise<AuthResponse<{ accessToken: string }>> => {
  try {
    const response = await api.post("/auth/refresh");
    return response.data;
  } catch (error) {
    console.error("Error refreshing token:", error);
    throw error;
  }
};

export const verifyEmail = async (token: string): Promise<AuthResponse<void>> => {
  try {
    const response = await api.post("/auth/verify-email", { token });
    return response.data;
  } catch (error) {
    console.error("Error verifying email:", error);
    throw error;
  }
};

export const forgotPassword = async (email: string): Promise<AuthResponse<void>> => {
  try {
    const response = await api.post("/auth/forgot-password", { email });
    return response.data;
  } catch (error) {
    console.error("Error requesting forgot password:", error);
    throw error;
  }
};

export const resetPassword = async (
  token: string,
  password: string,
): Promise<AuthResponse<void>> => {
  try {
    const response = await api.post("/auth/reset-password", { token, password });
    return response.data;
  } catch (error) {
    console.error("Error resetting password:", error);
    throw error;
  }
};
