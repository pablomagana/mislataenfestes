// src/hooks/use-analytics.tsx
import { useEffect, useRef } from "react";
import { useLocation } from "wouter";
import { trackPageView } from "@/lib/analytics";

interface UseAnalyticsOptions {
  /** Si incluir cambios de hash en el tracking (default: false) */
  countHashChanges?: boolean;
  /** Retraso en ms antes de trackear (default: 0) */
  delay?: number;
  /** Si hacer debug de los cambios de ruta (default: false) */
  debug?: boolean;
}

export const useAnalytics = (options: UseAnalyticsOptions = {}) => {
  const [location] = useLocation();
  const prevPathRef = useRef<string>("");
  const timeoutRef = useRef<number>();
  
  const {
    countHashChanges = false,
    delay = 0,
    debug = false
  } = options;

  useEffect(() => {
    // Limpia timeout anterior si existe
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }

    // Construye el path actual
    const pathname = window.location.pathname;
    const search = window.location.search;
    const hash = countHashChanges ? window.location.hash : "";
    const currentPath = pathname + search + hash;

    // Evita duplicados
    if (currentPath === prevPathRef.current) {
      if (debug) {
        console.log('[useAnalytics] Skip tracking - same path:', currentPath);
      }
      return;
    }

    if (debug) {
      console.log('[useAnalytics] Route change detected:', {
        from: prevPathRef.current,
        to: currentPath,
        location
      });
    }

    // Ejecuta el tracking con retraso si especificado
    const trackPage = () => {
      // Espera un frame adicional para que el document.title se actualice
      requestAnimationFrame(() => {
        trackPageView(currentPath, countHashChanges);
        prevPathRef.current = currentPath;
        
        if (debug) {
          console.log('[useAnalytics] Page tracked:', {
            path: currentPath,
            title: document.title
          });
        }
      });
    };

    if (delay > 0) {
      timeoutRef.current = window.setTimeout(trackPage, delay);
    } else {
      trackPage();
    }

    // Cleanup function
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, [location, countHashChanges, delay, debug]);

  // Cleanup al desmontar
  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);
};
