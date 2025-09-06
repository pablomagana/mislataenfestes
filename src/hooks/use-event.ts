import { useQuery } from '@tanstack/react-query';
import type { FestivalEvent } from '@shared/schema';

// Simulamos la API de eventos por ahora, ya que los eventos están en JSON estático
async function fetchEvent(eventId: string): Promise<FestivalEvent | null> {
  try {
    // Por ahora leemos del JSON estático
    const response = await fetch('/api/events.json');
    if (!response.ok) {
      throw new Error('Error fetching events');
    }
    
    const events: FestivalEvent[] = await response.json();
    const event = events.find(e => e.id === eventId);
    
    return event || null;
  } catch (error) {
    console.error('Error fetching event:', error);
    throw error;
  }
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
