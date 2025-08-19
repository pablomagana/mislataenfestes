import { useState } from "react";
import Header from "@/components/header";
import HeroSection from "@/components/hero-section";
import FilterSidebar from "@/components/filter-sidebar";
import EventCard from "@/components/event-card";
import FavoritesModal from "@/components/favorites-modal";
import { useFestivalEvents } from "@/hooks/use-festival-events";
import { useFavorites } from "@/hooks/use-favorites";
import { Button } from "@/components/ui/button";
import { Calendar, List, ArrowUp, Heart } from "lucide-react";
import type { FestivalEvent } from "@shared/schema";

export type FilterState = {
  patronales: boolean;
  populares: boolean;
  upcoming: boolean;
  ongoing: boolean;
  finished: boolean;
};

export default function Home() {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<"all" | "patronales" | "populares">("all");
  const [viewMode, setViewMode] = useState<"list" | "calendar">("list");
  const [showFavoritesModal, setShowFavoritesModal] = useState(false);
  const [showMobileSearch, setShowMobileSearch] = useState(false);
  const [dateRange, setDateRange] = useState({ start: "", end: "" });
  const [filters, setFilters] = useState<FilterState>({
    patronales: true,
    populares: true,
    upcoming: true,
    ongoing: false,
    finished: false
  });

  const { data: allEvents = [], isLoading } = useFestivalEvents();
  const { favorites, toggleFavorite, isFavorite } = useFavorites();

  // Filter events based on current filters
  const filteredEvents = allEvents.filter((event: FestivalEvent) => {
    // Category filter
    if (selectedCategory !== "all" && event.category !== selectedCategory) {
      return false;
    }

    // Festival type filter
    if (!filters[event.category as keyof FilterState]) {
      return false;
    }

    // Status filter
    if (!filters[event.status as keyof FilterState]) {
      return false;
    }

    // Search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      if (!event.name.toLowerCase().includes(query) &&
          !event.location.toLowerCase().includes(query) &&
          !event.organizer.toLowerCase().includes(query) &&
          !event.type.toLowerCase().includes(query)) {
        return false;
      }
    }

    // Date range filter
    if (dateRange.start && event.date < dateRange.start) {
      return false;
    }
    if (dateRange.end && event.date > dateRange.end) {
      return false;
    }

    return true;
  });

  // Get current event (mock for demo - would be based on real time)
  const currentEvent = allEvents.find(event => event.status === "ongoing");

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
        <HeroSection currentEvent={currentEvent} />

        <div className="flex flex-col lg:flex-row gap-8">
          <FilterSidebar 
            filters={filters}
            setFilters={setFilters}
            dateRange={dateRange}
            setDateRange={setDateRange}
            eventCounts={{
              patronales: allEvents.filter(e => e.category === "patronales").length,
              populares: allEvents.filter(e => e.category === "populares").length
            }}
          />

          <div className="flex-1">
            {/* View Toggle */}
            <div className="flex justify-between items-center mb-6">
              <div className="flex bg-white rounded-lg p-1 shadow-sm">
                <Button
                  onClick={() => setViewMode("list")}
                  variant={viewMode === "list" ? "default" : "ghost"}
                  className={`px-4 py-2 ${viewMode === "list" ? "bg-festival-orange text-white" : "text-gray-600 hover:text-gray-800"} transition-colors`}
                >
                  <List className="w-4 h-4 mr-2" />
                  Lista
                </Button>
                <Button
                  onClick={() => setViewMode("calendar")}
                  variant={viewMode === "calendar" ? "default" : "ghost"}
                  className={`px-4 py-2 ${viewMode === "calendar" ? "bg-festival-orange text-white" : "text-gray-600 hover:text-gray-800"} transition-colors`}
                >
                  <Calendar className="w-4 h-4 mr-2" />
                  Calendario
                </Button>
              </div>
              
              <div className="text-sm text-gray-600">
                <span>{filteredEvents.length}</span> eventos encontrados
              </div>
            </div>

            {/* Category Tabs */}
            <div className="flex space-x-1 mb-6 bg-white rounded-lg p-1 shadow-sm">
              <Button
                onClick={() => setSelectedCategory("all")}
                variant="ghost"
                className={`flex-1 py-3 px-4 text-center font-medium ${
                  selectedCategory === "all" 
                    ? "bg-festival-orange text-white" 
                    : "text-gray-600 hover:text-gray-800"
                } transition-colors`}
              >
                Todos los eventos
              </Button>
              <Button
                onClick={() => setSelectedCategory("patronales")}
                variant="ghost"
                className={`flex-1 py-3 px-4 text-center font-medium ${
                  selectedCategory === "patronales" 
                    ? "bg-festival-orange text-white" 
                    : "text-gray-600 hover:text-gray-800"
                } transition-colors`}
              >
                Fiestas Patronales
              </Button>
              <Button
                onClick={() => setSelectedCategory("populares")}
                variant="ghost"
                className={`flex-1 py-3 px-4 text-center font-medium ${
                  selectedCategory === "populares" 
                    ? "bg-festival-orange text-white" 
                    : "text-gray-600 hover:text-gray-800"
                } transition-colors`}
              >
                Fiestas Populares
              </Button>
            </div>

            {/* Events List */}
            <div className="space-y-4">
              {filteredEvents.length === 0 ? (
                <div className="text-center py-12">
                  <div className="text-gray-500 text-lg">No se encontraron eventos</div>
                  <div className="text-gray-400 text-sm mt-2">
                    Prueba a ajustar los filtros o la búsqueda
                  </div>
                </div>
              ) : (
                filteredEvents.map((event) => (
                  <EventCard
                    key={event.id}
                    event={event}
                    isFavorite={isFavorite(event.id)}
                    onToggleFavorite={() => toggleFavorite(event.id)}
                  />
                ))
              )}
            </div>
          </div>
        </div>
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
