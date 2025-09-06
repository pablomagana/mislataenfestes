/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_GA_MEASUREMENT_ID: string;
  readonly VITE_SUPABASE_URL: string;
  readonly VITE_SUPABASE_ANON_KEY: string;
  readonly VITE_MAX_PHOTO_SIZE: string;
  readonly VITE_MAX_PHOTOS_PER_UPLOAD: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
