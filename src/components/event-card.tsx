import { useState } from "react";
import { Calendar, Clock, MapPin, Heart, Eye, Share2, Check } from "lucide-react";
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
  const [copied, setCopied] = useState(false);

  const isMobile = () =>
    'ontouchstart' in window || navigator.maxTouchPoints > 0;

  const copyToClipboard = async (url: string) => {
    await navigator.clipboard.writeText(url);
    trackEventDetailShare(event.id, 'clipboard_card');
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleShare = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    const eventUrl = `${window.location.origin}/evento/${event.id}`;
    const shareData = {
      title: `${event.name} · Fiestas de Mislata 2026`,
      text: `${event.name}\n📅 ${formatEventDate(event.date)} a las ${formatEventTime(event.time)}h\n📍 ${event.location}, Mislata${event.description ? `\n${event.description}` : ''}`,
      url: eventUrl,
    };

    if (navigator.share && isMobile()) {
      try {
        await navigator.share(shareData);
        trackEventDetailShare(event.id, 'native_card');
      } catch (error) {
        console.log('Share cancelled or failed');
      }
    } else {
      await copyToClipboard(eventUrl);
    }
  };

  const getStatusBadge = (status: string) => {
    if (status === 'ongoing') {
      return (
        <Badge className="bg-festival-red text-white animate-pulse">
          EN CURSO
        </Badge>
      );
    }
    return null;
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
      <CardContent className="p-4 sm:p-6">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2 flex-wrap">
            {getStatusBadge(event.status)}
            {getCategoryBadge(event.category)}
            {getTypeBadge(event.type)}
          </div>
          <div className="flex items-center shrink-0">
            <Link href={`/evento/${event.id}`}>
              <Button
                variant="ghost"
                size="icon"
                className="text-gray-500 hover:text-festival-orange transition-colors h-8 w-8"
                title="Ver detalles"
                aria-label={`Ver detalles de ${event.name}`}
              >
                <Eye className="w-4 h-4" />
              </Button>
            </Link>
            <Button
              variant="ghost"
              size="icon"
              onClick={handleShare}
              className={`transition-colors h-8 w-8 ${copied ? 'text-green-500' : 'text-gray-500 hover:text-blue-500'}`}
              title={copied ? '¡Enlace copiado!' : 'Compartir evento'}
              aria-label={copied ? 'Enlace copiado' : 'Compartir evento'}
            >
              {copied ? <Check className="w-4 h-4" /> : <Share2 className="w-4 h-4" />}
            </Button>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => {
                onToggleFavorite();
                trackFavoriteToggle(
                  event,
                  isFavorite ? 'remove' : 'add',
                  currentFavoritesCount
                );
              }}
              className="text-gray-500 hover:text-festival-red transition-colors h-8 w-8"
              title={isFavorite ? "Quitar de favoritos" : "Añadir a favoritos"}
              aria-label={isFavorite ? "Quitar de favoritos" : "Añadir a favoritos"}
            >
              <Heart className={`w-4 h-4 ${isFavorite ? 'fill-festival-red text-festival-red' : ''}`} />
            </Button>
          </div>
        </div>
        <Link href={`/evento/${event.id}`} className="block">
          <h3 className={`text-lg sm:text-xl font-semibold ${getTextColor(event.status)} mb-2 hover:text-festival-orange transition-colors cursor-pointer`}>
            {event.name}
          </h3>
        </Link>
        <div className={`flex flex-wrap items-center ${getSubTextColor(event.status)} gap-x-4 gap-y-1 text-sm mb-2`}>
          <div className="flex items-center">
            <Calendar className="w-4 h-4 mr-1.5 shrink-0" />
            <span>{formatEventDate(event.date)}</span>
          </div>
          <div className="flex items-center">
            <Clock className="w-4 h-4 mr-1.5 shrink-0" />
            <span>{formatEventTime(event.time)} h</span>
          </div>
        </div>
        <div className={`flex items-start ${getSubTextColor(event.status)} text-sm mb-2`}>
          <MapPin className="w-4 h-4 mr-1.5 mt-0.5 shrink-0" />
          <span>{event.location}</span>
        </div>
        {event.description && (
          <p className={`text-sm ${getSubTextColor(event.status)} mt-1`}>
            {event.description}
          </p>
        )}
      </CardContent>
    </Card>
  );
}
