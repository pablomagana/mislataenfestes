// src/App.tsx
import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/not-found";
import Home from "@/pages/home";
import { useEffect } from "react";
import { initGA, setAnalyticsConsent, trackPageView } from "./lib/analytics";
import { useAnalytics } from "./hooks/use-analytics";
import CookieBanner from "@/components/cookie-banner";
import { useCookieConsent } from "@/hooks/use-cookie-consent";

function Router() {
 useAnalytics({ countHashChanges: false });
  return (
    <Switch>
      <Route path="/" component={Home} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  const { consent } = useCookieConsent();

  useEffect(() => {
    // Sin ID, avisa y no hagas nada
    if (!import.meta.env.VITE_GA_MEASUREMENT_ID) {
      console.warn("Missing VITE_GA_MEASUREMENT_ID");
      return;
    }

    // Actualiza el Consent Mode y (si procede) inicializa GA
    if (consent?.analytics === true) {
      setAnalyticsConsent(true);  // actualiza Consent Mode
      initGA();                   // inyecta gtag si no existe
      // Envía el primer page_view de la ruta actual (importante en SPA)
      trackPageView(window.location.pathname + window.location.search);
    } else if (consent && consent.analytics === false) {
      setAnalyticsConsent(false);
      // (opcional) aquí NO destruimos GA; solo denegamos analytics_storage
    }
  }, [consent]);

  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Router />
        <CookieBanner />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
