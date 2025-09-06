import { Calendar, Clock, MapPin, Heart, Eye, Share2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Link } from "wouter";
import type { FestivalEvent } from "@shared/schema";
import { formatEventDate, formatEventTime } from "@/lib/date-utils";
import { trackFavoriteToggle, trackEventDetailShare } from "@/lib/festival-analytics";

interface EventCardProps {
  event: FestivalEvent;
  isFavorite: boolean;
  onToggleFavorite: () => void;
  currentFavoritesCount: number;
}

export default function EventCard({ event, isFavorite, onToggleFavorite, currentFavoritesCount }: EventCardProps) {
  const handleShare = async (e: React.MouseEvent) => {
    e.preventDefault(); // Evitar navegación cuando se hace click en share
    e.stopPropagation(); // Evitar propagación al contenedor padre
    
    const eventUrl = `${window.location.origin}/evento/${event.id}`;
    const shareData = {
      title: event.name,
      text: `¡Ven a ${event.name} en las Fiestas de Mislata!`,
      url: eventUrl,
    };

    if (navigator.share) {
      try {
        await navigator.share(shareData);
        trackEventDetailShare(event.id, 'native_card');
      } catch (error) {
        // User cancelled or error occurred
        console.log('Share cancelled or failed');
      }
    } else {
      // Fallback: copy to clipboard
      await navigator.clipboard.writeText(eventUrl);
      trackEventDetailShare(event.id, 'clipboard_card');
      // TODO: Show toast notification "¡Enlace copiado!"
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'ongoing':
        return (
          <Badge className="bg-festival-red text-white animate-pulse">
            EN CURSO
          </Badge>
        );
      case 'upcoming':
        return (
          <Badge className="bg-blue-500 text-white">
            PRÓXIMO
          </Badge>
        );
      case 'finished':
        return (
          <Badge className="bg-gray-400 text-white">
            TERMINADO
          </Badge>
        );
      default:
        return null;
    }
  };

  const getCategoryBadge = (category: string) => {
    switch (category) {
      case 'patronales':
        return (
          <Badge className="bg-festival-orange text-white">
            Patronales
          </Badge>
        );
      case 'populares':
        return (
          <Badge className="bg-festival-green text-white">
            Populares
          </Badge>
        );
      default:
        return null;
    }
  };

  const getTypeBadge = (type: string) => {
    if (type === 'música' || type === 'concierto') {
      return (
        <Badge className="bg-festival-purple text-white">
          Música
        </Badge>
      );
    }
    return null;
  };

  const getBorderColor = (status: string, category: string) => {
    if (status === 'ongoing') return 'border-festival-red';
    if (status === 'upcoming') {
      return category === 'populares' ? 'border-festival-green' : 'border-blue-500';
    }
    if (status === 'finished') return 'border-gray-300';
    return 'border-festival-purple';
  };

  const getCardOpacity = (status: string) => {
    return status === 'finished' ? 'opacity-75' : '';
  };

  const getTextColor = (status: string) => {
    return status === 'finished' ? 'text-gray-600' : 'text-gray-800';
  };

  const getSubTextColor = (status: string) => {
    return status === 'finished' ? 'text-gray-500' : 'text-gray-600';
  };

  return (
    <Card className={`bg-white shadow-sm border-l-4 ${getBorderColor(event.status, event.category)} ${getCardOpacity(event.status)} hover:shadow-md transition-shadow`}>
      <CardContent className="p-6">
        <div className="flex justify-between items-start">
          <div className="flex-1">
            <div className="flex items-center space-x-3 mb-2">
              {getStatusBadge(event.status)}
              {getCategoryBadge(event.category)}
              {getTypeBadge(event.type)}
            </div>
            <Link href={`/evento/${event.id}`} className="block">
              <h3 className={`text-xl font-semibold ${getTextColor(event.status)} mb-2 hover:text-festival-orange transition-colors cursor-pointer`}>
                {event.name}
              </h3>
            </Link>
            <div className={`flex items-center ${getSubTextColor(event.status)} space-x-4 text-sm mb-3`}>
              <div className="flex items-center">
                <Calendar className="w-4 h-4 mr-2" />
                <span>{formatEventDate(event.date)}</span>
              </div>
              <div className="flex items-center">
                <Clock className="w-4 h-4 mr-2" />
                <span>{formatEventTime(event.time)} horas</span>
              </div>
            </div>
            <div className={`flex items-center ${getSubTextColor(event.status)} text-sm mb-3`}>
              <MapPin className="w-4 h-4 mr-2" />
              <span>{event.location}</span>
            </div>
            <div className={`text-sm ${getSubTextColor(event.status)}`}>
              <span className="font-medium">Organizador:</span> 
              <span className="ml-1">{event.organizer}</span>
            </div>
            {event.description && (
              <div className={`text-sm ${getSubTextColor(event.status)} mt-2`}>
                <span className="font-medium">Descripción:</span> 
                <span className="ml-1">{event.description}</span>
              </div>
            )}
          </div>
          <div className="flex items-center space-x-1 ml-4">
            <Link href={`/evento/${event.id}`}>
              <Button
                variant="ghost"
                size="icon"
                className="text-gray-400 hover:text-festival-orange transition-colors h-8 w-8"
                title="Ver detalles"
              >
                <Eye className="w-4 h-4" />
              </Button>
            </Link>
            <Button
              variant="ghost"
              size="icon"
              onClick={handleShare}
              className="text-gray-400 hover:text-blue-500 transition-colors h-8 w-8"
              title="Compartir evento"
            >
              <Share2 className="w-4 h-4" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => {
                onToggleFavorite();
                
                // Track favoritos
                trackFavoriteToggle(
                  event,
                  isFavorite ? 'remove' : 'add',
                  currentFavoritesCount
                );
              }}
              className="text-gray-400 hover:text-festival-red transition-colors h-8 w-8"
              title={isFavorite ? "Quitar de favoritos" : "Añadir a favoritos"}
            >
              <Heart className={`w-4 h-4 ${isFavorite ? 'fill-festival-red text-festival-red' : ''}`} />
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
