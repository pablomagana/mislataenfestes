// src/analytics.ts

// ---- Tipos globales ----
declare global {
  interface Window {
    dataLayer: any[];
    gtag: (...args: any[]) => void;
    __gaInitialized?: boolean;
  }
}

// ---- Config ----
const GA_ID = import.meta.env.VITE_GA_MEASUREMENT_ID; // ej: G-438BRCNW8N
const CONSENT_KEY = 'cookie-consent';

// ---- Helpers internos ----
const hasAnalyticsConsent = (): boolean => {
  try {
    const raw = localStorage.getItem(CONSENT_KEY);
    if (!raw) return false;
    const parsed = JSON.parse(raw);
    return parsed?.analytics === true;
  } catch {
    return false;
  }
};

const ensureDataLayer = () => {
  window.dataLayer = window.dataLayer || [];
  if (!window.gtag) {
    window.gtag = function () {
      window.dataLayer.push(arguments);
    };
  }
};

const loadGAScript = (measurementId: string) => {
  // Evita insertar el mismo script varias veces
  if (document.querySelector(`script[src*="gtag/js?id=${measurementId}"]`)) return;

  const script = document.createElement('script');
  script.async = true;
  script.src = `https://www.googletagmanager.com/gtag/js?id=${measurementId}`;
  document.head.appendChild(script);
};

// ---- API pública ----

/**
 * Inicializa GA4 de forma idempotente.
 * - Define dataLayer/gtag
 * - Aplica Consent Mode por defecto (denied) hasta que el usuario consienta
 * - Carga gtag.js
 * - Configura GA con send_page_view: false para SPA
 */
export const initGA = () => {
  if (typeof window === 'undefined') return;
  if (!GA_ID) {
    console.warn('Missing required Google Analytics key: VITE_GA_MEASUREMENT_ID');
    return;
  }
  if (window.__gaInitialized) return;

  ensureDataLayer();

  // Consent Mode por defecto: denied (hasta que haya consentimiento)
  window.gtag('consent', 'default', {
    ad_storage: 'denied',
    analytics_storage: hasAnalyticsConsent() ? 'granted' : 'denied',
    ad_user_data: 'denied',
    ad_personalization: 'denied',
    functionality_storage: 'granted', // opcional según tu política
    security_storage: 'granted',      // opcional según tu política
  });

  // Marca de inicio
  window.gtag('js', new Date());

  // Carga el script
  loadGAScript(GA_ID);

  // Config principal (SPA: sin pageview automático)
  window.gtag('config', GA_ID, {
    send_page_view: false,
  });

  window.__gaInitialized = true;
};

/**
 * Actualiza el consentimiento y lo persiste en localStorage.
 * Úsalo cuando el usuario acepte/deniegue en tu banner de cookies.
 */
export const setAnalyticsConsent = (granted: boolean) => {
  try {
    const current = JSON.parse(localStorage.getItem(CONSENT_KEY) || '{}');
    const next = { ...current, analytics: granted };
    localStorage.setItem(CONSENT_KEY, JSON.stringify(next));
  } catch {
    // no-op
  }

  if (typeof window !== 'undefined' && window.gtag) {
    window.gtag('consent', 'update', {
      analytics_storage: granted ? 'granted' : 'denied',
    });
  }
};

/**
 * Dispara page_view manual en cada navegación (SPA).
 * Ej: on route change → trackPageView(location.pathname + location.search)
 */
export const trackPageView = (url: string) => {
  if (typeof window === 'undefined' || !window.gtag || !GA_ID) return;
  if (!hasAnalyticsConsent()) return;

  // Puedes usar 'config' o 'event'. GA4 recomienda evento explícito:
  window.gtag('event', 'page_view', {
    page_path: url,
    page_location: typeof window !== 'undefined' ? window.location.href : url,
    page_title: typeof document !== 'undefined' ? document.title : undefined,
    send_to: GA_ID,
  });
};

/**
 * Dispara eventos GA4.
 * Usa nombres y params GA4 (p.ej. 'login', 'search', 'select_promotion', etc.)
 * @param action Nombre del evento (GA4)
 * @param params Parámetros GA4 (ej: { value: 9.99, currency: 'EUR' })
 */
export const trackEvent = (action: string, params: Record<string, any> = {}) => {
  if (typeof window === 'undefined' || !window.gtag) return;
  if (!hasAnalyticsConsent()) return;

  window.gtag('event', action, params);
};
