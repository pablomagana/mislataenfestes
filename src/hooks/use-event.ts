import { useQuery } from '@tanstack/react-query';
import type { FestivalEvent } from '@shared/schema';
import eventsData from '../data/events.json';

// Fuente única de datos: el mismo JSON estático que usa el listado
const staticEvents: FestivalEvent[] = eventsData as FestivalEvent[];

async function fetchEvent(eventId: string): Promise<FestivalEvent | null> {
  const event = staticEvents.find(e => e.id === eventId);
  return event || null;
}

// Hook para obtener un evento específico
export function useEvent(eventId: string) {
  return useQuery({
    queryKey: ['event', eventId],
    queryFn: () => fetchEvent(eventId),
    staleTime: 10 * 60 * 1000, // 10 minutos
    gcTime: 30 * 60 * 1000, // 30 minutos en caché
    enabled: !!eventId,
  });
}

// Hook para verificar si un evento existe
export function useEventExists(eventId: string) {
  const { data: event, isLoading, error } = useEvent(eventId);
  
  return {
    exists: !!event,
    isLoading,
    error,
    event
  };
}
