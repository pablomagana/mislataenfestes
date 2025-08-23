import { X, Calendar, Clock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import type { FestivalEvent } from "@shared/schema";
import { formatEventDate, formatEventTime } from "@/lib/date-utils";

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
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-xs sm:max-w-sm md:max-w-md mx-4 max-h-[85vh] overflow-hidden">
        <DialogHeader>
          <DialogTitle className="text-center text-lg sm:text-xl font-semibold text-gray-800">
            Eventos Favoritos
          </DialogTitle>
          <DialogDescription className="text-center text-sm text-gray-600">
            Tus eventos marcados como favoritos
          </DialogDescription>
        </DialogHeader>
        
        <div className="px-2 sm:px-4 pb-4 space-y-3 sm:space-y-4 overflow-y-auto max-h-[60vh]">
          {favoriteEvents.length === 0 ? (
            <div className="text-center py-8 sm:py-12">
              <div className="text-gray-500 text-base sm:text-lg">No tienes eventos favoritos</div>
              <div className="text-gray-400 text-sm mt-2 px-4">
                Marca eventos como favoritos para verlos aquí
              </div>
            </div>
          ) : (
            favoriteEvents.map((event) => (
              <div key={event.id} className="bg-gray-50 rounded-lg p-3 sm:p-4">
                <h3 className="font-semibold text-gray-800 mb-2 text-sm sm:text-base">{event.name}</h3>
                <div className="text-xs sm:text-sm text-gray-600 space-y-1">
                  <div className="flex items-center">
                    <Calendar className="w-3 h-3 sm:w-4 sm:h-4 mr-2" />
                    {formatEventDate(event.date)}
                  </div>
                  <div className="flex items-center">
                    <Clock className="w-3 h-3 sm:w-4 sm:h-4 mr-2" />
                    {formatEventTime(event.time)} horas
                  </div>
                </div>
                <Button
                  variant="ghost"
                  onClick={() => onRemoveFavorite(event.id)}
                  className="mt-2 text-festival-red text-xs sm:text-sm hover:underline p-0 h-auto"
                >
                  Eliminar de favoritos
                </Button>
              </div>
            ))
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
