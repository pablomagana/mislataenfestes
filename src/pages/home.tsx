import React, { useState, useMemo, useRef, lazy, Suspense } from "react";
import Header from "@/components/header";
import EventCard from "@/components/event-card";
import { useFestivalEvents } from "@/hooks/use-festival-events";
import { useFavorites } from "@/hooks/use-favorites";
import { Button } from "@/components/ui/button";
import { OutboundLink } from "@/components/analytics";

// Lazy load heavy modals
const FavoritesModal = lazy(() => import("@/components/favorites-modal"));
const CalendarModal = lazy(() => import("@/components/calendar-modal"));

import { ArrowUp } from "lucide-react";
import type { FestivalEvent } from "@shared/schema";
import { formatEventDate } from "@/lib/date-utils";
import { trackScrollToTop, trackScrollToDate } from "@/lib/festival-analytics";

export default function Home() {
  const [searchQuery, setSearchQuery] = useState("");
  const [showFavoritesModal, setShowFavoritesModal] = useState(false);
  const [showCalendarModal, setShowCalendarModal] = useState(false);
  const [showMobileSearch, setShowMobileSearch] = useState(false);
  
  // Refs for scrolling to specific dates
  const dateRefs = useRef<Record<string, HTMLDivElement | null>>({});

  const { data: allEvents = [], isLoading } = useFestivalEvents();
  const { favorites, toggleFavorite, isFavorite } = useFavorites();

  // Get today's date
  const today = new Date().toISOString().split('T')[0];

  // Filter events by search query
  const filteredEvents = useMemo(() => {
    if (!searchQuery) return allEvents;
    
    const query = searchQuery.toLowerCase();
    return allEvents.filter((event: FestivalEvent) => 
      event.name.toLowerCase().includes(query) ||
      event.location.toLowerCase().includes(query) ||
      event.organizer.toLowerCase().includes(query) ||
      event.type.toLowerCase().includes(query)
    );
  }, [allEvents, searchQuery]);

  // Get today's events
  const todayEvents = useMemo(() => {
    return filteredEvents
      .filter(event => event.date === today)
      .sort((a, b) => {
        // Use order field if available, otherwise fallback to time sorting
        if (a.order && b.order) {
          return a.order.localeCompare(b.order);
        }
        return a.time.localeCompare(b.time);
      });
  }, [filteredEvents, today]);

  // Get future events (tomorrow and onwards)
  const futureEvents = useMemo(() => {
    return filteredEvents
      .filter(event => event.date > today)
      .sort((a, b) => {
        if (a.date === b.date) {
          // Use order field if available, otherwise fallback to time sorting
          if (a.order && b.order) {
            return a.order.localeCompare(b.order);
          }
          return a.time.localeCompare(b.time);
        }
        return a.date.localeCompare(b.date);
      });
  }, [filteredEvents, today]);

  // Group future events by date
  const futureEventsByDate = useMemo(() => {
    const grouped = futureEvents.reduce((acc, event) => {
      if (!acc[event.date]) {
        acc[event.date] = [];
      }
      acc[event.date].push(event);
      return acc;
    }, {} as Record<string, FestivalEvent[]>);

    return grouped;
  }, [futureEvents]);

  // Get sorted future dates
  const futureDates = useMemo(() => {
    return Object.keys(futureEventsByDate).sort();
  }, [futureEventsByDate]);

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
    trackScrollToTop();
  };

  const scrollToDate = (date: string) => {
    const element = dateRefs.current[date];
    if (element) {
      element.scrollIntoView({ 
        behavior: 'smooth', 
        block: 'start',
        inline: 'nearest'
      });
      
      // Track navegación a fecha específica
      const eventsCount = futureEventsByDate[date]?.length || 0;
      trackScrollToDate(date, eventsCount);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-xl">Cargando eventos...</div>
      </div>
    );
  }

  return (
    <div className="bg-gray-50 font-sans min-h-screen">
      <Header 
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
        showMobileSearch={showMobileSearch}
        setShowMobileSearch={setShowMobileSearch}
        setShowFavoritesModal={setShowFavoritesModal}
        setShowCalendarModal={setShowCalendarModal}
        filteredEventsCount={filteredEvents.length}
        favoritesCount={favorites.size}
        today={today}
      />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* Today's Events Section */}
        {todayEvents.length > 0 && (
          <div 
            ref={(el) => dateRefs.current[today] = el}
            className="mb-8"
          >
            <div className="bg-gradient-to-r from-festival-orange to-festival-red rounded-xl p-6 mb-6 text-white">
              <h2 className="text-2xl font-display font-bold mb-2">No te pierdas hoy</h2>
              <p className="text-lg opacity-90">{formatEventDate(today)}</p>
            </div>
            
            <div className="space-y-4">
              {todayEvents.map((event) => (
                <EventCard
                  key={event.id}
                  event={event}
                  isFavorite={isFavorite(event.id)}
                  onToggleFavorite={() => toggleFavorite(event.id)}
                  currentFavoritesCount={favorites.size}
                />
              ))}
            </div>
          </div>
        )}

        {/* Future Events Section */}
        {futureDates.length > 0 && (
          <div>
            <div className="bg-white rounded-xl p-6 mb-6 shadow-sm border">
              <h2 className="text-2xl font-display font-bold text-gray-800 mb-2">Mañana y siguientes días</h2>
              <p className="text-gray-600">Próximos eventos del festival</p>
            </div>

            <div className="space-y-8">
              {futureDates.map((date) => (
                <div 
                  key={date} 
                  ref={(el) => dateRefs.current[date] = el}
                  className="border-b border-gray-200 pb-6 last:border-b-0"
                >
                  <div className="mb-4">
                    <h3 className="text-xl font-bold text-gray-800 mb-1">
                      {formatEventDate(date)}
                    </h3>
                    <div className="text-sm text-gray-600">
                      {futureEventsByDate[date]?.length || 0} eventos
                    </div>
                  </div>
                  
                  <div className="space-y-4">
                    {futureEventsByDate[date]?.map((event) => (
                      <EventCard
                        key={event.id}
                        event={event}
                        isFavorite={isFavorite(event.id)}
                        onToggleFavorite={() => toggleFavorite(event.id)}
                        currentFavoritesCount={favorites.size}
                      />
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* No events message */}
        {todayEvents.length === 0 && futureDates.length === 0 && (
          <div className="text-center py-12">
            <div className="text-gray-500 text-lg">
              {searchQuery ? "No se encontraron eventos" : "No hay eventos programados"}
            </div>
            <div className="text-gray-400 text-sm mt-2">
              {searchQuery && "Prueba a ajustar la búsqueda"}
            </div>
          </div>
        )}
      </main>

      {/* Floating Action Button */}
      <div className="fixed bottom-16 right-6">
        <Button
          onClick={scrollToTop}
          className="bg-white text-gray-600 p-3 rounded-full shadow-lg hover:shadow-xl transition-shadow"
          size="icon"
        >
          <ArrowUp className="w-5 h-5" />
        </Button>
      </div>

      {showFavoritesModal && (
        <Suspense fallback={<div>Cargando...</div>}>
          <FavoritesModal
            isOpen={showFavoritesModal}
            onClose={() => setShowFavoritesModal(false)}
            favoriteEvents={allEvents.filter(event => isFavorite(event.id))}
            onRemoveFavorite={toggleFavorite}
          />
        </Suspense>
      )}

      {showCalendarModal && (
        <Suspense fallback={<div>Cargando...</div>}>
          <CalendarModal
            isOpen={showCalendarModal}
            onClose={() => setShowCalendarModal(false)}
            events={allEvents}
            favoriteEventIds={Array.from(favorites)}
            onDayClick={scrollToDate}
          />
        </Suspense>
      )}

      {/* Footer */}
      <footer className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 py-3 text-center shadow-md z-10">
        <p className="text-gray-500 text-sm">
          Desarrollada por {' '}
          <OutboundLink 
            href="https://pablomagana.es" 
            linkId="footer_developer"
            className="text-gray-500 hover:text-gray-700 transition-colors underline"
          >
            pablomagana.es
          </OutboundLink>
        </p>
      </footer>
    </div>
  );
}
