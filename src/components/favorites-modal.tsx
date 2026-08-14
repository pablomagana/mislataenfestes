import { Heart, Calendar, Clock, MapPin, X, ChevronRight } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import type { FestivalEvent } from "@shared/schema";
import { formatEventDate, formatEventTime } from "@/lib/date-utils";
import { Link } from "wouter";

interface FavoritesModalProps {
  isOpen: boolean;
  onClose: () => void;
  favoriteEvents: FestivalEvent[];
  onRemoveFavorite: (eventId: string) => void;
}

export default function FavoritesModal({
  isOpen,
  onClose,
  favoriteEvents,
  onRemoveFavorite
}: FavoritesModalProps) {
  const sortedEvents = [...favoriteEvents].sort((a, b) => {
    const dateCompare = a.date.localeCompare(b.date);
    if (dateCompare !== 0) return dateCompare;
    return a.time.localeCompare(b.time);
  });

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-xs sm:max-w-sm mx-auto max-h-[85vh] overflow-hidden rounded-2xl p-0">
        <DialogHeader className="px-5 pt-5 pb-0">
          <DialogTitle className="text-center text-lg font-bold text-gray-800">
            Eventos Favoritos
          </DialogTitle>
          <DialogDescription className="text-center text-sm text-gray-500 mt-0.5">
            {favoriteEvents.length > 0
              ? `${favoriteEvents.length} evento${favoriteEvents.length !== 1 ? 's' : ''} guardado${favoriteEvents.length !== 1 ? 's' : ''}`
              : 'Tus eventos marcados como favoritos'
            }
          </DialogDescription>
        </DialogHeader>

        <div className="px-4 pb-5 mt-3 overflow-y-auto max-h-[65vh]">
          {sortedEvents.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-10 px-4">
              <div className="w-16 h-16 rounded-full bg-gray-100 flex items-center justify-center mb-4">
                <Heart className="w-7 h-7 text-gray-300" />
              </div>
              <p className="text-gray-500 font-medium text-base">Sin favoritos aun</p>
              <p className="text-gray-400 text-sm text-center mt-1 leading-snug">
                Pulsa el corazon en cualquier evento para guardarlo aqui
              </p>
            </div>
          ) : (
            <div className="space-y-2.5">
              {sortedEvents.map((event) => {
                const isPatronales = event.category === 'patronales';
                const categoryColor = isPatronales ? 'bg-emerald-500' : 'bg-sky-500';

                return (
                  <div
                    key={event.id}
                    className="relative bg-gray-50 rounded-xl overflow-hidden transition-all duration-150 hover:bg-gray-100 group"
                  >
                    <Link
                      href={`/evento/${event.id}`}
                      onClick={onClose}
                      className="block p-3.5"
                    >
                      {/* Category indicator */}
                      <div className={`absolute left-0 top-0 bottom-0 w-1 ${categoryColor}`} />

                      <div className="flex items-start justify-between gap-2 pl-2">
                        <div className="flex-1 min-w-0">
                          <h3 className="font-semibold text-gray-800 text-sm leading-snug truncate">
                            {event.name}
                          </h3>
                          <div className="flex flex-wrap items-center gap-x-3 gap-y-0.5 mt-1.5 text-xs text-gray-500">
                            <span className="flex items-center gap-1">
                              <Calendar className="w-3 h-3 flex-shrink-0" />
                              {formatEventDate(event.date)}
                            </span>
                            <span className="flex items-center gap-1">
                              <Clock className="w-3 h-3 flex-shrink-0" />
                              {formatEventTime(event.time)}h
                            </span>
                          </div>
                          {event.location && (
                            <div className="flex items-center gap-1 mt-1 text-xs text-gray-400">
                              <MapPin className="w-3 h-3 flex-shrink-0" />
                              <span className="truncate">{event.location}</span>
                            </div>
                          )}
                        </div>
                        <ChevronRight className="w-4 h-4 text-gray-300 group-hover:text-gray-400 mt-0.5 flex-shrink-0 transition-colors" />
                      </div>
                    </Link>

                    {/* Remove button */}
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onRemoveFavorite(event.id);
                      }}
                      className="absolute top-2 right-2 w-6 h-6 flex items-center justify-center rounded-full bg-white/80 hover:bg-red-50 text-gray-400 hover:text-red-500 transition-colors opacity-0 group-hover:opacity-100 focus:opacity-100"
                      aria-label={`Eliminar ${event.name} de favoritos`}
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
