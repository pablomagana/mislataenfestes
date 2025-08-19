import React, { useState, useMemo } from "react";
import Header from "@/components/header";
import EventCard from "@/components/event-card";
import FavoritesModal from "@/components/favorites-modal";
import { useFestivalEvents } from "@/hooks/use-festival-events";
import { useFavorites } from "@/hooks/use-favorites";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ArrowUp, Heart } from "lucide-react";
import type { FestivalEvent } from "@shared/schema";
import { formatEventDate, formatTabDate } from "@/lib/date-utils";

export default function Home() {
  const [searchQuery, setSearchQuery] = useState("");
  const [showFavoritesModal, setShowFavoritesModal] = useState(false);
  const [showMobileSearch, setShowMobileSearch] = useState(false);

  const { data: allEvents = [], isLoading } = useFestivalEvents();
  const { favorites, toggleFavorite, isFavorite } = useFavorites();

  // Group events by date and filter by search
  const eventsByDate = useMemo(() => {
    let filtered = allEvents;
    
    // Apply search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = allEvents.filter((event: FestivalEvent) => 
        event.name.toLowerCase().includes(query) ||
        event.location.toLowerCase().includes(query) ||
        event.organizer.toLowerCase().includes(query) ||
        event.type.toLowerCase().includes(query)
      );
    }

    // Group by date
    const grouped = filtered.reduce((acc, event) => {
      if (!acc[event.date]) {
        acc[event.date] = [];
      }
      acc[event.date].push(event);
      return acc;
    }, {} as Record<string, FestivalEvent[]>);

    // Sort events within each date by time
    Object.keys(grouped).forEach(date => {
      grouped[date].sort((a, b) => a.time.localeCompare(b.time));
    });

    return grouped;
  }, [allEvents, searchQuery]);

  // Get unique sorted dates
  const sortedDates = useMemo(() => {
    return Object.keys(eventsByDate).sort();
  }, [eventsByDate]);

  // Find default tab (today's date or first date with ongoing events)
  const defaultTab = useMemo(() => {
    const today = new Date().toISOString().split('T')[0];
    
    // Check if today has events
    if (eventsByDate[today]) {
      return today;
    }
    
    // Find first date with ongoing events
    const ongoingDate = sortedDates.find(date => 
      eventsByDate[date].some(event => event.status === 'ongoing')
    );
    
    if (ongoingDate) {
      return ongoingDate;
    }
    
    // Return first available date
    return sortedDates[0] || today;
  }, [eventsByDate, sortedDates]);

  const [selectedDate, setSelectedDate] = useState(defaultTab);
  
  // Update selected date when defaultTab changes
  React.useEffect(() => {
    setSelectedDate(defaultTab);
  }, [defaultTab]);

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
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
      />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* Date Tabs */}
        <Tabs value={selectedDate} onValueChange={setSelectedDate} className="w-full">
          <div className="overflow-x-auto">
            <TabsList className="inline-flex bg-white rounded-lg p-1 shadow-sm mb-6 min-w-full">
              {sortedDates.map((date) => (
                <TabsTrigger 
                  key={date} 
                  value={date} 
                  className="text-sm font-medium whitespace-nowrap px-4 py-2 mx-1 data-[state=active]:bg-festival-orange data-[state=active]:text-white"
                >
                  {formatTabDate(date)}
                </TabsTrigger>
              ))}
            </TabsList>
          </div>
          
          {sortedDates.map((date) => (
            <TabsContent key={date} value={date} className="mt-6">
              <div className="mb-4">
                <h2 className="text-2xl font-bold text-gray-800 mb-2">
                  {formatEventDate(date)}
                </h2>
                <div className="text-sm text-gray-600">
                  {eventsByDate[date]?.length || 0} eventos
                </div>
              </div>
              
              <div className="space-y-4">
                {eventsByDate[date]?.map((event) => (
                  <EventCard
                    key={event.id}
                    event={event}
                    isFavorite={isFavorite(event.id)}
                    onToggleFavorite={() => toggleFavorite(event.id)}
                  />
                )) || (
                  <div className="text-center py-12">
                    <div className="text-gray-500 text-lg">No hay eventos este día</div>
                  </div>
                )}
              </div>
            </TabsContent>
          ))}
        </Tabs>
      </main>

      {/* Floating Action Buttons */}
      <div className="fixed bottom-6 right-6 space-y-3">
        <Button
          onClick={scrollToTop}
          className="bg-white text-gray-600 p-3 rounded-full shadow-lg hover:shadow-xl transition-shadow"
          size="icon"
        >
          <ArrowUp className="w-5 h-5" />
        </Button>
        <Button
          onClick={() => setShowFavoritesModal(true)}
          className="bg-festival-red text-white p-3 rounded-full shadow-lg hover:shadow-xl transition-shadow"
          size="icon"
        >
          <Heart className="w-5 h-5" />
        </Button>
      </div>

      <FavoritesModal
        isOpen={showFavoritesModal}
        onClose={() => setShowFavoritesModal(false)}
        favoriteEvents={allEvents.filter(event => isFavorite(event.id))}
        onRemoveFavorite={toggleFavorite}
      />
    </div>
  );
}
