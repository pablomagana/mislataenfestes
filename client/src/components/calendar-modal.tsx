import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Heart, ChevronLeft, ChevronRight } from "lucide-react";
import { format, startOfWeek, endOfWeek, eachDayOfInterval, isSameDay, parseISO } from "date-fns";
import { es } from "date-fns/locale";
import type { FestivalEvent } from "@shared/schema";

interface CalendarModalProps {
  isOpen: boolean;
  onClose: () => void;
  events: FestivalEvent[];
  favoriteEventIds: string[];
  onDayClick: (date: string) => void;
}

export default function CalendarModal({
  isOpen,
  onClose,
  events,
  favoriteEventIds,
  onDayClick
}: CalendarModalProps) {
  // Festival period: August 23 - September 6, 2025
  const festivalStart = parseISO('2025-08-23');
  const festivalEnd = parseISO('2025-09-06');
  
  // Get the weeks that contain the festival dates
  const startWeek = startOfWeek(festivalStart, { weekStartsOn: 1 }); // Monday start
  const endWeek = endOfWeek(festivalEnd, { weekStartsOn: 1 });
  
  const allDays = eachDayOfInterval({ start: startWeek, end: endWeek });

  // Group events by date
  const eventsByDate = events.reduce((acc, event) => {
    const dateKey = event.date;
    if (!acc[dateKey]) {
      acc[dateKey] = [];
    }
    acc[dateKey].push(event);
    return acc;
  }, {} as Record<string, FestivalEvent[]>);

  // Check if a date has favorite events
  const hasFavoriteEvents = (dateStr: string) => {
    const dayEvents = eventsByDate[dateStr] || [];
    return dayEvents.some(event => favoriteEventIds.includes(event.id));
  };

  // Get the category color for a date
  const getDateColor = (dateStr: string) => {
    const dayEvents = eventsByDate[dateStr] || [];
    if (dayEvents.length === 0) return '';
    
    const hasPatronales = dayEvents.some(event => event.category === 'patronales');
    const hasPopulares = dayEvents.some(event => event.category === 'populares');
    
    if (hasPatronales && hasPopulares) {
      return 'bg-gradient-to-r from-green-500 to-blue-500';
    } else if (hasPatronales) {
      return 'bg-green-500';
    } else {
      return 'bg-blue-500';
    }
  };

  const handleDayClick = (date: Date) => {
    const dateStr = format(date, 'yyyy-MM-dd');
    const dayEvents = eventsByDate[dateStr] || [];
    
    if (dayEvents.length > 0) {
      onDayClick(dateStr);
      onClose();
    }
  };

  const isInFestivalPeriod = (date: Date) => {
    return date >= festivalStart && date <= festivalEnd;
  };

  const weekDays = ['L', 'M', 'X', 'J', 'V', 'S', 'D'];

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Calendario de Festes</DialogTitle>
        </DialogHeader>
        
        <div className="p-4">
          {/* Month headers */}
          <div className="text-center mb-4">
            <div className="text-lg font-semibold text-gray-700">
              Agosto - Septiembre 2025
            </div>
          </div>

          {/* Legend */}
          <div className="flex justify-center gap-4 mb-4 text-xs">
            <div className="flex items-center gap-1">
              <div className="w-3 h-3 bg-green-500 rounded"></div>
              <span>Patronales</span>
            </div>
            <div className="flex items-center gap-1">
              <div className="w-3 h-3 bg-blue-500 rounded"></div>
              <span>Populares</span>
            </div>
          </div>

          {/* Week day headers */}
          <div className="grid grid-cols-7 gap-1 mb-2">
            {weekDays.map(day => (
              <div key={day} className="text-center text-sm font-medium text-gray-500 p-2">
                {day}
              </div>
            ))}
          </div>

          {/* Calendar grid */}
          <div className="grid grid-cols-7 gap-1">
            {allDays.map(date => {
              const dateStr = format(date, 'yyyy-MM-dd');
              const dayEvents = eventsByDate[dateStr] || [];
              const hasEvents = dayEvents.length > 0;
              const isInPeriod = isInFestivalPeriod(date);
              const hasFavorites = hasFavoriteEvents(dateStr);
              const colorClass = getDateColor(dateStr);
              
              return (
                <button
                  key={dateStr}
                  onClick={() => handleDayClick(date)}
                  disabled={!hasEvents}
                  className={`
                    relative aspect-square p-1 text-sm rounded-lg transition-all
                    ${isInPeriod 
                      ? hasEvents 
                        ? `${colorClass} text-white hover:opacity-80 cursor-pointer shadow-sm`
                        : 'bg-gray-100 text-gray-400'
                      : 'text-gray-300'
                    }
                    ${!hasEvents && 'cursor-not-allowed'}
                  `}
                >
                  <div className="flex flex-col items-center justify-center h-full">
                    <span className="font-medium">
                      {format(date, 'd')}
                    </span>
                    {hasFavorites && (
                      <Heart className="w-3 h-3 fill-current absolute top-0.5 right-0.5" />
                    )}
                  </div>
                </button>
              );
            })}
          </div>

          {/* Info text */}
          <div className="mt-4 text-xs text-gray-500 text-center">
            Haz clic en un día con eventos para navegar hasta esa fecha
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}