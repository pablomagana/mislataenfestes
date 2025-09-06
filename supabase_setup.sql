-- Script de configuración de Supabase para la funcionalidad de fotos de eventos
-- Ejecutar este script en el SQL Editor de Supabase

-- 1. Crear la tabla de fotos de eventos
CREATE TABLE IF NOT EXISTS event_photos (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  event_id VARCHAR NOT NULL,
  image_url TEXT NOT NULL,
  image_thumbnail_url TEXT,
  uploaded_by VARCHAR DEFAULT 'anonymous',
  uploaded_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  caption TEXT,
  is_approved BOOLEAN DEFAULT TRUE,
  is_reported BOOLEAN DEFAULT FALSE,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. Crear índices para optimización
CREATE INDEX IF NOT EXISTS idx_event_photos_event_id ON event_photos(event_id);
CREATE INDEX IF NOT EXISTS idx_event_photos_uploaded_at ON event_photos(uploaded_at DESC);
CREATE INDEX IF NOT EXISTS idx_event_photos_approved ON event_photos(is_approved) WHERE is_approved = true;
CREATE INDEX IF NOT EXISTS idx_event_photos_reported ON event_photos(is_reported) WHERE is_reported = false;

-- 3. Habilitar Row Level Security (RLS)
ALTER TABLE event_photos ENABLE ROW LEVEL SECURITY;

-- 4. Crear políticas de seguridad
-- Permitir lectura pública de fotos aprobadas y no reportadas
CREATE POLICY "Public photos are viewable by everyone" 
ON event_photos FOR SELECT 
USING (is_approved = true AND is_reported = false);

-- Permitir a cualquiera insertar fotos (usuarios anónimos)
CREATE POLICY "Anyone can upload photos" 
ON event_photos FOR INSERT 
WITH CHECK (true);

-- Solo permitir a usuarios autenticados actualizar sus propias fotos
CREATE POLICY "Users can update their own photos" 
ON event_photos FOR UPDATE 
USING (uploaded_by = COALESCE(auth.jwt() ->> 'sub', 'anonymous'))
WITH CHECK (uploaded_by = COALESCE(auth.jwt() ->> 'sub', 'anonymous'));

-- Solo permitir a admins moderar fotos (actualizar is_approved, is_reported)
CREATE POLICY "Only admins can moderate photos" 
ON event_photos FOR UPDATE 
USING (
  auth.jwt() ->> 'role' = 'admin' OR 
  auth.jwt() ->> 'user_role' = 'admin'
);

-- 5. Crear función para actualizar updated_at automáticamente
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- 6. Crear trigger para updated_at
CREATE TRIGGER update_event_photos_updated_at 
BEFORE UPDATE ON event_photos 
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- 7. Crear bucket de storage para fotos
INSERT INTO storage.buckets (id, name, public) 
VALUES ('event-photos', 'event-photos', true)
ON CONFLICT (id) DO NOTHING;

-- 8. Configurar políticas de storage
-- Permitir lectura pública
CREATE POLICY "Public Access" ON storage.objects FOR SELECT
USING (bucket_id = 'event-photos');

-- Permitir subida de fotos a cualquiera
CREATE POLICY "Allow photo uploads" ON storage.objects FOR INSERT
WITH CHECK (bucket_id = 'event-photos');

-- Permitir eliminar solo sus propias fotos
CREATE POLICY "Allow delete own photos" ON storage.objects FOR DELETE
USING (
  bucket_id = 'event-photos' AND 
  (owner = auth.uid() OR auth.jwt() ->> 'role' = 'admin')
);

-- 9. Crear vista para estadísticas de fotos por evento
CREATE OR REPLACE VIEW event_photo_stats AS
SELECT 
  event_id,
  COUNT(*) as total_photos,
  COUNT(*) FILTER (WHERE uploaded_at >= CURRENT_DATE) as photos_today,
  COUNT(*) FILTER (WHERE uploaded_at >= CURRENT_DATE - INTERVAL '7 days') as photos_week,
  MAX(uploaded_at) as last_photo_at,
  MIN(uploaded_at) as first_photo_at
FROM event_photos 
WHERE is_approved = true AND is_reported = false
GROUP BY event_id;

-- 10. Crear función para limpiar fotos huérfanas (opcional, para mantenimiento)
CREATE OR REPLACE FUNCTION cleanup_orphaned_photos()
RETURNS INTEGER AS $$
DECLARE
  deleted_count INTEGER;
BEGIN
  -- Marcar fotos más antiguas de 30 días sin evento asociado
  WITH deleted_photos AS (
    DELETE FROM event_photos 
    WHERE created_at < NOW() - INTERVAL '30 days'
    AND event_id NOT IN (
      -- Aquí podrías hacer JOIN con tu tabla de eventos si la tienes en Supabase
      -- Por ahora solo eliminamos fotos muy antiguas
      SELECT DISTINCT event_id FROM event_photos WHERE created_at > NOW() - INTERVAL '7 days'
    )
    RETURNING *
  )
  SELECT COUNT(*) INTO deleted_count FROM deleted_photos;
  
  RETURN deleted_count;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Información importante:
-- 1. Asegúrate de tener configuradas las variables de entorno VITE_SUPABASE_URL y VITE_SUPABASE_ANON_KEY
-- 2. El bucket 'event-photos' debe existir en Storage
-- 3. Las políticas permiten acceso público para lectura y subida anónima
-- 4. Para producción, considera implementar rate limiting y validación adicional
-- 5. Ejecuta cleanup_orphaned_photos() periódicamente para limpiar datos antiguos

COMMENT ON TABLE event_photos IS 'Fotos subidas por usuarios para eventos del festival';
COMMENT ON VIEW event_photo_stats IS 'Estadísticas agregadas de fotos por evento';
