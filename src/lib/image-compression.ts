import imageCompression from 'browser-image-compression';

export interface CompressionOptions {
  maxSizeMB: number;
  maxWidthOrHeight: number;
  useWebWorker: boolean;
  quality: number;
}

const DEFAULT_OPTIONS: CompressionOptions = {
  maxSizeMB: 1, // 1MB after compression
  maxWidthOrHeight: 1200, // Max dimension
  useWebWorker: true,
  quality: 0.8
};

export async function compressImage(file: File, options?: Partial<CompressionOptions>): Promise<File> {
  const compressionOptions = { ...DEFAULT_OPTIONS, ...options };
  
  try {
    const compressedFile = await imageCompression(file, compressionOptions);
    
    // Ensure the compressed file has a proper name
    const name = file.name.replace(/\.[^/.]+$/, '') + '_compressed.jpg';
    
    return new File([compressedFile], name, {
      type: 'image/jpeg',
      lastModified: Date.now(),
    });
  } catch (error) {
    console.error('Error compressing image:', error);
    throw new Error('Error al comprimir la imagen');
  }
}

export function validateImageFile(file: File): { valid: boolean; error?: string } {
  // Check file type
  const allowedTypes = ['image/jpeg', 'image/png', 'image/webp'];
  if (!allowedTypes.includes(file.type)) {
    return {
      valid: false,
      error: 'Tipo de archivo no válido. Solo se permiten JPG, PNG y WebP.'
    };
  }

  // Check file size (5MB max)
  const maxSize = 5 * 1024 * 1024; // 5MB
  if (file.size > maxSize) {
    return {
      valid: false,
      error: 'El archivo es demasiado grande. Tamaño máximo: 5MB.'
    };
  }

  return { valid: true };
}

export function validateImageFiles(files: File[]): {
  validFiles: File[];
  errors: Array<{ file: string; error: string }>;
} {
  const validFiles: File[] = [];
  const errors: Array<{ file: string; error: string }> = [];

  // Check max number of files
  const maxFiles = 5;
  if (files.length > maxFiles) {
    return {
      validFiles: [],
      errors: [{ file: 'general', error: `Máximo ${maxFiles} archivos permitidos` }]
    };
  }

  files.forEach(file => {
    const validation = validateImageFile(file);
    if (validation.valid) {
      validFiles.push(file);
    } else {
      errors.push({ file: file.name, error: validation.error || 'Error desconocido' });
    }
  });

  return { validFiles, errors };
}
