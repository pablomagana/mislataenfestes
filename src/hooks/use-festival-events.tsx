import { useQuery } from "@tanstack/react-query";
import type { FestivalEvent } from "@shared/schema";
import eventsData from '../data/events.json';

// Datos estáticos desde el archivo local
const staticEvents: FestivalEvent[] = eventsData as FestivalEvent[];

// Función para obtener los eventos locales (sin llamadas HTTP)
const getStaticEvents = (): Promise<FestivalEvent[]> => {
  return Promise.resolve(staticEvents);
};

import { calculateEventStatusFestival } from '@/lib/festival-time';

// Función auxiliar para calcular el estado de todos los eventos considerando el siguiente evento
function calculateEventsStatusWithNextEvent(events: FestivalEvent[]): FestivalEvent[] {
  // Agrupar eventos por fecha
  const eventsByDate = events.reduce((acc, event) => {
    if (!acc[event.date]) {
      acc[event.date] = [];
    }
    acc[event.date].push(event);
    return acc;
  }, {} as Record<string, FestivalEvent[]>);

  // Calcular estado para cada evento considerando los otros eventos del mismo día
  return events.map(event => {
    const dayEvents = eventsByDate[event.date] || [];
    // Ordenar eventos del día por hora
    dayEvents.sort((a, b) => a.time.localeCompare(b.time));
    
    return {
      ...event,
      status: calculateEventStatusFestival(event.date, event.time, dayEvents)
    };
  });
}

export function useFestivalEvents() {
  return useQuery<FestivalEvent[]>({
    queryKey: ['events', new Date().getHours(), new Date().getMinutes()], // Forzar recálculo cada minuto
    queryFn: async () => {
      const events = await getStaticEvents();
      // Actualizar status considerando cuando termina cada evento (siguiente evento)
      return calculateEventsStatusWithNextEvent(events);
    },
    staleTime: 1000 * 60 * 1, // 1 minuto para debug
  });
}

export function useFestivalEventsByCategory(category: string) {
  return useQuery<FestivalEvent[]>({
    queryKey: ['events', 'category', category],
    queryFn: async () => {
      const events = await getStaticEvents();
      const filteredEvents = events.filter(event => event.category === category);
      return calculateEventsStatusWithNextEvent(filteredEvents);
    },
    enabled: !!category,
    staleTime: 1000 * 60 * 5,
  });
}

export function useFestivalEventsByStatus(status: string) {
  return useQuery<FestivalEvent[]>({
    queryKey: ['events', 'status', status],
    queryFn: async () => {
      const events = await getStaticEvents();
      const eventsWithStatus = calculateEventsStatusWithNextEvent(events);
      return eventsWithStatus.filter(event => event.status === status);
    },
    enabled: !!status,
    staleTime: 1000 * 60 * 5,
  });
}

export function useSearchFestivalEvents(query: string) {
  return useQuery<FestivalEvent[]>({
    queryKey: ['events', 'search', query],
    queryFn: async () => {
      const events = await getStaticEvents();
      const searchQuery = query.toLowerCase();
      const filteredEvents = events.filter(event => 
        event.name.toLowerCase().includes(searchQuery) ||
        event.location.toLowerCase().includes(searchQuery) ||
        event.organizer.toLowerCase().includes(searchQuery) ||
        event.type.toLowerCase().includes(searchQuery)
      );
      return calculateEventsStatusWithNextEvent(filteredEvents);
    },
    enabled: !!query && query.length > 2,
    staleTime: 1000 * 60 * 2,
  });
}
