import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { fetchEventPhotos, uploadPhotos, deletePhoto, reportPhoto } from '@/lib/photo-service';
import type { EventPhoto, UploadResult } from '@/types/photo';

// Hook para obtener fotos de un evento
export function useEventPhotos(eventId: string) {
  return useQuery({
    queryKey: ['event-photos', eventId],
    queryFn: () => fetchEventPhotos(eventId),
    staleTime: 5 * 60 * 1000, // 5 minutos
    gcTime: 10 * 60 * 1000, // 10 minutos en caché
    enabled: !!eventId,
  });
}

// Hook para subir fotos
export function usePhotoUpload(eventId: string) {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (files: File[]) => uploadPhotos(eventId, files),
    onSuccess: (results: UploadResult[]) => {
      // Invalidar la query de fotos para refrescar la galería
      queryClient.invalidateQueries({ queryKey: ['event-photos', eventId] });
      
      // Optionally update the cache optimistically
      const successfulPhotos = results
        .filter(result => result.success && result.photo)
        .map(result => result.photo as EventPhoto);
      
      if (successfulPhotos.length > 0) {
        queryClient.setQueryData(
          ['event-photos', eventId],
          (oldData: EventPhoto[] | undefined) => {
            return [...successfulPhotos, ...(oldData || [])];
          }
        );
      }
    },
    onError: (error) => {
      console.error('Error uploading photos:', error);
    }
  });
}

// Hook para eliminar una foto
export function usePhotoDelete(eventId: string) {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (photoId: string) => deletePhoto(photoId),
    onSuccess: (_, deletedPhotoId) => {
      // Update cache optimistically
      queryClient.setQueryData(
        ['event-photos', eventId],
        (oldData: EventPhoto[] | undefined) => {
          return oldData?.filter(photo => photo.id !== deletedPhotoId) || [];
        }
      );
    },
    onError: (error) => {
      console.error('Error deleting photo:', error);
      // Invalidate to refetch correct data
      queryClient.invalidateQueries({ queryKey: ['event-photos', eventId] });
    }
  });
}

// Hook para reportar una foto
export function usePhotoReport(eventId: string) {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (photoId: string) => reportPhoto(photoId),
    onSuccess: (_, reportedPhotoId) => {
      // Remove from cache optimistically (reported photos are hidden)
      queryClient.setQueryData(
        ['event-photos', eventId],
        (oldData: EventPhoto[] | undefined) => {
          return oldData?.filter(photo => photo.id !== reportedPhotoId) || [];
        }
      );
    },
    onError: (error) => {
      console.error('Error reporting photo:', error);
    }
  });
}

// Hook para obtener estadísticas de fotos
export function useEventPhotoStats(eventId: string) {
  const { data: photos } = useEventPhotos(eventId);
  
  return {
    totalPhotos: photos?.length || 0,
    photosToday: photos?.filter(photo => {
      const today = new Date().toISOString().split('T')[0];
      const photoDate = new Date(photo.uploaded_at).toISOString().split('T')[0];
      return photoDate === today;
    }).length || 0,
    hasPhotos: (photos?.length || 0) > 0,
    recentPhotos: photos?.slice(0, 4) || [], // 4 fotos más recientes
  };
}
