import React, { useState, useMemo, useRef, lazy, Suspense } from "react";
import Header from "@/components/header";
import EventCard from "@/components/event-card";
import FilterSidebar from "@/components/filter-sidebar";
import FestivalEndLanding from "@/components/festival-end-landing";
import { useFestivalEvents } from "@/hooks/use-festival-events";
import { useFavorites } from "@/hooks/use-favorites";
import { useEventPhotoStats } from "@/hooks/use-event-photos";
import { Button } from "@/components/ui/button";
import { OutboundLink } from "@/components/analytics";
import type { FilterState } from "@/types/filters";

// Lazy load heavy modals
const FavoritesModal = lazy(() => import("@/components/favorites-modal"));
const CalendarModal = lazy(() => import("@/components/calendar-modal"));
const PhotoUploadModal = lazy(() => import("@/components/photo-upload-modal"));

import { ArrowUp, Camera, Clock, MapPin, Users, Search, X } from "lucide-react";
import type { FestivalEvent } from "@shared/schema";
import { formatEventDate, formatEventTime } from "@/lib/date-utils";
import { trackScrollToTop, trackScrollToDate } from "@/lib/festival-analytics";
import { toFestivalDate, getCurrentFestivalDate } from "@/lib/festival-time";
import { Card, CardContent } from "@/components/ui/card";

export default function Home() {
  const [searchQuery, setSearchQuery] = useState("");
  const [showFavoritesModal, setShowFavoritesModal] = useState(false);
  const [showCalendarModal, setShowCalendarModal] = useState(false);
  const [showMobileSearch, setShowMobileSearch] = useState(false);
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [selectedEventForUpload, setSelectedEventForUpload] = useState<FestivalEvent | null>(null);
  
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

  // Get today's festival date (considering midnight events belong to previous day)
  const todayFestival = getCurrentFestivalDate();
  // Also keep regular today for date comparisons
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

  // Get today's events (using festival date logic)
  const todayEvents = useMemo(() => {
    return filteredEvents
      .filter(event => {
        const eventFestivalDate = toFestivalDate(event.date, event.time);
        return eventFestivalDate === todayFestival;
      })
      .sort((a, b) => {
        // Use order field if available, otherwise fallback to time sorting
        if (a.order && b.order) {
          return a.order.localeCompare(b.order);
        }
        return a.time.localeCompare(b.time);
      });
  }, [filteredEvents, todayFestival]);

  // Get future events (tomorrow festival day and onwards)
  const futureEvents = useMemo(() => {
    return filteredEvents
      .filter(event => {
        const eventFestivalDate = toFestivalDate(event.date, event.time);
        return eventFestivalDate > todayFestival;
      })
      .sort((a, b) => {
        const aFestivalDate = toFestivalDate(a.date, a.time);
        const bFestivalDate = toFestivalDate(b.date, b.time);
        
        if (aFestivalDate === bFestivalDate) {
          // Use order field if available, otherwise fallback to time sorting
          if (a.order && b.order) {
            return a.order.localeCompare(b.order);
          }
          return a.time.localeCompare(b.time);
        }
        return aFestivalDate.localeCompare(bFestivalDate);
      });
  }, [filteredEvents, todayFestival]);

  // Group future events by festival date
  const futureEventsByDate = useMemo(() => {
    const grouped = futureEvents.reduce((acc, event) => {
      const festivalDate = toFestivalDate(event.date, event.time);
      if (!acc[festivalDate]) {
        acc[festivalDate] = [];
      }
      acc[festivalDate].push(event);
      return acc;
    }, {} as Record<string, FestivalEvent[]>);

    return grouped;
  }, [futureEvents]);

  // Get sorted future dates
  const futureDates = useMemo(() => {
    return Object.keys(futureEventsByDate).sort();
  }, [futureEventsByDate]);

  // Helper function to calculate event end time
  const getEventEndTime = (event: FestivalEvent, allDayEvents: FestivalEvent[]) => {
    const [hours, minutes] = event.time.split(':').map(Number);
    const eventStartTime = hours * 100 + (minutes || 0);
    
    // Find the next event on the same day
    const nextEvent = allDayEvents.find(e => {
      if (e.id === event.id) return false;
      const [nextHours, nextMinutes] = e.time.split(':').map(Number);
      const nextEventTime = nextHours * 100 + (nextMinutes || 0);
      return nextEventTime > eventStartTime;
    });
    
    if (nextEvent) {
      // Event ends when the next event starts
      const [nextHours, nextMinutes] = nextEvent.time.split(':').map(Number);
      return nextHours * 100 + (nextMinutes || 0);
    } else {
      // No next event, use 2 hours maximum
      return eventStartTime + 200;
    }
  };

  // Get current event (happening now or next event of today)
  const currentEvent = useMemo(() => {
    const now = new Date();
    const currentTime = now.getHours() * 100 + now.getMinutes(); // HHMM format
    
    // First, look for events happening right now
    const ongoingEvents = todayEvents.filter(event => {
      const [hours, minutes] = event.time.split(':').map(Number);
      const eventStartTime = hours * 100 + (minutes || 0);
      const eventEndTime = getEventEndTime(event, todayEvents);
      
      return currentTime >= eventStartTime && currentTime < eventEndTime;
    });

    // If there are ongoing events, return the first one
    if (ongoingEvents.length > 0) {
      return ongoingEvents[0];
    }

    // If no ongoing events, return the next event of today
    const upcomingTodayEvents = todayEvents.filter(event => {
      const [hours, minutes] = event.time.split(':').map(Number);
      const eventStartTime = hours * 100 + (minutes || 0);
      return currentTime < eventStartTime;
    });

    if (upcomingTodayEvents.length > 0) {
      return upcomingTodayEvents[0];
    }

    // If no events today, return the very next event from future events
    if (futureEvents.length > 0) {
      return futureEvents[0];
    }

    return null;
  }, [todayEvents, futureEvents]);

  // Get photo stats for current event (after currentEvent is defined)
  const currentEventStats = useEventPhotoStats(currentEvent?.id || "");

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

  // Handle photo upload for current event
  const handleUploadToCurrentEvent = (event: FestivalEvent) => {
    setSelectedEventForUpload(event);
    setShowUploadModal(true);
  };

  // Close upload modal
  const handleCloseUploadModal = () => {
    setShowUploadModal(false);
    setSelectedEventForUpload(null);
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
        
        {/* Current Event - Quick Photo Upload Section */}
        {currentEvent && (
          <div className="mb-8">
            <Card className="bg-gradient-to-br from-festival-orange to-festival-red text-white shadow-xl">
              <CardContent className="p-6">
                <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <div className="w-3 h-3 bg-white rounded-full animate-pulse"></div>
                      <span className="text-white/90 text-sm font-medium uppercase tracking-wide">
                        {(() => {
                          const eventFestivalDate = toFestivalDate(currentEvent.date, currentEvent.time);
                          if (eventFestivalDate !== todayFestival) return "Próximo evento";
                          
                          const now = new Date();
                          const currentTime = now.getHours() * 100 + now.getMinutes();
                          const [hours, minutes] = currentEvent.time.split(':').map(Number);
                          const eventStartTime = hours * 100 + (minutes || 0);
                          const eventEndTime = getEventEndTime(currentEvent, todayEvents);
                          
                          if (currentTime >= eventStartTime && currentTime < eventEndTime) {
                            const endHours = Math.floor(eventEndTime / 100);
                            const endMinutes = eventEndTime % 100;
                            return `En curso hasta las ${endHours.toString().padStart(2, '0')}:${endMinutes.toString().padStart(2, '0')}`;
                          } else {
                            return "Próximo evento";
                          }
                        })()}
                      </span>
                    </div>
                    
                    <h2 className="text-2xl lg:text-3xl font-bold mb-3">
                      {currentEvent.name}
                    </h2>
                    
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-white/90">
                      <div className="flex items-center">
                        <Clock className="w-4 h-4 mr-2" />
                        <span>{formatEventTime(currentEvent.time)} horas</span>
                      </div>
                      <div className="flex items-center">
                        <MapPin className="w-4 h-4 mr-2" />
                        <span>{currentEvent.location}</span>
                      </div>
                    </div>
                    
                    {toFestivalDate(currentEvent.date, currentEvent.time) !== todayFestival && (
                      <div className="mt-2 text-white/80 text-sm">
                        {formatEventDate(currentEvent.date)}
                      </div>
                    )}
                  </div>
                  
                  <div className="lg:flex-shrink-0">
                    <div className="text-center">
                      <Button
                        onClick={() => handleUploadToCurrentEvent(currentEvent)}
                        size="lg"
                        className="bg-white text-festival-orange hover:bg-white/90 shadow-lg hover:shadow-xl transition-all duration-200 font-semibold px-8"
                      >
                        <Camera className="w-5 h-5 mr-2" />
                        Subir Fotos Ahora
                      </Button>
                      
                      {/* Estadísticas de fotos */}
                      <div className="mt-3 px-4">
                        {currentEventStats.totalPhotos > 0 ? (
                          <p className="text-white/90 text-sm">
                            📸 <span className="font-semibold">{currentEventStats.totalPhotos}</span> foto{currentEventStats.totalPhotos !== 1 ? 's' : ''} compartida{currentEventStats.totalPhotos !== 1 ? 's' : ''}
                            {currentEventStats.photosToday > 0 && (
                              <span className="text-white/80">
                                {" "}• {currentEventStats.photosToday} hoy
                              </span>
                            )}
                          </p>
                        ) : (
                          <p className="text-white/80 text-sm">
                            ¡Sé el primero en compartir fotos!
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Today's Events Section */}
        {todayEvents.length > 0 && (
          <div 
            ref={(el) => dateRefs.current[todayFestival] = el}
            className="mb-8 space-y-4"
          >
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
        )}

        {/* Future Events Section */}
        {futureDates.length > 0 && (
          <div>

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

        {/* No events message or Festival End Landing */}
        {todayEvents.length === 0 && futureDates.length === 0 && (
          <>
            {searchQuery || hasActiveFilters ? (
              <div className="text-center py-12">
                <div className="text-gray-500 text-lg">
                  No se encontraron eventos
                </div>
                <div className="text-gray-400 text-sm mt-2">
                  Prueba a ajustar la búsqueda o los filtros
                </div>
              </div>
            ) : (
              <FestivalEndLanding />
            )}
          </>
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

      {showUploadModal && selectedEventForUpload && (
        <Suspense fallback={<div>Cargando...</div>}>
          <PhotoUploadModal
            isOpen={showUploadModal}
            onClose={handleCloseUploadModal}
            eventId={selectedEventForUpload.id}
            eventName={selectedEventForUpload.name}
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
