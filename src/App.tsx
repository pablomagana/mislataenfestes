// src/App.tsx
import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { useEffect } from "react";
import { initGA, setAnalyticsConsent, trackPageView } from "./lib/analytics";
import { useAnalytics } from "./hooks/use-analytics";
import CookieBanner from "@/components/cookie-banner";
import { useCookieConsent } from "@/hooks/use-cookie-consent";
import Home from "@/pages/home";
import About from "@/pages/about";
import EventDetail from "@/pages/event-detail";
import NotFound from "@/pages/not-found";

function Router() {
  useAnalytics({ countHashChanges: false });
  return (
    <Switch>
      <Route path="/" component={Home} />
      <Route path="/about" component={About} />
      <Route path="/evento/:eventId">
        {(params) => <EventDetail eventId={params.eventId} />}
      </Route>
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  const { consent } = useCookieConsent();

  useEffect(() => {
    // Manejo async de la inicialización
    const initializeAnalytics = async () => {
      // Actualiza el Consent Mode y (si procede) inicializa GA
      if (consent?.analytics === true) {
        setAnalyticsConsent(true);  // actualiza Consent Mode
        
        try {
          await initGA();                   // inyecta gtag si no existe (ahora async)
          // Envía el primer page_view de la ruta actual (importante en SPA)
          trackPageView(window.location.pathname + window.location.search);
        } catch (error) {
          console.error("[GA4] Failed to initialize analytics:", error);
        }
      } else if (consent && consent.analytics === false) {
        setAnalyticsConsent(false);
        // (opcional) aquí NO destruimos GA; solo denegamos analytics_storage
      }
    };

    initializeAnalytics();
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
