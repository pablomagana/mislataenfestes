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

import { parse } from 'date-fns';

// Hora límite para considerar eventos como del día anterior (05:00)
// El "día festivalero" va desde 8:00 AM hasta 5:00 AM del día siguiente
const FESTIVAL_DAY_END_HOUR = 5;

/**
 * Convierte una fecha y hora a "fecha festivalera"
 * Los eventos 00:00-04:59 se consideran del día anterior
 */
export function toFestivalDate(dateString: string, timeString: string): string {
  try {
    const [hours] = timeString.split(':').map(Number);
    
    // Si el evento es entre 00:00 y 04:59, pertenece al día anterior
    if (hours >= 0 && hours < FESTIVAL_DAY_END_HOUR) {
      // Manipulación directa de string para evitar problemas de zona horaria
      const [year, month, day] = dateString.split('-').map(Number);
      const date = new Date(year, month - 1, day); // mes es 0-indexado
      date.setDate(date.getDate() - 1);
      
      const resultYear = date.getFullYear();
      const resultMonth = (date.getMonth() + 1).toString().padStart(2, '0');
      const resultDay = date.getDate().toString().padStart(2, '0');
      
      return `${resultYear}-${resultMonth}-${resultDay}`;
    }
    
    return dateString;
  } catch (error) {
    console.warn('Error convirtiendo a fecha festivalera:', error);
    return dateString;
  }
}

/**
 * Obtiene la "fecha festivalera" actual
 * Si son las 00:00-04:59, considera que estamos en el día anterior
 */
export function getCurrentFestivalDate(): string {
  const now = new Date();
  const currentHour = now.getHours();
  
  // Si son las 00:00-04:59, consideramos que seguimos en el día anterior
  if (currentHour >= 0 && currentHour < FESTIVAL_DAY_END_HOUR) {
    // Manipulación directa para evitar problemas de zona horaria
    const yesterday = new Date(now);
    yesterday.setDate(yesterday.getDate() - 1);
    
    const year = yesterday.getFullYear();
    const month = (yesterday.getMonth() + 1).toString().padStart(2, '0');
    const day = yesterday.getDate().toString().padStart(2, '0');
    
    return `${year}-${month}-${day}`;
  }
  
  const year = now.getFullYear();
  const month = (now.getMonth() + 1).toString().padStart(2, '0');
  const day = now.getDate().toString().padStart(2, '0');
  
  return `${year}-${month}-${day}`;
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
 * Devuelve la hora de fin de un evento como string ISO con offset de Mislata (+02:00, CEST).
 * Reutiliza la misma regla que el status: fin = inicio del siguiente evento del día, o +2h.
 * Se leen los componentes de reloj del resultado y se etiquetan +02:00, igual que startDate,
 * para que el valor sea consistente sin depender de la zona horaria del entorno.
 */
export function getEventEndISO(eventDate: string, eventTime: string, allDayEvents?: EventBasic[]): string {
  const end = calculateEventEndTime(eventDate, eventTime, allDayEvents);
  const year = end.getFullYear();
  const month = (end.getMonth() + 1).toString().padStart(2, '0');
  const day = end.getDate().toString().padStart(2, '0');
  const hours = end.getHours().toString().padStart(2, '0');
  const minutes = end.getMinutes().toString().padStart(2, '0');
  return `${year}-${month}-${day}T${hours}:${minutes}:00+02:00`;
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
    
    // CORRECCIÓN ZONA HORARIA: Crear fecha/hora del evento en zona horaria española
    const eventDateTime = parse(`${eventDate} ${eventTime}`, 'yyyy-MM-dd HH:mm', new Date());
    
    // Calcular cuándo termina el evento (siguiente evento o 2 horas)
    const eventEndTime = calculateEventEndTime(eventDate, eventTime, allDayEvents);
    
    // LÓGICA SIMPLIFICADA: Comparación directa de timestamps
    if (now >= eventDateTime && now < eventEndTime) {
      return 'ongoing';
    } else if (now >= eventEndTime) {
      return 'finished';
    } else {
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
      
      // Eventos de madrugada (00:00-04:59) van al final
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
