import React, { useState } from "react";
import { Link, useLocation } from "wouter";
import { ArrowLeft, Heart, Share2, MapPin, Calendar, Clock, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { useEvent } from "@/hooks/use-event";
import { useFavorites } from "@/hooks/use-favorites";
import { formatEventDate, formatEventTime } from "@/lib/date-utils";
import { trackFavoriteToggle, trackEventDetailView, trackEventDetailShare, trackBackToEvents } from "@/lib/festival-analytics";
import LoadingSpinner from "@/components/loading-spinner";
import { useSeo, SITE_URL } from "@/hooks/use-seo";
import { getEventEndISO } from "@/lib/festival-time";
import eventsData from "@/data/events.json";
import type { FestivalEvent } from "@shared/schema";

interface EventDetailProps {
  eventId: string;
}

export default function EventDetail({ eventId }: EventDetailProps) {
  const [, setLocation] = useLocation();
  const [pageStartTime] = useState(Date.now());

  // Data hooks
  const { data: event, isLoading: eventLoading, error: eventError } = useEvent(eventId);
  const { favorites, toggleFavorite, isFavorite } = useFavorites();

  // Track page view when event loads
  React.useEffect(() => {
    if (event && !eventLoading) {
      trackEventDetailView(event.id, event.name);
    }
  }, [event, eventLoading]);

  useSeo({
    title: event
      ? `${event.name} · Fiestas de Mislata 2026`
      : "Evento · Fiestas de Mislata 2026",
    description: event
      ? `${event.name} — ${formatEventDate(event.date)} a las ${formatEventTime(event.time)} en ${event.location}, Mislata. ${event.description || "Consulta el programa de las Fiestas de Mislata 2026."}`
      : "Detalle de un evento de las Fiestas de Mislata 2026.",
    path: `/evento/${eventId}`,
  });

  // Loading state
  if (eventLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <LoadingSpinner />
        <span className="ml-2 text-gray-600">Cargando evento...</span>
      </div>
    );
  }

  // Error state
  if (eventError || !event) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-800 mb-4">Evento no encontrado</h2>
          <p className="text-gray-600 mb-6">
            El evento que buscas no existe o ha sido eliminado.
          </p>
          <Link href="/">
            <Button variant="outline">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Volver al inicio
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  const handleShare = async () => {
    const shareData = {
      title: event.name,
      text: `¡Ven a ${event.name} en las Fiestas de Mislata!`,
      url: window.location.href,
    };

    if (navigator.share) {
      try {
        await navigator.share(shareData);
        trackEventDetailShare(event.id, 'native');
      } catch (error) {
        // User cancelled or error occurred
        console.log('Share cancelled or failed');
      }
    } else {
      // Fallback: copy to clipboard
      await navigator.clipboard.writeText(window.location.href);
      trackEventDetailShare(event.id, 'clipboard');
      // TODO: Show toast notification
    }
  };

  const handleBackToEvents = () => {
    const timeSpent = Date.now() - pageStartTime;
    trackBackToEvents(event?.id || eventId, timeSpent);
    setLocation('/');
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
    return (
      <Badge variant="outline" className="capitalize">
        {type}
      </Badge>
    );
  };

  const sameDayEvents = (eventsData as FestivalEvent[]).filter(e => e.date === event.date);
  const eventUrl = `${SITE_URL}/evento/${event.id}`;

  const eventLdJson = {
    "@context": "https://schema.org",
    "@type": "Event",
    name: event.name,
    startDate: `${event.date}T${event.time}:00+02:00`,
    endDate: getEventEndISO(event.date, event.time, sameDayEvents),
    eventStatus: "https://schema.org/EventScheduled",
    eventAttendanceMode: "https://schema.org/OfflineEventAttendanceMode",
    location: {
      "@type": "Place",
      name: event.location,
      address: {
        "@type": "PostalAddress",
        addressLocality: "Mislata",
        addressRegion: "Valencia",
        addressCountry: "ES",
      },
    },
    description: event.description || `${event.name} en las Fiestas de Mislata 2026`,
    organizer: {
      "@type": "Organization",
      name: event.organizer,
      url: SITE_URL,
    },
    offers: {
      "@type": "Offer",
      price: "0",
      priceCurrency: "EUR",
      availability: "https://schema.org/InStock",
      url: eventUrl,
      validFrom: `${event.date}T00:00:00+02:00`,
    },
    url: eventUrl,
    isAccessibleForFree: true,
    image: `${SITE_URL}/og-image.png`,
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(eventLdJson) }}
      />
      {/* Header con navegación */}
      <div className="bg-white shadow-sm border-b sticky top-0 z-40">
        <div className="max-w-4xl mx-auto px-4 py-3">
          <div className="flex items-center justify-between">
            <Button
              variant="ghost"
              size="sm"
              onClick={handleBackToEvents}
              className="text-gray-600 hover:text-gray-800"
            >
              <ArrowLeft className="w-4 h-4 mr-1" />
              Volver
            </Button>
            
            <div className="flex items-center space-x-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  toggleFavorite(event.id);
                  trackFavoriteToggle(
                    event,
                    isFavorite(event.id) ? 'remove' : 'add',
                    favorites.size
                  );
                }}
                className="text-gray-400 hover:text-festival-red transition-colors"
              >
                <Heart className={`w-5 h-5 ${isFavorite(event.id) ? 'fill-festival-red text-festival-red' : ''}`} />
              </Button>
              
              <Button
                variant="ghost"
                size="sm"
                onClick={handleShare}
                className="text-gray-400 hover:text-gray-600 transition-colors"
              >
                <Share2 className="w-5 h-5" />
              </Button>
            </div>
          </div>
        </div>
      </div>

      <main className="max-w-4xl mx-auto px-4 py-6">
        {/* Información principal del evento */}
        <Card className="mb-6">
          <CardContent className="p-6">
            {/* Badges */}
            <div className="flex items-center space-x-2 mb-4">
              {getStatusBadge(event.status)}
              {getCategoryBadge(event.category)}
              {getTypeBadge(event.type)}
            </div>

            {/* Título */}
            <h1 className="text-3xl font-bold text-gray-800 mb-6">
              {event.name}
            </h1>

            {/* Información básica */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
              <div className="space-y-3">
                <div className="flex items-center text-gray-600">
                  <Calendar className="w-5 h-5 mr-3 text-festival-orange" />
                  <span>{formatEventDate(event.date)}</span>
                </div>
                
                <div className="flex items-center text-gray-600">
                  <Clock className="w-5 h-5 mr-3 text-festival-orange" />
                  <span>{formatEventTime(event.time)} horas</span>
                </div>
              </div>
              
              <div className="space-y-3">
                <div className="flex items-center text-gray-600">
                  <MapPin className="w-5 h-5 mr-3 text-festival-orange" />
                  <span>{event.location}</span>
                </div>
                
                <div className="flex items-center text-gray-600">
                  <User className="w-5 h-5 mr-3 text-festival-orange" />
                  <span>{event.organizer}</span>
                </div>
              </div>
            </div>

            {/* Descripción */}
            {event.description && (
              <div>
                <Separator className="my-4" />
                <h3 className="font-semibold text-gray-800 mb-2">Descripción</h3>
                <p className="text-gray-600 leading-relaxed">{event.description}</p>
              </div>
            )}
          </CardContent>
        </Card>

      </main>
    </div>
  );
}
