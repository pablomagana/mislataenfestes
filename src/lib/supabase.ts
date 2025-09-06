import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Supabase URL and Anon Key are required');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Storage configuration
export const STORAGE_BUCKET = 'event-photos';

export const STORAGE_POLICIES = {
  maxSize: parseInt(import.meta.env.VITE_MAX_PHOTO_SIZE) || 5 * 1024 * 1024, // 5MB default
  maxPhotos: parseInt(import.meta.env.VITE_MAX_PHOTOS_PER_UPLOAD) || 5,
  allowedTypes: ['image/jpeg', 'image/png', 'image/webp'],
  compressionQuality: 0.8,
};

// Helper function to get public URL for storage files
export function getPublicUrl(path: string) {
  const { data } = supabase.storage
    .from(STORAGE_BUCKET)
    .getPublicUrl(path);
  
  return data.publicUrl;
}

// Helper to generate unique filename
export function generateFileName(originalName: string): string {
  const timestamp = Date.now();
  const randomString = Math.random().toString(36).substring(2, 15);
  const extension = originalName.split('.').pop()?.toLowerCase() || 'jpg';
  return `${timestamp}_${randomString}.${extension}`;
}
