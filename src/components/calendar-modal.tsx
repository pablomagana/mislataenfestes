import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Heart } from "lucide-react";
import { format, startOfWeek, endOfWeek, eachDayOfInterval, isToday, parseISO } from "date-fns";
import { es } from "date-fns/locale";
import type { FestivalEvent } from "@shared/schema";
import { trackCalendarDateClick } from "@/lib/festival-analytics";

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
  const festivalStart = parseISO('2026-08-23');
  const festivalEnd = parseISO('2026-09-06');

  const startWeek = startOfWeek(festivalStart, { weekStartsOn: 1 });
  const endWeek = endOfWeek(festivalEnd, { weekStartsOn: 1 });

  const allDays = eachDayOfInterval({ start: startWeek, end: endWeek });

  const eventsByDate = events.reduce((acc, event) => {
    const dateKey = event.date;
    if (!acc[dateKey]) acc[dateKey] = [];
    acc[dateKey].push(event);
    return acc;
  }, {} as Record<string, FestivalEvent[]>);

  const hasFavoriteEvents = (dateStr: string) => {
    const dayEvents = eventsByDate[dateStr] || [];
    return dayEvents.some(event => favoriteEventIds.includes(event.id));
  };

  const getDateInfo = (dateStr: string) => {
    const dayEvents = eventsByDate[dateStr] || [];
    if (dayEvents.length === 0) return { color: '', hasPatronales: false, hasPopulares: false };

    const hasPatronales = dayEvents.some(event => event.category === 'patronales');
    const hasPopulares = dayEvents.some(event => event.category === 'populares');

    let color = '';
    if (hasPatronales && hasPopulares) {
      color = 'bg-gradient-to-br from-emerald-500 to-sky-500';
    } else if (hasPatronales) {
      color = 'bg-emerald-500';
    } else {
      color = 'bg-sky-500';
    }

    return { color, hasPatronales, hasPopulares };
  };

  const handleDayClick = (date: Date) => {
    const dateStr = format(date, 'yyyy-MM-dd');
    const dayEvents = eventsByDate[dateStr] || [];

    if (dayEvents.length > 0) {
      trackCalendarDateClick(dateStr, dayEvents.length, hasFavoriteEvents(dateStr));
      onDayClick(dateStr);
      onClose();
    }
  };

  const isInFestivalPeriod = (date: Date) => {
    return date >= festivalStart && date <= festivalEnd;
  };

  const weekDays = ['L', 'M', 'X', 'J', 'V', 'S', 'D'];

  // Split days into weeks for row rendering
  const weeks: Date[][] = [];
  for (let i = 0; i < allDays.length; i += 7) {
    weeks.push(allDays.slice(i, i + 7));
  }

  // Determine month boundary for separator
  const getWeekLabel = (week: Date[]): string | null => {
    const firstDay = week[0];
    if (firstDay.getDate() <= 7 && firstDay.getMonth() === 8) return 'Septiembre';
    if (week === weeks[0]) return 'Agosto';
    return null;
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-xs sm:max-w-sm mx-auto max-h-[90vh] overflow-y-auto rounded-2xl p-0">
        <DialogHeader className="px-5 pt-5 pb-0">
          <DialogTitle className="text-center text-lg font-bold text-gray-800">
            Calendario de Festes
          </DialogTitle>
          <p className="text-center text-sm text-gray-500 mt-0.5">Agosto - Septiembre 2026</p>
        </DialogHeader>

        <div className="px-4 pb-5">
          {/* Legend */}
          <div className="flex justify-center gap-5 mb-4 mt-3">
            <div className="flex items-center gap-1.5">
              <div className="w-2.5 h-2.5 bg-emerald-500 rounded-full"></div>
              <span className="text-xs text-gray-600">Patronales</span>
            </div>
            <div className="flex items-center gap-1.5">
              <div className="w-2.5 h-2.5 bg-sky-500 rounded-full"></div>
              <span className="text-xs text-gray-600">Populares</span>
            </div>
          </div>

          {/* Week day headers */}
          <div className="grid grid-cols-7 mb-1">
            {weekDays.map(day => (
              <div key={day} className="text-center text-[11px] font-semibold text-gray-400 uppercase tracking-wide py-1">
                {day}
              </div>
            ))}
          </div>

          {/* Calendar grid by weeks */}
          <div className="space-y-1">
            {weeks.map((week, weekIdx) => {
              const label = getWeekLabel(week);
              return (
                <div key={weekIdx}>
                  {label === 'Septiembre' && (
                    <div className="flex items-center gap-2 my-2">
                      <div className="flex-1 h-px bg-gray-200"></div>
                      <span className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider">{label}</span>
                      <div className="flex-1 h-px bg-gray-200"></div>
                    </div>
                  )}
                  <div className="grid grid-cols-7">
                    {week.map(date => {
                      const dateStr = format(date, 'yyyy-MM-dd');
                      const dayEvents = eventsByDate[dateStr] || [];
                      const hasEvents = dayEvents.length > 0;
                      const isInPeriod = isInFestivalPeriod(date);
                      const hasFavorites = hasFavoriteEvents(dateStr);
                      const { color } = getDateInfo(dateStr);
                      const today = isToday(date);
                      const eventCount = dayEvents.length;

                      return (
                        <button
                          key={dateStr}
                          onClick={() => handleDayClick(date)}
                          disabled={!hasEvents}
                          aria-label={`${format(date, 'd MMMM', { locale: es })}${hasEvents ? `, ${eventCount} eventos` : ''}`}
                          className={`
                            relative flex flex-col items-center justify-center
                            w-full aspect-square rounded-xl transition-all duration-150
                            ${isInPeriod
                              ? hasEvents
                                ? `${color} text-white shadow-sm hover:shadow-md hover:scale-105 active:scale-95 cursor-pointer`
                                : 'text-gray-400'
                              : 'text-gray-300'
                            }
                            ${today && !hasEvents ? 'ring-2 ring-orange-400 ring-offset-1' : ''}
                            ${today && hasEvents ? 'ring-2 ring-orange-400 ring-offset-1' : ''}
                            ${!hasEvents && 'cursor-default'}
                          `}
                        >
                          <span className={`text-sm font-semibold leading-none ${today && !hasEvents ? 'text-orange-500' : ''}`}>
                            {format(date, 'd')}
                          </span>
                          {hasEvents && (
                            <span className="text-[9px] font-medium leading-none mt-0.5 opacity-80">
                              {eventCount} evt{eventCount !== 1 ? 's' : ''}
                            </span>
                          )}
                          {hasFavorites && (
                            <Heart className="w-2.5 h-2.5 fill-red-400 text-red-400 absolute -top-0.5 -right-0.5 drop-shadow-sm" />
                          )}
                        </button>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Footer hint */}
          <p className="text-center text-[10px] text-gray-400 mt-3">
            Pulsa un dia para ver sus eventos
          </p>
        </div>
      </DialogContent>
    </Dialog>
  );
}
