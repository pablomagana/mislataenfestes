// Types for event photos functionality
export interface EventPhoto {
  id: string;
  event_id: string;
  image_url: string;
  image_thumbnail_url?: string;
  uploaded_by?: string;
  uploaded_at: string;
  caption?: string;
  is_approved: boolean;
  is_reported: boolean;
  metadata?: Record<string, any>;
  created_at: string;
  updated_at: string;
}

export interface PhotoUploadState {
  isUploading: boolean;
  progress: number; // 0-100
  error?: string;
  uploadedPhotos: UploadedPhoto[];
}

export interface UploadedPhoto {
  id: string;
  tempUrl: string; // URL temporal mientras se procesa
  finalUrl?: string; // URL final después de procesamiento
  caption?: string;
  status: 'uploading' | 'processing' | 'completed' | 'error';
  file?: File;
}

export interface UploadResult {
  success: boolean;
  photo?: EventPhoto;
  error?: string;
}

export interface PhotoValidationError {
  file: string;
  error: string;
}

// Form data for photo upload
export interface PhotoUploadForm {
  files: File[];
  captions: Record<string, string>; // filename -> caption
}

// Gallery view modes
export type GalleryViewMode = 'grid' | 'masonry' | 'carousel';

// Photo filters
export interface PhotoFilters {
  dateRange?: {
    start: string;
    end: string;
  };
  uploadedBy?: string;
  hasCaption?: boolean;
  sortBy: 'newest' | 'oldest' | 'random';
}
