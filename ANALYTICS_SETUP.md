# 🔧 Configuración de Google Analytics 4

## ⚠️ Problema identificado

Google Analytics no detecta la etiqueta porque **falta la variable de entorno** `VITE_GA_MEASUREMENT_ID`.

## 🚀 Solución rápida

### 1. Crear archivo `.env` en la raíz del proyecto:

```bash
# En la raíz del proyecto (/Users/p.magana/Documents/projects/mislataenfestes/)
echo "VITE_GA_MEASUREMENT_ID=G-TU_ID_AQUI" > .env
```

### 2. Obtener tu ID de Google Analytics:

1. Ve a [Google Analytics](https://analytics.google.com)
2. Admin → Flujos de datos → Web
3. Copia el ID que empieza con `G-` (ej: `G-438BRCNW8N`)

### 3. Reiniciar el servidor de desarrollo:

```bash
npm run dev
```

## ✅ Verificación

Una vez configurado:

1. **Abre tu sitio web** en el navegador
2. **Acepta las cookies** en el banner
3. **Ve a Google Analytics** → Admin → DebugView
4. **Navega por tu sitio** - deberías ver eventos `page_view`

## 🎯 Funcionalidades implementadas

### ✅ Core Analytics
- ✅ **Idempotencia robusta** - No se carga GA dos veces
- ✅ **Consent Mode** - Respeta las preferencias de cookies
- ✅ **SPA tracking** - Page views manuales (sin duplicados)
- ✅ **Debug en desarrollo** - Logs detallados para testing

### ✅ Eventos específicos para festivales
- ✅ **Búsquedas de eventos** - `search` con términos y resultados
- ✅ **Gestión de favoritos** - `favorite_event` con detalles del evento
- ✅ **Uso de calendario** - `calendar_open`, `calendar_date_click`
- ✅ **Navegación por fechas** - `scroll_to_date`, `scroll_to_top`
- ✅ **Enlaces externos** - `click` con metadata de dominio (footer)
- ✅ **Error 404** - `error_404` automático

### ✅ Identificación de usuario
- ✅ **setUserId()** - Cross-device tracking
- ✅ **setUserProperties()** - Propiedades personalizadas
- ✅ **Ejemplos de uso** - En `/src/examples/analytics-identity.ts`

## 🧩 Componentes útiles para tu proyecto

```tsx
import { OutboundLink } from '@/components/analytics';
import { 
  trackSearch, 
  trackFavoriteToggle, 
  trackCalendarOpen 
} from '@/lib/festival-analytics';

// 🔗 Enlace externo con tracking (para el footer)
<OutboundLink href="https://pablomagana.es" linkId="footer_developer">
  pablomagana.es
</OutboundLink>

// 🔍 Tracking de búsquedas (en onChange del Input)
trackSearch(searchQuery, filteredEvents.length, 'header');

// ❤️ Tracking de favoritos (en onClick del botón heart)
trackFavoriteToggle(event, isFavorite ? 'remove' : 'add', favorites.size);

// 📅 Tracking de calendario (en onClick del botón calendar)
trackCalendarOpen(favorites.size, today);
```

### 📁 **Funciones específicas para festivales:**
```tsx
// Importa las funciones específicas
import {
  trackSearch,           // Búsquedas de eventos
  trackFavoriteToggle,   // Gestión de favoritos  
  trackCalendarOpen,     // Uso del calendario
  trackScrollToDate,     // Navegación por fechas
  trackEventView         // Visualización de eventos
} from '@/lib/festival-analytics';
```

## 🐛 Debugging

### En desarrollo:
```javascript
// Los logs aparecerán en la consola del navegador
[GA4] Initializing GA4 G-XXXXXXXXXX
[GA4] GA script loaded successfully
[GA4] Tracking page view: {page_path: "/", page_title: "Inicio"}
```

### En DebugView:
1. Google Analytics → Admin → DebugView
2. Acepta cookies en tu sitio
3. Navega entre páginas
4. Verifica que aparecen eventos `page_view`

## 🔒 Privacidad y GDPR

- ✅ **Consent Mode** implementado
- ✅ **Sin tracking** hasta aceptar cookies
- ✅ **Analytics storage** controlado por el usuario
- ✅ **Sin snippet en HTML** - Carga condicional desde JS

## 📊 Eventos trackados para "Mislata en Festes"

### 🎯 **Eventos CRÍTICOS para tu app:**

| Evento | Cuándo se dispara | Datos incluidos | Importancia |
|--------|------------------|-----------------|-------------|
| `search` | Usuario busca eventos | `search_term`, `results_count`, `search_location` | 🔥 **CRÍTICO** |
| `favorite_event` | Añadir/quitar favoritos | `event_id`, `event_category`, `action`, `favorite_count` | 🔥 **CRÍTICO** |
| `calendar_date_click` | Click en fecha del calendario | `selected_date`, `events_on_date`, `has_favorites_on_date` | ⭐ **MUY ÚTIL** |
| `event_view` | Usuario ve un evento | `event_category`, `event_type`, `view_method` | ⭐ **MUY ÚTIL** |
| `calendar_open` | Abre modal calendario | `current_favorites`, `current_date` | ✅ **ÚTIL** |
| `scroll_to_date` | Navega a fecha específica | `target_date`, `events_count` | ✅ **ÚTIL** |

### 🤖 **Eventos automáticos:**
| `page_view` | Navegación SPA | `page_path`, `page_title`, `page_location` |
| `error_404` | Página no encontrada | `page_path`, `error_type` |
| `click` | Enlace al desarrollador | `link_domain`, `link_url`, `outbound: true` |

## 🚨 Próximos pasos para tu proyecto

### 🔥 **URGENTE - Configurar GA4:**
1. **Crear archivo `.env`** con tu ID:
   ```bash
   echo "VITE_GA_MEASUREMENT_ID=G-TU_ID_AQUI" > .env
   ```
2. **Obtener ID desde Google Analytics** (Admin → Flujos de datos → Web)
3. **Reiniciar servidor**: `npm run dev`

### ⭐ **IMPLEMENTAR tracking específico:**
4. **Añadir tracking de búsquedas** en `Header.tsx` (80% del valor)
5. **Añadir tracking de favoritos** en `EventCard.tsx` (crítico para entender popularidad)
6. **Añadir tracking de calendario** en `CalendarModal.tsx`
7. **Seguir la guía**: `FESTIVAL_ANALYTICS_INTEGRATION.md`

### 📊 **VERIFICAR funcionamiento:**
8. **Aceptar cookies** en el banner
9. **Buscar eventos** y verificar en GA4 DebugView
10. **Añadir favoritos** y verificar tracking
11. **Probar calendario** y ver eventos

### 🎯 **Durante las fiestas (23 ago - 6 sep):**
- Revisar GA4 diariamente para ver uso en tiempo real
- Identificar eventos más populares
- Ver patrones de búsqueda
- Analizar uso del calendario

### 📈 **Post-festival:**
- Crear informe de eventos más populares
- Analizar búsquedas para próximo año
- Revisar patrones de uso por categoría (patronales vs populares)

---

**🎉 ¡Tu app va a generar insights súper valiosos sobre cómo la gente disfruta las fiestas de Mislata!**
