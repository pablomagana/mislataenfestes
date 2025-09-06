import React, { useState } from "react";
import { MoreHorizontal, Flag, Trash2, Eye } from "lucide-react";
import LazyImage from "@/components/lazy-image";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { usePhotoReport } from "@/hooks/use-event-photos";
import type { EventPhoto } from "@/types/photo";

interface PhotoGalleryProps {
  photos: EventPhoto[];
  eventId: string;
}

export default function PhotoGallery({ photos, eventId }: PhotoGalleryProps) {
  const [selectedPhoto, setSelectedPhoto] = useState<EventPhoto | null>(null);
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);
  
  const reportPhotoMutation = usePhotoReport(eventId);

  const openLightbox = (photo: EventPhoto, index: number) => {
    setSelectedPhoto(photo);
    setLightboxIndex(index);
  };

  const closeLightbox = () => {
    setSelectedPhoto(null);
    setLightboxIndex(null);
  };

  const navigateLightbox = (direction: 'prev' | 'next') => {
    if (lightboxIndex === null) return;
    
    let newIndex;
    if (direction === 'prev') {
      newIndex = lightboxIndex === 0 ? photos.length - 1 : lightboxIndex - 1;
    } else {
      newIndex = lightboxIndex === photos.length - 1 ? 0 : lightboxIndex + 1;
    }
    
    setLightboxIndex(newIndex);
    setSelectedPhoto(photos[newIndex]);
  };

  const handleReportPhoto = async (photoId: string) => {
    try {
      await reportPhotoMutation.mutateAsync(photoId);
      // TODO: Show success toast
    } catch (error) {
      console.error('Error reporting photo:', error);
      // TODO: Show error toast
    }
  };

  const handleKeyDown = (event: React.KeyboardEvent) => {
    if (event.key === 'Escape') {
      closeLightbox();
    } else if (event.key === 'ArrowLeft') {
      navigateLightbox('prev');
    } else if (event.key === 'ArrowRight') {
      navigateLightbox('next');
    }
  };

  if (!photos || photos.length === 0) {
    return null;
  }

  return (
    <>
      {/* Grid de fotos */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
        {photos.map((photo, index) => (
          <div
            key={photo.id}
            className="relative group aspect-square rounded-lg overflow-hidden bg-gray-100 cursor-pointer hover:shadow-md transition-shadow"
            onClick={() => openLightbox(photo, index)}
          >
            <LazyImage
              src={photo.image_thumbnail_url || photo.image_url}
              alt={photo.caption || `Foto ${index + 1} del evento`}
              className="w-full h-full object-cover transition-transform group-hover:scale-105"
            />
            
            {/* Overlay con acciones */}
            <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-30 transition-all duration-200">
              <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button
                      size="sm"
                      variant="ghost"
                      className="h-8 w-8 p-0 bg-white/80 hover:bg-white text-gray-700"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <MoreHorizontal className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem onClick={(e) => {
                      e.stopPropagation();
                      openLightbox(photo, index);
                    }}>
                      <Eye className="mr-2 h-4 w-4" />
                      Ver completa
                    </DropdownMenuItem>
                    <DropdownMenuItem 
                      onClick={(e) => {
                        e.stopPropagation();
                        handleReportPhoto(photo.id);
                      }}
                      className="text-red-600"
                    >
                      <Flag className="mr-2 h-4 w-4" />
                      Reportar
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Lightbox Modal */}
      <Dialog open={selectedPhoto !== null} onOpenChange={closeLightbox}>
        <DialogContent 
          className="max-w-4xl w-full h-[90vh] p-0"
          onKeyDown={handleKeyDown}
        >
          {selectedPhoto && (
            <>
              <DialogHeader className="p-4 pb-0">
                <DialogTitle className="text-left">
                  Foto {(lightboxIndex || 0) + 1} de {photos.length}
                </DialogTitle>
              </DialogHeader>
              
              <div className="flex-1 relative overflow-hidden">
                <img
                  src={selectedPhoto.image_url}
                  alt={selectedPhoto.caption || 'Foto del evento'}
                  className="w-full h-full object-contain"
                />
                
                {/* Navegación */}
                {photos.length > 1 && (
                  <>
                    <Button
                      variant="ghost"
                      className="absolute left-4 top-1/2 -translate-y-1/2 bg-black/50 text-white hover:bg-black/70"
                      onClick={() => navigateLightbox('prev')}
                    >
                      ←
                    </Button>
                    <Button
                      variant="ghost"
                      className="absolute right-4 top-1/2 -translate-y-1/2 bg-black/50 text-white hover:bg-black/70"
                      onClick={() => navigateLightbox('next')}
                    >
                      →
                    </Button>
                  </>
                )}
              </div>
              
              {/* Caption */}
              {selectedPhoto.caption && (
                <div className="p-4 pt-0">
                  <p className="text-gray-600">{selectedPhoto.caption}</p>
                </div>
              )}
              
              {/* Metadatos */}
              <div className="px-4 pb-4 text-sm text-gray-500">
                <span>
                  Subida el {new Date(selectedPhoto.uploaded_at).toLocaleDateString()}
                </span>
                {selectedPhoto.uploaded_by && selectedPhoto.uploaded_by !== 'anonymous' && (
                  <span> • Por {selectedPhoto.uploaded_by}</span>
                )}
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}
