import { Calendar, Clock, MapPin, Heart } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import type { FestivalEvent } from "@shared/schema";
import { formatEventDate, formatEventTime } from "@/lib/date-utils";

interface EventCardProps {
  event: FestivalEvent;
  isFavorite: boolean;
  onToggleFavorite: () => void;
}

export default function EventCard({ event, isFavorite, onToggleFavorite }: EventCardProps) {
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
            <h3 className={`text-xl font-semibold ${getTextColor(event.status)} mb-2`}>
              {event.name}
            </h3>
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
          <Button
            variant="ghost"
            size="icon"
            onClick={onToggleFavorite}
            className="ml-4 text-gray-400 hover:text-festival-red transition-colors"
          >
            <Heart className={`w-5 h-5 ${isFavorite ? 'fill-festival-red text-festival-red' : ''}`} />
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
