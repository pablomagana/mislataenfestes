import { useQuery } from "@tanstack/react-query";
import type { FestivalEvent } from "@shared/schema";

// Fetch function for static data in production
const fetchStaticEvents = async (): Promise<FestivalEvent[]> => {
  try {
    // Try API first (for development with backend)
    const response = await fetch('/api/events');
    if (response.ok) {
      return response.json();
    }
  } catch (error) {
    console.log('API not available, using static data');
  }
  
  // Fallback to static JSON file (for Cloudflare Pages)
  const response = await fetch('/api/events.json');
  if (!response.ok) {
    throw new Error('Failed to fetch events');
  }
  return response.json();
};

export function useFestivalEvents() {
  return useQuery<FestivalEvent[]>({
    queryKey: ['/api/events'],
    queryFn: fetchStaticEvents,
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
