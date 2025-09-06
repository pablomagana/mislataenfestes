import { supabase, STORAGE_BUCKET, generateFileName, getPublicUrl } from './supabase';
import { compressImage } from './image-compression';
import type { EventPhoto, UploadResult } from '@/types/photo';

export async function fetchEventPhotos(eventId: string): Promise<EventPhoto[]> {
  try {
    const { data, error } = await supabase
      .from('event_photos')
      .select('*')
      .eq('event_id', eventId)
      .eq('is_approved', true)
      .eq('is_reported', false)
      .order('uploaded_at', { ascending: false });

    if (error) {
      console.error('Error fetching event photos:', error);
      throw new Error('Error al cargar las fotos del evento');
    }

    return data || [];
  } catch (error) {
    console.error('Error in fetchEventPhotos:', error);
    throw error;
  }
}

export async function uploadPhotos(eventId: string, files: File[]): Promise<UploadResult[]> {
  const results: UploadResult[] = [];
  
  for (const file of files) {
    try {
      // 1. Comprimir imagen
      const compressedFile = await compressImage(file);
      
      // 2. Generar nombre único
      const fileName = generateFileName(file.name);
      const originalPath = `original/${fileName}`;
      
      // 3. Subir archivo original a Supabase Storage
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from(STORAGE_BUCKET)
        .upload(originalPath, compressedFile, {
          cacheControl: '31536000', // 1 year cache
          upsert: false
        });

      if (uploadError) {
        console.error('Upload error:', uploadError);
        
        // Mejorar mensajes de error para Storage
        let storageError = `Error al subir ${file.name}`;
        
        if (uploadError.message.includes('Bucket not found')) {
          storageError = `Error de configuración: No se encuentra el almacén de fotos. Contacta con soporte. info@mislataenfestes.es`;
        } else if (uploadError.message.includes('File size too large')) {
          storageError = `${file.name} es demasiado grande. Máximo 5MB permitidos.`;
        } else if (uploadError.message.includes('Invalid file type')) {
          storageError = `${file.name} tiene un formato no válido. Solo JPG, PNG y WebP permitidos.`;
        } else if (uploadError.message.includes('permission')) {
          storageError = `Sin permisos para subir ${file.name}. Verifica tu conexión.`;
        } else {
          storageError = `Error técnico al subir ${file.name}: ${uploadError.message}`;
        }
        
        results.push({ 
          success: false, 
          error: storageError
        });
        continue;
      }

      // 4. Crear thumbnail (versión más pequeña)
      const thumbnailFile = await compressImage(file, { 
        maxSizeMB: 0.2, 
        maxWidthOrHeight: 400 
      });
      
      const thumbnailPath = `thumbnails/${fileName}`;
      
      const { error: thumbnailError } = await supabase.storage
        .from(STORAGE_BUCKET)
        .upload(thumbnailPath, thumbnailFile, {
          cacheControl: '31536000',
          upsert: false
        });

      // Si falla el thumbnail, continuamos sin él
      const thumbnailUrl = thumbnailError ? undefined : getPublicUrl(thumbnailPath);

      // 5. Guardar metadata en base de datos
      const { data: photoData, error: dbError } = await supabase
        .from('event_photos')
        .insert({
          event_id: eventId,
          image_url: getPublicUrl(originalPath),
          image_thumbnail_url: thumbnailUrl,
          uploaded_by: 'anonymous', // Por ahora usuarios anónimos
          caption: null, // Se puede añadir después
          metadata: JSON.stringify({
            original_name: file.name,
            file_size: compressedFile.size,
            compressed: true
          })
        })
        .select()
        .single();

      if (dbError) {
        console.error('Database error:', dbError);
        // Limpiar archivos subidos si falla la DB
        await cleanupUploadedFiles([originalPath, thumbnailPath]);
        
        // Mejorar mensajes de error para el usuario
        let userFriendlyError = `Error al guardar ${file.name}`;
        
        if (dbError.message.includes('row-level security policy')) {
          userFriendlyError = `Error de permisos al guardar ${file.name}. Por favor, inténtalo de nuevo. Si el problema persiste, contacta con soporte.`;
        } else if (dbError.message.includes('duplicate key')) {
          userFriendlyError = `${file.name} ya existe. Intenta con otro archivo.`;
        } else if (dbError.message.includes('permission denied')) {
          userFriendlyError = `Sin permisos para subir ${file.name}. Verifica tu conexión.`;
        } else if (dbError.message.includes('connection')) {
          userFriendlyError = `Error de conexión al subir ${file.name}. Verifica tu internet.`;
        } else {
          userFriendlyError = `Error técnico al subir ${file.name}. Código: ${dbError.code || 'Desconocido'}`;
        }
        
        results.push({ 
          success: false, 
          error: userFriendlyError
        });
        continue;
      }

      results.push({ success: true, photo: photoData });
    } catch (error) {
      console.error('Error processing file:', file.name, error);
      results.push({ 
        success: false, 
        error: `Error al procesar ${file.name}: ${error instanceof Error ? error.message : 'Error desconocido'}` 
      });
    }
  }

  return results;
}

export async function deletePhoto(photoId: string): Promise<void> {
  try {
    // 1. Obtener información de la foto
    const { data: photo, error: fetchError } = await supabase
      .from('event_photos')
      .select('image_url, image_thumbnail_url')
      .eq('id', photoId)
      .single();

    if (fetchError || !photo) {
      throw new Error('Foto no encontrada');
    }

    // 2. Eliminar archivos del storage
    const filesToDelete: string[] = [];
    
    if (photo.image_url) {
      const originalPath = photo.image_url.split('/').pop();
      if (originalPath) filesToDelete.push(`original/${originalPath}`);
    }
    
    if (photo.image_thumbnail_url) {
      const thumbnailPath = photo.image_thumbnail_url.split('/').pop();
      if (thumbnailPath) filesToDelete.push(`thumbnails/${thumbnailPath}`);
    }

    if (filesToDelete.length > 0) {
      const { error: storageError } = await supabase.storage
        .from(STORAGE_BUCKET)
        .remove(filesToDelete);

      if (storageError) {
        console.error('Error deleting files from storage:', storageError);
        // Continuamos con la eliminación de la DB aunque falle el storage
      }
    }

    // 3. Eliminar registro de la base de datos
    const { error: dbError } = await supabase
      .from('event_photos')
      .delete()
      .eq('id', photoId);

    if (dbError) {
      throw new Error(`Error al eliminar la foto: ${dbError.message}`);
    }
  } catch (error) {
    console.error('Error in deletePhoto:', error);
    throw error;
  }
}

export async function reportPhoto(photoId: string): Promise<void> {
  try {
    const { error } = await supabase
      .from('event_photos')
      .update({ is_reported: true })
      .eq('id', photoId);

    if (error) {
      throw new Error(`Error al reportar la foto: ${error.message}`);
    }
  } catch (error) {
    console.error('Error in reportPhoto:', error);
    throw error;
  }
}

// Helper function para limpiar archivos si algo falla
async function cleanupUploadedFiles(paths: string[]): Promise<void> {
  try {
    await supabase.storage
      .from(STORAGE_BUCKET)
      .remove(paths);
  } catch (error) {
    console.error('Error cleaning up files:', error);
  }
}
