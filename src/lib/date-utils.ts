import { format, parse } from "date-fns";
import { es } from "date-fns/locale";

export function formatEventDate(dateString: string): string {
  try {
    const date = parse(dateString, "yyyy-MM-dd", new Date());
    return format(date, "EEEE, d 'de' MMMM", { locale: es });
  } catch (error) {
    return dateString;
  }
}

export function formatTabDate(dateString: string): string {
  try {
    const date = parse(dateString, "yyyy-MM-dd", new Date());
    return format(date, "EEE d/MM", { locale: es });
  } catch (error) {
    return dateString;
  }
}

export function formatEventTime(timeString: string): string {
  // timeString is in format "HH:MM"
  return timeString;
}

export function formatEventDateTime(dateString: string, timeString: string): string {
  try {
    const date = parse(dateString, "yyyy-MM-dd", new Date());
    const formattedDate = format(date, "EEEE, d 'de' MMMM", { locale: es });
    return `${formattedDate} a las ${timeString}`;
  } catch (error) {
    return `${dateString} a las ${timeString}`;
  }
}

import { 
  isEventOngoingFestival, 
  isEventUpcomingFestival, 
  isEventFinishedFestival 
} from './festival-time';

type EventBasic = {
  date: string;
  time: string;
  id?: string;
};

export function isEventOngoing(dateString: string, timeString: string, allDayEvents?: EventBasic[]): boolean {
  return isEventOngoingFestival(dateString, timeString, allDayEvents);
}

export function isEventUpcoming(dateString: string, timeString: string, allDayEvents?: EventBasic[]): boolean {
  return isEventUpcomingFestival(dateString, timeString, allDayEvents);
}

export function isEventFinished(dateString: string, timeString: string, allDayEvents?: EventBasic[]): boolean {
  return isEventFinishedFestival(dateString, timeString, allDayEvents);
}
