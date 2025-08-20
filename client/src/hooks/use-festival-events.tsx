import { useQuery } from "@tanstack/react-query";
import type { FestivalEvent } from "@shared/schema";

// Fetch function for static data only
const fetchStaticEvents = async (): Promise<FestivalEvent[]> => {
  const response = await fetch('/api/events.json');
  if (!response.ok) {
    throw new Error('Failed to fetch events');
  }
  return response.json();
};

// Helper function to calculate event status based on current date/time
function calculateEventStatus(eventDate: string, eventTime: string): string {
  try {
    const now = new Date();
    const spanishOffset = 2; // UTC+2 for Spanish summer time
    const spanishTime = new Date(now.getTime() + (spanishOffset * 60 * 60 * 1000));
    
    const [year, month, day] = eventDate.split('-').map(Number);
    const [hours, minutes] = eventTime.split(':').map(Number);
    
    const eventDateTime = new Date(Date.UTC(year, month - 1, day, hours - spanishOffset, minutes));
    const eventEndTime = new Date(eventDateTime.getTime() + (2 * 60 * 60 * 1000)); // 2 hour duration
    
    if (spanishTime < eventDateTime) {
      return 'upcoming';
    } else if (spanishTime >= eventDateTime && spanishTime <= eventEndTime) {
      return 'ongoing';
    } else {
      return 'finished';
    }
  } catch (error) {
    return 'upcoming';
  }
}

export function useFestivalEvents() {
  return useQuery<FestivalEvent[]>({
    queryKey: ['events'],
    queryFn: async () => {
      const events = await fetchStaticEvents();
      // Update status dynamically based on current time
      return events.map(event => ({
        ...event,
        status: calculateEventStatus(event.date, event.time)
      }));
    },
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
}

export function useFestivalEventsByCategory(category: string) {
  return useQuery<FestivalEvent[]>({
    queryKey: ['events', 'category', category],
    queryFn: async () => {
      const events = await fetchStaticEvents();
      return events
        .filter(event => event.category === category)
        .map(event => ({
          ...event,
          status: calculateEventStatus(event.date, event.time)
        }));
    },
    enabled: !!category,
    staleTime: 1000 * 60 * 5,
  });
}

export function useFestivalEventsByStatus(status: string) {
  return useQuery<FestivalEvent[]>({
    queryKey: ['events', 'status', status],
    queryFn: async () => {
      const events = await fetchStaticEvents();
      return events
        .map(event => ({
          ...event,
          status: calculateEventStatus(event.date, event.time)
        }))
        .filter(event => event.status === status);
    },
    enabled: !!status,
    staleTime: 1000 * 60 * 5,
  });
}

export function useSearchFestivalEvents(query: string) {
  return useQuery<FestivalEvent[]>({
    queryKey: ['events', 'search', query],
    queryFn: async () => {
      const events = await fetchStaticEvents();
      const searchQuery = query.toLowerCase();
      return events
        .filter(event => 
          event.name.toLowerCase().includes(searchQuery) ||
          event.location.toLowerCase().includes(searchQuery) ||
          event.organizer.toLowerCase().includes(searchQuery) ||
          event.type.toLowerCase().includes(searchQuery)
        )
        .map(event => ({
          ...event,
          status: calculateEventStatus(event.date, event.time)
        }));
    },
    enabled: !!query && query.length > 2,
    staleTime: 1000 * 60 * 2,
  });
}
