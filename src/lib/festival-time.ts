/**
 * 🌙 LÓGICA DE TIEMPO FESTIVALERO
 * 
 * Los eventos de madrugada (00:00-02:59) se consideran parte del día anterior
 * para evitar confusión en el status. Un evento a las 00:30 del día X
 * realmente pertenece a la "noche del día X-1".
 * 
 * Ejemplos:
 * - Evento 31/08 00:30: Si son las 02:00 del 1/09 → 'En curso'
 * - Evento 31/08 21:00: Si son las 02:00 del 1/09 → 'Terminado'
 */

import { parse, addDays, subDays } from 'date-fns';

// Hora límite para considerar eventos como del día anterior (03:00)
const FESTIVAL_DAY_END_HOUR = 3;

/**
 * Convierte una fecha y hora a "fecha festivalera"
 * Los eventos 00:00-02:59 se consideran del día anterior
 */
export function toFestivalDate(dateString: string, timeString: string): string {
  try {
    const [hours] = timeString.split(':').map(Number);
    
    // Si el evento es entre 00:00 y 02:59, pertenece al día anterior
    if (hours >= 0 && hours < FESTIVAL_DAY_END_HOUR) {
      const originalDate = parse(dateString, 'yyyy-MM-dd', new Date());
      const festivalDate = subDays(originalDate, 1);
      return festivalDate.toISOString().split('T')[0]; // Formato yyyy-MM-dd
    }
    
    return dateString;
  } catch (error) {
    console.warn('Error convirtiendo a fecha festivalera:', error);
    return dateString;
  }
}

/**
 * Obtiene la "fecha festivalera" actual
 * Si son las 00:00-02:59, considera que estamos en el día anterior
 */
export function getCurrentFestivalDate(): string {
  const now = new Date();
  const currentHour = now.getHours();
  
  // Si son las 00:00-02:59, consideramos que seguimos en el día anterior
  if (currentHour >= 0 && currentHour < FESTIVAL_DAY_END_HOUR) {
    const yesterdayFestival = subDays(now, 1);
    return yesterdayFestival.toISOString().split('T')[0];
  }
  
  return now.toISOString().split('T')[0];
}

/**
 * Tipo para eventos con información mínima necesaria
 */
type EventBasic = {
  date: string;
  time: string;
  id?: string;
};

/**
 * Calcula cuándo termina un evento basándose en cuándo empieza el siguiente
 */
function calculateEventEndTime(eventDate: string, eventTime: string, allDayEvents?: EventBasic[]): Date {
  const eventDateTime = parse(`${eventDate} ${eventTime}`, 'yyyy-MM-dd HH:mm', new Date());
  
  if (allDayEvents && allDayEvents.length > 1) {
    // Filtrar solo eventos del mismo día y ordenarlos por hora
    const sameDayEvents = allDayEvents
      .filter(e => e.date === eventDate)
      .sort((a, b) => a.time.localeCompare(b.time));
    
    // Encontrar el índice del evento actual
    const currentEventIndex = sameDayEvents.findIndex(e => e.time === eventTime);
    
    // Si encontramos el evento y hay un siguiente
    if (currentEventIndex !== -1 && currentEventIndex < sameDayEvents.length - 1) {
      const nextEvent = sameDayEvents[currentEventIndex + 1];
      return parse(`${nextEvent.date} ${nextEvent.time}`, 'yyyy-MM-dd HH:mm', new Date());
    }
  }
  
  // Si no hay siguiente evento, usar 2 horas por defecto
  return new Date(eventDateTime.getTime() + (2 * 60 * 60 * 1000));
}

/**
 * Función de debug para eventos de madrugada
 */
function debugMidnightEvent(eventDate: string, eventTime: string) {
  const now = new Date();
  const eventDateTime = parse(`${eventDate} ${eventTime}`, 'yyyy-MM-dd HH:mm', new Date());
  const [eventHour] = eventTime.split(':').map(Number);
  const currentHour = now.getHours();
  
  console.log(`🌙 DEBUG EVENTO MADRUGADA:`, {
    evento: `${eventDate} ${eventTime}`,
    eventHour,
    currentHour,
    nowISOString: now.toISOString(),
    eventDateTimeISOString: eventDateTime.toISOString(),
    isMidnightEvent: eventHour >= 0 && eventHour < 3,
    isCurrentMidnight: currentHour >= 0 && currentHour < 3,
    comparison: {
      now_vs_event: now.getTime() - eventDateTime.getTime(),
      is_now_after_event: now >= eventDateTime
    }
  });
}

/**
 * Calcula el estado de un evento usando lógica festivalera - VERSION SIMPLIFICADA
 * @param eventDate - Fecha del evento (YYYY-MM-DD)
 * @param eventTime - Hora del evento (HH:MM)
 * @param allDayEvents - Opcional: todos los eventos del día para calcular fin basado en siguiente evento
 */
export function calculateEventStatusFestival(
  eventDate: string, 
  eventTime: string, 
  allDayEvents?: EventBasic[]
): 'upcoming' | 'ongoing' | 'finished' {
  try {
    const now = new Date();
    
    // Crear fecha/hora completa del evento
    const eventDateTime = parse(`${eventDate} ${eventTime}`, 'yyyy-MM-dd HH:mm', new Date());
    
    // Calcular cuándo termina el evento (siguiente evento o 2 horas)
    const eventEndTime = calculateEventEndTime(eventDate, eventTime, allDayEvents);
    
    const [eventHour] = eventTime.split(':').map(Number);
    
    // DEBUG para eventos de madrugada
    if (eventHour >= 0 && eventHour < FESTIVAL_DAY_END_HOUR) {
      debugMidnightEvent(eventDate, eventTime);
    }
    
    // SIMPLIFICACIÓN EXTREMA: Solo usar comparación directa de timestamps
    // La lógica festivalera se aplicará SOLO al agrupar eventos, no al calcular status
    
    if (now >= eventDateTime && now < eventEndTime) {
      console.log(`✅ EVENTO EN CURSO: ${eventDate} ${eventTime}`);
      return 'ongoing';
    } else if (now >= eventEndTime) {
      console.log(`❌ EVENTO TERMINADO: ${eventDate} ${eventTime}`);
      return 'finished';
    } else {
      console.log(`⏳ EVENTO PRÓXIMO: ${eventDate} ${eventTime}`);
      return 'upcoming';
    }
  } catch (error) {
    console.warn('Error calculando estado del evento festivalero:', error);
    return 'upcoming';
  }
}

/**
 * Verifica si un evento está en curso usando lógica festivalera
 */
export function isEventOngoingFestival(dateString: string, timeString: string, allDayEvents?: EventBasic[]): boolean {
  return calculateEventStatusFestival(dateString, timeString, allDayEvents) === 'ongoing';
}

/**
 * Verifica si un evento ha terminado usando lógica festivalera
 */
export function isEventFinishedFestival(dateString: string, timeString: string, allDayEvents?: EventBasic[]): boolean {
  return calculateEventStatusFestival(dateString, timeString, allDayEvents) === 'finished';
}

/**
 * Verifica si un evento está por venir usando lógica festivalera
 */
export function isEventUpcomingFestival(dateString: string, timeString: string, allDayEvents?: EventBasic[]): boolean {
  return calculateEventStatusFestival(dateString, timeString, allDayEvents) === 'upcoming';
}

/**
 * Agrupa eventos por fecha festivalera
 * Los eventos de madrugada se agrupan con el día anterior
 */
export function groupEventsByFestivalDate<T extends { date: string; time: string }>(events: T[]): Record<string, T[]> {
  const grouped: Record<string, T[]> = {};
  
  for (const event of events) {
    const festivalDate = toFestivalDate(event.date, event.time);
    
    if (!grouped[festivalDate]) {
      grouped[festivalDate] = [];
    }
    
    grouped[festivalDate].push(event);
  }
  
  // Ordenar eventos dentro de cada día
  Object.keys(grouped).forEach(date => {
    grouped[date].sort((a, b) => {
      const timeA = a.time.split(':').map(Number);
      const timeB = b.time.split(':').map(Number);
      
      // Eventos de madrugada van al final
      const isAMidnight = timeA[0] >= 0 && timeA[0] < FESTIVAL_DAY_END_HOUR;
      const isBMidnight = timeB[0] >= 0 && timeB[0] < FESTIVAL_DAY_END_HOUR;
      
      if (isAMidnight && !isBMidnight) return 1;
      if (!isAMidnight && isBMidnight) return -1;
      
      // Ordenación normal por hora
      const totalMinutesA = timeA[0] * 60 + (timeA[1] || 0);
      const totalMinutesB = timeB[0] * 60 + (timeB[1] || 0);
      
      return totalMinutesA - totalMinutesB;
    });
  });
  
  return grouped;
}
