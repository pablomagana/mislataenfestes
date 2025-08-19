import { useQuery } from "@tanstack/react-query";
import type { FestivalEvent } from "@shared/schema";

export function useFestivalEvents() {
  return useQuery<FestivalEvent[]>({
    queryKey: ['/api/events'],
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
}

export function useFestivalEventsByCategory(category: string) {
  return useQuery<FestivalEvent[]>({
    queryKey: ['/api/events/category', category],
    enabled: !!category,
    staleTime: 1000 * 60 * 5,
  });
}

export function useFestivalEventsByStatus(status: string) {
  return useQuery<FestivalEvent[]>({
    queryKey: ['/api/events/status', status],
    enabled: !!status,
    staleTime: 1000 * 60 * 5,
  });
}

export function useSearchFestivalEvents(query: string) {
  return useQuery<FestivalEvent[]>({
    queryKey: ['/api/events/search', { q: query }],
    enabled: !!query && query.length > 2,
    staleTime: 1000 * 60 * 2,
  });
}
