// src/lib/festival-analytics.ts
// Analytics específicos para la aplicación "Mislata en Festes"

import { trackEvent } from './analytics';
import type { FestivalEvent } from '@shared/schema';

// ---- Eventos de búsqueda ----

/**
 * Trackea búsquedas de eventos en la aplicación
 */
export const trackSearch = (
  searchTerm: string, 
  resultsCount: number,
  searchLocation: 'header' | 'mobile' = 'header'
) => {
  if (!searchTerm.trim()) return;
  
  trackEvent('search', {
    search_term: searchTerm.toLowerCase().trim(),
    results_count: resultsCount,
    search_location: searchLocation,
    has_results: resultsCount > 0,
  });
};

/**
 * Trackea cuando el usuario limpia la búsqueda
 */
export const trackSearchClear = (searchLocation: 'header' | 'mobile' = 'header') => {
  trackEvent('search_clear', {
    search_location: searchLocation,
  });
};

// ---- Eventos de favoritos ----

/**
 * Trackea cuando un usuario añade/quita un evento de favoritos
 */
export const trackFavoriteToggle = (
  event: FestivalEvent, 
  action: 'add' | 'remove',
  currentFavoritesCount: number,
  context: 'event_card' | 'favorites_modal' = 'event_card'
) => {
  trackEvent('favorite_event', {
    event_id: event.id,
    event_name: event.name,
    event_category: event.category,
    event_type: event.type,
    event_status: event.status,
    event_date: event.date,
    action: action,
    favorite_count: currentFavoritesCount,
    context: context,
  });
};

/**
 * Trackea apertura del modal de favoritos
 */
export const trackFavoritesModalOpen = (favoritesCount: number) => {
  trackEvent('favorites_modal_open', {
    favorites_count: favoritesCount,
    has_favorites: favoritesCount > 0,
  });
};

// ---- Eventos de calendario ----

/**
 * Trackea apertura del modal de calendario
 */
export const trackCalendarOpen = (favoritesCount: number, currentDate: string) => {
  trackEvent('calendar_open', {
    current_favorites: favoritesCount,
    current_date: currentDate,
  });
};

/**
 * Trackea clicks en fechas del calendario
 */
export const trackCalendarDateClick = (
  selectedDate: string,
  eventsOnDate: number,
  hasFavoritesOnDate: boolean
) => {
  trackEvent('calendar_date_click', {
    selected_date: selectedDate,
    events_on_date: eventsOnDate,
    has_favorites_on_date: hasFavoritesOnDate,
  });
};

// ---- Eventos de navegación ----

/**
 * Trackea scroll to top
 */
export const trackScrollToTop = () => {
  trackEvent('scroll_to_top', {
    action_type: 'floating_button',
  });
};

/**
 * Trackea navegación a fecha específica
 */
export const trackScrollToDate = (targetDate: string, eventsCount: number) => {
  trackEvent('scroll_to_date', {
    target_date: targetDate,
    events_count: eventsCount,
    navigation_method: 'calendar',
  });
};

// ---- Eventos de engagement ----

/**
 * Trackea visualización de eventos (usar con Intersection Observer)
 */
export const trackEventView = (
  event: FestivalEvent,
  viewMethod: 'scroll' | 'search' | 'calendar' | 'favorites' = 'scroll'
) => {
  trackEvent('event_view', {
    event_id: event.id,
    event_category: event.category,
    event_type: event.type,
    event_status: event.status,
    event_date: event.date,
    view_method: viewMethod,
  });
};

/**
 * Trackea cuando el usuario interactúa con eventos de "hoy"
 */
export const trackTodayEventsView = (todayEventsCount: number) => {
  if (todayEventsCount === 0) return;
  
  trackEvent('today_events_view', {
    today_events_count: todayEventsCount,
    has_today_events: true,
  });
};

/**
 * Trackea qué categorías de eventos son más populares
 */
export const trackEventCategoryInteraction = (
  category: 'patronales' | 'populares',
  action: 'view' | 'favorite' | 'search'
) => {
  trackEvent('event_category_interaction', {
    event_category: category,
    interaction_type: action,
  });
};

/**
 * Trackea qué tipos de eventos son más populares
 */
export const trackEventTypeInteraction = (
  eventType: string,
  action: 'view' | 'favorite' | 'search'
) => {
  trackEvent('event_type_interaction', {
    event_type: eventType,
    interaction_type: action,
  });
};

// ---- Métricas de comportamiento ----

/**
 * Trackea el estado de la sesión del usuario
 */
export const trackUserSessionMetrics = (
  totalEvents: number,
  favoritesCount: number,
  searchPerformed: boolean
) => {
  trackEvent('session_metrics', {
    total_events_available: totalEvents,
    user_favorites_count: favoritesCount,
    search_performed: searchPerformed,
    engagement_level: getEngagementLevel(favoritesCount, searchPerformed),
  });
};

/**
 * Determina el nivel de engagement del usuario
 */
const getEngagementLevel = (favoritesCount: number, searchPerformed: boolean): string => {
  if (favoritesCount >= 5 && searchPerformed) return 'high';
  if (favoritesCount >= 2 || searchPerformed) return 'medium';
  return 'low';
};

// ---- Eventos específicos del festival ----

/**
 * Trackea interés por eventos que están ocurriendo ahora
 */
export const trackOngoingEventsInterest = (ongoingEventsCount: number) => {
  if (ongoingEventsCount === 0) return;
  
  trackEvent('ongoing_events_interest', {
    ongoing_events_count: ongoingEventsCount,
    timestamp: new Date().toISOString(),
  });
};

/**
 * Trackea el uso de la app durante el festival vs fuera del festival
 */
export const trackFestivalPeriodUsage = (
  isActiveFestivalPeriod: boolean,
  userFavoritesCount: number
) => {
  trackEvent('festival_period_usage', {
    is_active_festival: isActiveFestivalPeriod,
    user_engagement: userFavoritesCount,
    usage_context: isActiveFestivalPeriod ? 'during_festival' : 'planning_phase',
  });
};
