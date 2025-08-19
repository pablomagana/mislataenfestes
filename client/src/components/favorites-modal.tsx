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
      <DialogContent className="max-w-md mx-4 my-8 max-h-[80vh] bg-white shadow-xl rounded-lg">
        <DialogHeader className="p-6 border-b border-gray-200">
          <div className="flex justify-between items-center">
            <div>
              <DialogTitle className="text-xl font-semibold text-gray-800">
                Eventos Favoritos
              </DialogTitle>
              <DialogDescription className="text-sm text-gray-600 mt-1">
                Tus eventos marcados como favoritos
              </DialogDescription>
            </div>
            <Button
              variant="ghost"
              size="icon"
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600"
            >
              <X className="w-5 h-5" />
            </Button>
          </div>
        </DialogHeader>
        
        <div className="p-6 space-y-4 overflow-y-auto max-h-96">
          {favoriteEvents.length === 0 ? (
            <div className="text-center py-12">
              <div className="text-gray-500 text-lg">No tienes eventos favoritos</div>
              <div className="text-gray-400 text-sm mt-2">
                Marca eventos como favoritos para verlos aquí
              </div>
            </div>
          ) : (
            favoriteEvents.map((event) => (
              <div key={event.id} className="bg-gray-50 rounded-lg p-4">
                <h3 className="font-semibold text-gray-800 mb-2">{event.name}</h3>
                <div className="text-sm text-gray-600 space-y-1">
                  <div className="flex items-center">
                    <Calendar className="w-4 h-4 mr-2" />
                    {formatEventDate(event.date)}
                  </div>
                  <div className="flex items-center">
                    <Clock className="w-4 h-4 mr-2" />
                    {formatEventTime(event.time)} horas
                  </div>
                </div>
                <Button
                  variant="ghost"
                  onClick={() => onRemoveFavorite(event.id)}
                  className="mt-2 text-festival-red text-sm hover:underline p-0 h-auto"
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
