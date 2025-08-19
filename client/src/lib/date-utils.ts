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

export function isEventOngoing(dateString: string, timeString: string): boolean {
  try {
    const eventDate = parse(`${dateString} ${timeString}`, "yyyy-MM-dd HH:mm", new Date());
    const now = new Date();
    const eventEnd = new Date(eventDate.getTime() + (2 * 60 * 60 * 1000)); // Assume 2 hour duration
    
    return now >= eventDate && now <= eventEnd;
  } catch (error) {
    return false;
  }
}

export function isEventUpcoming(dateString: string, timeString: string): boolean {
  try {
    const eventDate = parse(`${dateString} ${timeString}`, "yyyy-MM-dd HH:mm", new Date());
    const now = new Date();
    
    return eventDate > now;
  } catch (error) {
    return false;
  }
}

export function isEventFinished(dateString: string, timeString: string): boolean {
  try {
    const eventDate = parse(`${dateString} ${timeString}`, "yyyy-MM-dd HH:mm", new Date());
    const now = new Date();
    const eventEnd = new Date(eventDate.getTime() + (2 * 60 * 60 * 1000)); // Assume 2 hour duration
    
    return now > eventEnd;
  } catch (error) {
    return false;
  }
}
