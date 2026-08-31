import api from "./api";

export type EventCategory =
  | "TRADING_CONTEST"
  | "WEBINAR"
  | "LEADERSHIP_POOL"
  | "PARTNER_SUMMIT";

export type EventStatus = "UPCOMING" | "LIVE" | "COMPLETED";

export interface EventItem {
  id: string;
  title: string;
  category: EventCategory;
  description: string;
  reward_pool: string | null;
  location: string;
  starts_at: string;
  ends_at: string | null;
  status: EventStatus;
  created_at: string;
  updated_at: string;
}

export interface EventsFilterParams {
  category?: string;
  status?: string;
  include_past?: boolean;
  month?: string; // "YYYY-MM"
  date?: string; // "YYYY-MM-DD"
}

export interface EventsResponse {
  success: boolean;
  data: EventItem[];
  meta?: {
    total: number;
  };
  message?: string;
}

export const getEvents = async (
  params?: EventsFilterParams,
): Promise<EventsResponse> => {
  try {
    const searchParams = new URLSearchParams();
    if (params?.category && params.category !== "ALL") {
      searchParams.set("category", params.category);
    }
    if (params?.status && params.status !== "ALL") {
      searchParams.set("status", params.status);
    }
    if (params?.include_past !== undefined) {
      searchParams.set("include_past", String(params.include_past));
    }
    if (params?.month) {
      searchParams.set("month", params.month);
    }
    if (params?.date) {
      searchParams.set("date", params.date);
    }

    const queryString = searchParams.toString();
    const url = `/events${queryString ? `?${queryString}` : ""}`;
    const response = await api.get<EventsResponse>(url);
    return response.data;
  } catch (error) {
    console.error("Error fetching events:", error);
    throw error;
  }
};

export const getEventById = async (
  id: string,
): Promise<{ success: boolean; data: EventItem }> => {
  try {
    const response = await api.get<{ success: boolean; data: EventItem }>(
      `/events/${id}`,
    );
    return response.data;
  } catch (error) {
    console.error(`Error fetching event ${id}:`, error);
    throw error;
  }
};
