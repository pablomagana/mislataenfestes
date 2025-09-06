// Lógica de tiempo específica para festivales
// Los eventos de madrugada (00:00-03:00) se consideran del día anterior

/**
 * Obtiene la fecha "festivalera" actual.
 * Si son menos de las 3:00 AM, devuelve el día anterior.
 * Esto permite que eventos de madrugada se consideren parte de la noche anterior.
 */
export function getFestivalToday(): string {
  const now = new Date();
  const hour = now.getHours();
  
  // Si son menos de las 3:00 AM, consideramos que seguimos en el día anterior
  if (hour < 3) {
    const yesterday = new Date(now);
    yesterday.setDate(yesterday.getDate() - 1);
    return yesterday.toISOString().split('T')[0];
  }
  
  return now.toISOString().split('T')[0];
}

/**
 * Convierte un evento a su "fecha festivalera".
 * Los eventos de 00:00 a 02:59 se consideran del día anterior.
 */
export function getEventFestivalDate(eventDate: string, eventTime: string): string {
  const [hours] = eventTime.split(':').map(Number);
  
  // Si el evento es de madrugada (00:00-02:59), pertenece al día anterior
  if (hours >= 0 && hours < 3) {
    const date = new Date(eventDate);
    date.setDate(date.getDate() - 1);
    return date.toISOString().split('T')[0];
  }
  
  return eventDate;
}

/**
 * Determina el status real de un evento considerando el "tiempo festivalero"
 */
export function getFestivalEventStatus(
  eventDate: string, 
  eventTime: string, 
  originalStatus: string
): 'upcoming' | 'ongoing' | 'finished' {
  // Si el status original no es automático (viene predefinido), lo respetamos
  if (originalStatus === 'ongoing') {
    return 'ongoing';
  }
  
  const festivalToday = getFestivalToday();
  const eventFestivalDate = getEventFestivalDate(eventDate, eventTime);
  
  // Comparar fechas festivaleras
  if (eventFestivalDate < festivalToday) {
    return 'finished';
  } else if (eventFestivalDate === festivalToday) {
    // Evento es hoy en términos festivaleros
    return getEventStatusForToday(eventTime);
  } else {
    return 'upcoming';
  }
}

/**
 * Para eventos del día festivalero actual, determina si están ongoing, upcoming o finished
 */
function getEventStatusForToday(eventTime: string): 'upcoming' | 'ongoing' | 'finished' {
  const now = new Date();
  const [eventHours, eventMinutes] = eventTime.split(':').map(Number);
  
  // Crear fecha del evento para hoy
  const eventDateTime = new Date();
  eventDateTime.setHours(eventHours, eventMinutes, 0, 0);
  
  // Si el evento es de madrugada, podría ser de "ayer" en términos festivaleros
  if (eventHours >= 0 && eventHours < 3) {
    // Si ahora es también madrugada (mismo día festivalero), comparar normalmente
    if (now.getHours() < 3) {
      const timeDiff = now.getTime() - eventDateTime.getTime();
      if (timeDiff < 0) return 'upcoming';
      if (timeDiff < 2 * 60 * 60 * 1000) return 'ongoing'; // 2 horas de duración
      return 'finished';
    } else {
      // Si ahora es de día pero el evento es de madrugada, ya pasó
      return 'finished';
    }
  }
  
  // Para eventos de día normal
  const timeDiff = now.getTime() - eventDateTime.getTime();
  if (timeDiff < 0) return 'upcoming';
  if (timeDiff < 2 * 60 * 60 * 1000) return 'ongoing'; // 2 horas de duración típica
  return 'finished';
}

/**
 * Agrupa eventos por su fecha festivalera (considerando madrugadas como día anterior)
 */
export function groupEventsByFestivalDate<T extends { date: string; time: string }>(
  events: T[]
): Record<string, T[]> {
  return events.reduce((groups, event) => {
    const festivalDate = getEventFestivalDate(event.date, event.time);
    if (!groups[festivalDate]) {
      groups[festivalDate] = [];
    }
    groups[festivalDate].push(event);
    return groups;
  }, {} as Record<string, T[]>);
}

/**
 * Ordena eventos considerando que los de madrugada van al final del día anterior
 */
export function sortEventsByFestivalTime<T extends { date: string; time: string; order?: string }>(
  events: T[]
): T[] {
  return events.sort((a, b) => {
    // Primero por fecha festivalera
    const festivalDateA = getEventFestivalDate(a.date, a.time);
    const festivalDateB = getEventFestivalDate(b.date, b.time);
    
    if (festivalDateA !== festivalDateB) {
      return festivalDateA.localeCompare(festivalDateB);
    }
    
    // Mismo día festivalero - ordenar por hora pero con lógica especial
    const [hoursA, minutesA] = a.time.split(':').map(Number);
    const [hoursB, minutesB] = b.time.split(':').map(Number);
    
    // Convertir horas de madrugada a equivalente "tarde del día anterior"
    const adjustedHoursA = hoursA < 3 ? hoursA + 24 : hoursA;
    const adjustedHoursB = hoursB < 3 ? hoursB + 24 : hoursB;
    
    // Usar order si está disponible
    if (a.order && b.order) {
      return a.order.localeCompare(b.order);
    }
    
    // Comparar por hora ajustada
    if (adjustedHoursA !== adjustedHoursB) {
      return adjustedHoursA - adjustedHoursB;
    }
    
    return minutesA - minutesB;
  });
}

/**
 * Obtiene el "hoy" festivalero para mostrar en UI
 */
export function getFestivalTodayForDisplay(): string {
  return getFestivalToday();
}
