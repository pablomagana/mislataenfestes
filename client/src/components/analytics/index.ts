// Componente útil para enlaces externos
export { OutboundLink } from './OutboundLink';

// Funciones de tracking específicas para "Mislata en Festes"
export {
  trackSearch,
  trackFavoriteToggle,
  trackCalendarOpen,
  trackCalendarDateClick,
  trackScrollToTop,
  trackScrollToDate,
  trackEventView,
  trackFavoritesModalOpen,
} from '@/lib/festival-analytics';

// Funciones básicas de analytics
export {
  trackEvent,
  trackPageView,
  trackOutboundClick,
  trackError404,
  setUserId,
  setUserProperties,
} from '@/lib/analytics';
