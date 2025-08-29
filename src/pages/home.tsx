import React, { useState, useMemo, useRef, lazy, Suspense } from "react";
import Header from "@/components/header";
import EventCard from "@/components/event-card";
import FilterSidebar from "@/components/filter-sidebar";
import { useFestivalEvents } from "@/hooks/use-festival-events";
import { useFavorites } from "@/hooks/use-favorites";
import { Button } from "@/components/ui/button";
import { OutboundLink } from "@/components/analytics";
import type { FilterState } from "@/types/filters";

// Lazy load heavy modals
const FavoritesModal = lazy(() => import("@/components/favorites-modal"));
const CalendarModal = lazy(() => import("@/components/calendar-modal"));

import { ArrowUp, X, Search } from "lucide-react";
import type { FestivalEvent } from "@shared/schema";
import { formatEventDate } from "@/lib/date-utils";
import { trackScrollToTop, trackScrollToDate } from "@/lib/festival-analytics";

export default function Home() {
  const [searchQuery, setSearchQuery] = useState("");
  const [showFavoritesModal, setShowFavoritesModal] = useState(false);
  const [showCalendarModal, setShowCalendarModal] = useState(false);
  const [showMobileSearch, setShowMobileSearch] = useState(false);
  
  // Filter states
  const [filters, setFilters] = useState<FilterState>({
    patronales: false,
    populares: false,
    musical: false,
    upcoming: false,
    ongoing: false,
    finished: false,
  });
  
  const [dateRange, setDateRange] = useState({ start: "", end: "" });
  
  // Refs for scrolling to specific dates
  const dateRefs = useRef<Record<string, HTMLDivElement | null>>({});

  const { data: allEvents = [], isLoading, error } = useFestivalEvents();
  const { favorites, toggleFavorite, isFavorite } = useFavorites();

  // Get today's date
  const today = new Date().toISOString().split('T')[0];

  // Helper function to check if event is musical
  const isMusicalEvent = (event: FestivalEvent) => {
    return ['música', 'concierto'].includes(event.type.toLowerCase());
  };

  // Helper function to apply all filters
  const applyFilters = (events: FestivalEvent[]) => {
    return events.filter((event: FestivalEvent) => {
      // Category filters (patronales/populares)
      const categoryFilters = [filters.patronales, filters.populares];
      const anyCategoryFilter = categoryFilters.some(f => f);
      if (anyCategoryFilter) {
        const matchesCategory = 
          (filters.patronales && event.category === 'patronales') ||
          (filters.populares && event.category === 'populares');
        if (!matchesCategory) return false;
      }

      // Musical type filter
      if (filters.musical && !isMusicalEvent(event)) {
        return false;
      }

      // Status filters
      const statusFilters = [filters.upcoming, filters.ongoing, filters.finished];
      const anyStatusFilter = statusFilters.some(f => f);
      if (anyStatusFilter) {
        const matchesStatus = 
          (filters.upcoming && event.status === 'upcoming') ||
          (filters.ongoing && event.status === 'ongoing') ||
          (filters.finished && event.status === 'finished');
        if (!matchesStatus) return false;
      }

      // Date range filter
      if (dateRange.start && event.date < dateRange.start) return false;
      if (dateRange.end && event.date > dateRange.end) return false;

      return true;
    });
  };

  // Calculate event counts for filters
  const eventCounts = useMemo(() => {
    return {
      patronales: allEvents.filter(event => event.category === 'patronales').length,
      populares: allEvents.filter(event => event.category === 'populares').length,
      musical: allEvents.filter(event => isMusicalEvent(event)).length,
    };
  }, [allEvents]);

  // Filter events by search query and filters
  const filteredEvents = useMemo(() => {
    let events = allEvents;

    // Apply search query first
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      events = events.filter((event: FestivalEvent) => 
        event.name.toLowerCase().includes(query) ||
        event.location.toLowerCase().includes(query) ||
        event.organizer.toLowerCase().includes(query) ||
        event.type.toLowerCase().includes(query)
      );
    }

    // Then apply all other filters
    return applyFilters(events);
  }, [allEvents, searchQuery, filters, dateRange]);

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

  // Función para obtener filtros activos
  const getActiveFilters = () => {
    const active = [];
    
    if (filters.patronales) active.push({ key: 'patronales', label: 'Fiestas Patronales' });
    if (filters.populares) active.push({ key: 'populares', label: 'Fiestas Populares' });
    if (filters.musical) active.push({ key: 'musical', label: 'Eventos Musicales' });
    if (filters.upcoming) active.push({ key: 'upcoming', label: 'Próximos' });
    if (filters.ongoing) active.push({ key: 'ongoing', label: 'En curso' });
    if (filters.finished) active.push({ key: 'finished', label: 'Terminados' });
    
    return active;
  };

  // Función para limpiar todos los filtros
  const clearAllFilters = () => {
    setSearchQuery("");
    setFilters({
      patronales: false,
      populares: false,
      musical: false,
      upcoming: false,
      ongoing: false,
      finished: false,
    });
    setDateRange({ start: "", end: "" });
    setShowMobileSearch(false);
  };

  // Función para eliminar un filtro específico
  const removeFilter = (filterKey: string) => {
    if (filterKey === 'search') {
      setSearchQuery("");
    } else {
      setFilters(prev => ({ ...prev, [filterKey]: false }));
    }
  };

  const activeFilters = getActiveFilters();
  const hasActiveSearch = searchQuery.trim() !== "";
  const hasActiveFilters = activeFilters.length > 0 || hasActiveSearch || dateRange.start || dateRange.end;

  // Función para cerrar filtros en móvil
  const handleFilterChange = () => {
    // Solo cerrar en pantallas menores a lg (1024px)
    if (window.innerWidth < 1024) {
      setShowMobileSearch(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-xl">Cargando eventos...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-red-500 text-center">
          <h2 className="text-2xl font-bold mb-4">Error cargando eventos</h2>
          <p>{error.message}</p>
          <p className="text-sm mt-2">Revise la consola del navegador para más detalles</p>
        </div>
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

      {/* Barra de filtros activos */}
      {hasActiveFilters && (
        <div className="bg-gray-100 border-b border-gray-200">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3">
            <div className="flex items-center justify-between flex-wrap gap-2">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-sm font-medium text-gray-700">Filtros aplicados:</span>
                
                {/* Búsqueda activa */}
                {hasActiveSearch && (
                  <div className="flex items-center bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm">
                    <Search className="w-3 h-3 mr-1" />
                    <span>"{searchQuery}"</span>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => removeFilter('search')}
                      className="h-4 w-4 p-0 ml-2 hover:bg-blue-200 rounded-full"
                    >
                      <X className="w-3 h-3" />
                    </Button>
                  </div>
                )}

                {/* Filtros de categoría y estado */}
                {activeFilters.map((filter) => (
                  <div key={filter.key} className="flex items-center bg-orange-100 text-orange-800 px-3 py-1 rounded-full text-sm">
                    <span>{filter.label}</span>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => removeFilter(filter.key)}
                      className="h-4 w-4 p-0 ml-2 hover:bg-orange-200 rounded-full"
                    >
                      <X className="w-3 h-3" />
                    </Button>
                  </div>
                ))}

                {/* Rango de fechas */}
                {(dateRange.start || dateRange.end) && (
                  <div className="flex items-center bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm">
                    <span>
                      {dateRange.start && dateRange.end 
                        ? `${dateRange.start} - ${dateRange.end}`
                        : dateRange.start 
                        ? `Desde ${dateRange.start}`
                        : `Hasta ${dateRange.end}`
                      }
                    </span>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setDateRange({ start: "", end: "" })}
                      className="h-4 w-4 p-0 ml-2 hover:bg-green-200 rounded-full"
                    >
                      <X className="w-3 h-3" />
                    </Button>
                  </div>
                )}
              </div>

              {/* Botón limpiar todo */}
              <Button
                variant="outline"
                size="sm"
                onClick={clearAllFilters}
                className="text-gray-600 hover:text-gray-800 text-sm"
              >
                Limpiar todo
              </Button>
            </div>
          </div>
        </div>
      )}

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="flex flex-col lg:flex-row gap-6">
          {/* Sidebar para filtros */}
          <div className={`${showMobileSearch ? 'block' : 'hidden'} lg:block lg:w-72 shrink-0`}>
            <FilterSidebar
              filters={filters}
              setFilters={setFilters}
              dateRange={dateRange}
              setDateRange={setDateRange}
              eventCounts={eventCounts}
              onFilterChange={handleFilterChange}
            />
          </div>

          {/* Contenido principal */}
          <div className="flex-1 min-w-0">
        {/* Today's Events Section */}
        {todayEvents.length > 0 && (
          <div 
            ref={(el) => dateRefs.current[today] = el}
            className="mb-8"
          >
            <div className="bg-gradient-to-r from-festival-orange to-festival-red rounded-xl p-6 mb-6 text-white">
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
          </div>
        </div>
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
      <footer className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 py-2 shadow-md z-10">
        <div className="max-w-7xl mx-auto px-4">
          <div className="text-center">
            <p className="text-gray-500 text-xs mb-1">
              <strong>Fiestas de Mislata 2025</strong>
            </p>
            <p className="text-gray-500 text-xs">
              Desarrollada por {' '}
              <OutboundLink 
                href="https://pablomagana.es" 
                linkId="footer_developer"
                className="text-gray-500 hover:text-gray-700 transition-colors underline"
              >
                pablomagana.es
              </OutboundLink>
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
