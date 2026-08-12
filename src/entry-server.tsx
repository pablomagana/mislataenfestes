import { renderToString } from "react-dom/server";
import { Switch, Route, Router } from "wouter";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { TooltipProvider } from "@/components/ui/tooltip";
import Home from "@/pages/home";
import About from "@/pages/about";
import EventDetail from "@/pages/event-detail";
import NotFound from "@/pages/not-found";
import eventsData from "@/data/events.json";
import type { FestivalEvent } from "@shared/schema";
import { calculateEventStatusFestival } from "@/lib/festival-time";

// Pre-compute event statuses (same logic as useFestivalEvents)
function getEventsWithStatus(): FestivalEvent[] {
  const events = eventsData as FestivalEvent[];
  const eventsByDate = events.reduce((acc, event) => {
    if (!acc[event.date]) acc[event.date] = [];
    acc[event.date].push(event);
    return acc;
  }, {} as Record<string, FestivalEvent[]>);

  return events.map((event) => {
    const dayEvents = eventsByDate[event.date] || [];
    dayEvents.sort((a, b) => a.time.localeCompare(b.time));
    return { ...event, status: calculateEventStatusFestival(event.date, event.time, dayEvents) };
  });
}

function AppShell({ queryClient, path }: { queryClient: QueryClient; path: string }) {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Router ssrPath={path}>
          <Switch>
            <Route path="/" component={Home} />
            <Route path="/about" component={About} />
            <Route path="/evento/:eventId">
              {(params) => <EventDetail eventId={params.eventId} />}
            </Route>
            <Route component={NotFound} />
          </Switch>
        </Router>
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export function render(url: string): string {
  const allEvents = getEventsWithStatus();

  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false, staleTime: Infinity } },
  });

  // Pre-seed TanStack Query cache so components render with data (not loading state)
  queryClient.setQueryData(["events"], allEvents);

  // For event detail pages, also seed the individual event query
  const eventMatch = url.match(/^\/evento\/(.+)$/);
  if (eventMatch) {
    const event = allEvents.find((e) => e.id === eventMatch[1]) || null;
    queryClient.setQueryData(["event", eventMatch[1]], event);
  }

  return renderToString(<AppShell queryClient={queryClient} path={url} />);
}
