# PRD — Eliminación de la funcionalidad de fotos (subida de imágenes)

**Estado:** Propuesta
**Autor:** —
**Fecha:** 2026-07-14

## 1. Contexto

La web incluye una funcionalidad de **fotos de comunidad**: los usuarios suben imágenes a cada evento y estas se muestran en una galería. Es la **única** parte de la aplicación que depende de un backend (Supabase: Storage + base de datos); el resto es 100% estático.

Se solicita **eliminar la parte de subir imágenes**.

## 2. Objetivo

Retirar la capacidad de subir imágenes de la aplicación, simplificando el producto y eliminando la superficie de moderación (contenido generado por usuarios anónimos) y la dependencia de backend asociada.

## 3. Alcance

### Recomendado (opción A) — eliminar toda la funcionalidad de fotos
Dado que la galería solo se nutre de las subidas de usuarios (UGC anónimo) y que sin subida no hay fuente de contenido nuevo, se recomienda **retirar la funcionalidad completa de fotos** (subida + galería + estadísticas). Ventaja clave: elimina por completo la dependencia de **Supabase**, dejando la app **totalmente estática**.

Se elimina:
- **Componentes:** `photo-upload-modal.tsx`, `photo-gallery.tsx`, `lazy-image.tsx` (solo usado por la galería).
- **Hooks:** `use-event-photos.ts` (todos: `useEventPhotos`, `usePhotoUpload`, `usePhotoDelete`, `usePhotoReport`, `useEventPhotoStats`).
- **Librerías:** `lib/photo-service.ts`, `lib/image-compression.ts`, `lib/supabase.ts`.
- **Tipos:** `types/photo.ts`.
- **Esquema:** tabla `eventPhotos` y sus schemas/tipos en `shared/schema.ts`.
- **Analítica:** eventos de foto en `lib/festival-analytics.ts` (`trackPhotoGalleryOpen`, `trackPhotoView`, `trackPhotoShare`, `trackPhotoUploadStart`, `trackPhotoUploadSuccess`, `trackPhotoUploadError`, `trackPhotoReport`).
- **Dependencias npm:** `@supabase/supabase-js`, `browser-image-compression`, `react-dropzone`.
- **Variables de entorno:** `VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY`, `VITE_MAX_PHOTO_SIZE`, `VITE_MAX_PHOTOS_PER_UPLOAD`.
- **Puntos de integración en páginas:**
  - `pages/home.tsx`: import `useEventPhotoStats`, lazy import `PhotoUploadModal`, icono `Camera`, estados `showUploadModal`/`selectedEventForUpload`, `currentEventStats`, `handleUploadToCurrentEvent`, `handleCloseUploadModal`, sección "Quick Photo Upload" del evento actual y render del modal.
  - `pages/event-detail.tsx`: imports `useEventPhotos`/`useEventPhotoStats`/`PhotoGallery`/`PhotoUploadModal`, icono `Camera`, estado `showUploadModal`, bloque de galería/subida y render del modal.

### Alternativa (opción B) — solo quitar la subida, dejar galería en modo lectura
Se retira el botón/modal de subida pero se mantiene la galería mostrando fotos existentes. **Implica seguir dependiendo de Supabase** (lectura). Solo tiene sentido si hay fotos históricas que se quieran conservar visibles. **No recomendada** salvo que exista ese contenido.

## 4. Fuera de alcance

- Borrado de los datos/almacenamiento existentes en Supabase (bucket `event-photos` y tabla `event_photos`). Es infraestructura externa; se documenta como acción manual posterior (ver §7).
- Cambios en el resto de funcionalidades (listado, favoritos, filtros, calendario, SEO).

## 5. Impacto en el usuario

- Desaparece el botón "Comparte tus fotos" / galería en la home (evento en curso) y en el detalle de evento.
- Ninguna ruta deja de funcionar; las páginas de evento siguen mostrando datos, favoritos y compartir.
- Mejora de rendimiento y privacidad: se eliminan cargas de red a Supabase y la recogida de UGC.

## 6. Plan de implementación

1. **Desconectar UI (páginas):** quitar de `home.tsx` y `event-detail.tsx` los imports, estados, handlers, secciones de galería/subida y renders de modal. Sustituir el bloque de fotos del detalle por nada (o por un separador limpio).
2. **Eliminar módulos:** borrar componentes, hooks, libs y tipos listados en §3.
3. **Limpiar esquema:** eliminar `eventPhotos` y tipos asociados de `shared/schema.ts`.
4. **Limpiar analítica:** eliminar las funciones `trackPhoto*` de `festival-analytics.ts` y sus usos.
5. **Dependencias:** desinstalar `@supabase/supabase-js`, `browser-image-compression`, `react-dropzone`.
6. **Entorno/documentación:** eliminar variables `VITE_SUPABASE_*` y `VITE_MAX_PHOTO*` de `.env` y actualizar `CLAUDE.md` (dejará de haber backend; app 100% estática).
7. **Validación:** `npm run check` y `npm run build` sin errores; verificación manual de home y detalle de evento.

## 7. Acciones manuales / externas (post-merge)

- (Opcional) Eliminar en Supabase el bucket `event-photos` y la tabla `event_photos` si no se quieren conservar los datos.
- Revocar/retirar las claves de Supabase del hosting (Cloudflare) una vez desplegado.

## 8. Riesgos y consideraciones

- **Pérdida de UGC:** si existen fotos subidas con valor, se perderían de la vista (opción A). Mitigación: exportar antes desde Supabase, o usar opción B temporalmente.
- **Referencias colgantes:** asegurarse de no dejar imports muertos (romperían el build). `npm run check` lo detecta.
- **Marketing:** el plan SEO mencionaba UGC (fotos) como contenido fresco/engagement en fase de fiestas. Al eliminarlo, esa palanca desaparece; conviene reforzar RRSS como alternativa.

## 9. Criterios de aceptación

- No queda ninguna referencia a Supabase, subida de fotos ni galería en `src/` ni en `shared/`.
- `npm run check` y `npm run build` pasan.
- Home y detalle de evento se renderizan correctamente sin secciones de fotos.
- `package.json` no contiene `@supabase/supabase-js`, `browser-image-compression` ni `react-dropzone`.
- La app arranca sin necesidad de variables `VITE_SUPABASE_*`.

## 10. Decisiones abiertas

1. ¿Opción A (eliminar todo, recomendada) u opción B (galería en solo lectura)?
2. ¿Conservar (exportar) las fotos existentes en Supabase antes de eliminar, o descartar?
