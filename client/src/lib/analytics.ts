// src/lib/analytics.ts

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

// ---- Debug helpers ----
const isProduction = import.meta.env.PROD;
const debug = (message: string, ...args: any[]) => {
  if (!isProduction) {
    console.log(`[GA4] ${message}`, ...args);
  }
};

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
    debug('gtag function created');
  }
};

const loadGAScript = (measurementId: string): Promise<void> => {
  return new Promise((resolve, reject) => {
    // Evita insertar el mismo script varias veces
    const existingScript = document.querySelector(`script[src*="gtag/js?id=${measurementId}"]`);
    if (existingScript) {
      debug('GA script already loaded');
      resolve();
      return;
    }

    const script = document.createElement('script');
    script.async = true;
    script.src = `https://www.googletagmanager.com/gtag/js?id=${measurementId}`;
    
    script.onload = () => {
      debug('GA script loaded successfully');
      resolve();
    };
    
    script.onerror = () => {
      console.error('[GA4] Failed to load gtag script');
      reject(new Error('Failed to load gtag script'));
    };
    
    document.head.appendChild(script);
    debug('GA script injected', script.src);
  });
};

// ---- API pública ----

/**
 * Inicializa GA4 de forma idempotente.
 * - Define dataLayer/gtag
 * - Aplica Consent Mode por defecto (denied) hasta que el usuario consienta
 * - Carga gtag.js
 * - Configura GA con send_page_view: false para SPA
 */
export const initGA = async (): Promise<void> => {
  if (typeof window === 'undefined') {
    debug('Skipping GA init: server-side');
    return;
  }
  
  if (!GA_ID) {
    console.warn('[GA4] Missing required Google Analytics key: VITE_GA_MEASUREMENT_ID');
    return;
  }
  
  if (window.__gaInitialized) {
    debug('GA already initialized');
    return;
  }

  debug('Initializing GA4', GA_ID);
  ensureDataLayer();

  // Consent Mode por defecto: denied (hasta que haya consentimiento)
  const consentState = hasAnalyticsConsent() ? 'granted' : 'denied';
  
  window.gtag('consent', 'default', {
    ad_storage: 'denied',
    analytics_storage: consentState,
    ad_user_data: 'denied',
    ad_personalization: 'denied',
    functionality_storage: 'granted', // opcional según tu política
    security_storage: 'granted',      // opcional según tu política
  });
  
  debug('Consent mode set to:', { analytics_storage: consentState });

  // Marca de inicio
  window.gtag('js', new Date());

  try {
    // Carga el script y espera a que se complete
    await loadGAScript(GA_ID);
    
    // Config principal (SPA: sin pageview automático)
    window.gtag('config', GA_ID, {
      send_page_view: false,
      debug_mode: !isProduction,
    });
    
    window.__gaInitialized = true;
    debug('GA4 initialization completed');
  } catch (error) {
    console.error('[GA4] Initialization failed:', error);
  }
};

/**
 * Actualiza el consentimiento y lo persiste en localStorage.
 * Úsalo cuando el usuario acepte/deniegue en tu banner de cookies.
 */
/**
 * Actualiza el consentimiento y lo persiste en localStorage.
 * Úsalo cuando el usuario acepte/deniegue en tu banner de cookies.
 */
export const setAnalyticsConsent = (granted: boolean) => {
  try {
    const current = JSON.parse(localStorage.getItem(CONSENT_KEY) || '{}');
    const next = { ...current, analytics: granted };
    localStorage.setItem(CONSENT_KEY, JSON.stringify(next));
    debug('Analytics consent updated in localStorage:', granted);
  } catch (error) {
    console.error('[GA4] Failed to update consent in localStorage:', error);
  }

  if (typeof window !== 'undefined' && window.gtag) {
    window.gtag('consent', 'update', {
      analytics_storage: granted ? 'granted' : 'denied',
    });
    debug('GA consent mode updated:', granted ? 'granted' : 'denied');
  }
};

/**
 * Dispara page_view manual en cada navegación (SPA).
 * Añade automáticamente search params y opcionalmente hash.
 * @param path - Ruta de la página (pathname + search)
 * @param includeHash - Si incluir el hash en la URL (default: false)
 */
export const trackPageView = (path: string, includeHash: boolean = false) => {
  if (typeof window === 'undefined' || !window.gtag || !GA_ID) {
    debug('trackPageView skipped: missing dependencies');
    return;
  }
  
  if (!hasAnalyticsConsent()) {
    debug('trackPageView skipped: no analytics consent');
    return;
  }

  // Construye la URL completa
  const fullPath = path + (includeHash ? window.location.hash : '');
  const pageLocation = window.location.origin + fullPath;
  
  const pageViewData = {
    page_path: fullPath,
    page_location: pageLocation,
    page_title: document.title || undefined,
    send_to: GA_ID,
  };
  
  debug('Tracking page view:', pageViewData);
  
  // GA4 recomienda evento explícito:
  window.gtag('event', 'page_view', pageViewData);
};

/**
 * Dispara eventos GA4.
 * Usa nombres y params GA4 (p.ej. 'login', 'search', 'select_promotion', etc.)
 * @param eventName Nombre del evento (GA4)
 * @param params Parámetros GA4 (ej: { value: 9.99, currency: 'EUR' })
 */
export const trackEvent = (eventName: string, params: Record<string, any> = {}) => {
  if (typeof window === 'undefined' || !window.gtag) {
    debug('trackEvent skipped: missing gtag');
    return;
  }
  
  if (!hasAnalyticsConsent()) {
    debug('trackEvent skipped: no analytics consent');
    return;
  }

  debug('Tracking event:', eventName, params);
  window.gtag('event', eventName, params);
};

// ---- Utilidades de identificación de usuario ----

/**
 * Establece el ID de usuario para tracking cross-device.
 * @param userId - ID único del usuario
 */
export const setUserId = (userId: string) => {
  if (typeof window === 'undefined' || !window.gtag) {
    debug('setUserId skipped: missing gtag');
    return;
  }
  
  debug('Setting user ID:', userId);
  window.gtag('set', { user_id: userId });
};

/**
 * Establece propiedades personalizadas del usuario.
 * @param properties - Objeto con propiedades del usuario
 */
export const setUserProperties = (properties: Record<string, any>) => {
  if (typeof window === 'undefined' || !window.gtag) {
    debug('setUserProperties skipped: missing gtag');
    return;
  }
  
  debug('Setting user properties:', properties);
  window.gtag('set', 'user_properties', properties);
};

// ---- Eventos útiles para la aplicación ----

/**
 * Tracking para clicks en enlaces externos
 */
export const trackOutboundClick = (url: string, linkId?: string) => {
  const domain = new URL(url).hostname;
  trackEvent('click', {
    link_domain: domain,
    link_url: url,
    link_id: linkId || domain,
    outbound: true,
  });
};

/**
 * Tracking para errores 404
 */
export const trackError404 = (path: string) => {
  trackEvent('error_404', {
    page_path: path,
    error_type: '404',
  });
};
