// src/hooks/use-analytics.ts
import { useEffect, useRef } from "react";
import { useLocation } from "wouter";
import { trackPageView } from "@/lib/analytics";

export const useAnalytics = (options?: { countHashChanges?: boolean }) => {
  const [location] = useLocation();
  const prevPathRef = useRef<string>("");

  useEffect(() => {
    // Construye el path con query (y hash si procede)
    const path =
      window.location.pathname +
      window.location.search +
      (options?.countHashChanges ? window.location.hash : "");

    if (path === prevPathRef.current) return;

    // Espera 1 frame para que title/url estén listas
    const id = requestAnimationFrame(() => {
      trackPageView(path);
      prevPathRef.current = path;
    });

    return () => cancelAnimationFrame(id);
  }, [location, options?.countHashChanges]);
};
