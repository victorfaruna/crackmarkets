import { useQuery } from "@tanstack/react-query";
import {
  getEvents,
  getEventById,
  type EventsFilterParams,
  type EventItem,
} from "../services/events";

export const EVENTS_QUERY_KEY = ["events"];

export function useEvents(filters?: EventsFilterParams) {
  return useQuery({
    queryKey: [...EVENTS_QUERY_KEY, filters],
    queryFn: () => getEvents(filters),
    staleTime: 1000 * 60 * 3, // 3 minutes
  });
}

export function useEvent(id?: string) {
  return useQuery({
    queryKey: [...EVENTS_QUERY_KEY, "detail", id],
    queryFn: () => (id ? getEventById(id) : null),
    enabled: Boolean(id),
  });
}
