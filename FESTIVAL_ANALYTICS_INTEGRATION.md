# 🎯 Integración de Analytics para "Mislata en Festes"

## 📍 **Dónde añadir el tracking en TUS componentes existentes**

### 1. 🔍 **Header.tsx** - Tracking de búsquedas

```tsx
// En src/components/header.tsx
import { trackSearch, trackSearchClear } from '@/lib/festival-analytics';

// En el Input de búsqueda (Desktop):
<Input
  type="text"
  value={searchQuery}
  onChange={(e) => {
    const newQuery = e.target.value;
    setSearchQuery(newQuery);
    
    // 🎯 AÑADIR: Track búsquedas después de 500ms
    if (newQuery.trim()) {
      setTimeout(() => {
        const resultsCount = filteredEvents.length; // Pasarlo como prop
        trackSearch(newQuery, resultsCount, 'header');
      }, 500);
    }
  }}
  placeholder="Buscar eventos..."
/>

// En el botón de limpiar búsqueda:
<Button
  onClick={() => {
    setSearchQuery("");
    trackSearchClear('header'); // 🎯 AÑADIR
  }}
>
```

### 2. ❤️ **EventCard.tsx** - Tracking de favoritos

```tsx
// En src/components/event-card.tsx
import { trackFavoriteToggle } from '@/lib/festival-analytics';

// En el botón de favoritos:
<Button
  variant="ghost"
  size="icon"
  onClick={() => {
    onToggleFavorite();
    
    // 🎯 AÑADIR: Track favoritos
    trackFavoriteToggle(
      event,
      isFavorite ? 'remove' : 'add',
      currentFavoritesCount // Pasar como prop desde Home
    );
  }}
  className="ml-4 text-gray-400 hover:text-festival-red transition-colors"
>
```

### 3. 📅 **CalendarModal.tsx** - Tracking de calendario

```tsx
// En src/components/calendar-modal.tsx
import { trackCalendarOpen, trackCalendarDateClick } from '@/lib/festival-analytics';

// En el componente padre (Home.tsx) al abrir el modal:
<Button
  variant="ghost"
  onClick={() => {
    setShowCalendarModal(true);
    trackCalendarOpen(favorites.size, today); // 🎯 AÑADIR
  }}
  className="text-gray-600 hover:text-festival-purple transition-colors"
>

// En CalendarModal, en handleDayClick:
const handleDayClick = (date: Date) => {
  const dateStr = format(date, 'yyyy-MM-dd');
  const dayEvents = eventsByDate[dateStr] || [];
  
  if (dayEvents.length > 0) {
    // 🎯 AÑADIR: Track clicks en fechas
    trackCalendarDateClick(
      dateStr, 
      dayEvents.length, 
      hasFavoriteEvents(dateStr)
    );
    
    onDayClick(dateStr);
    onClose();
  }
};
```

### 4. 🏠 **Home.tsx** - Tracking de navegación

```tsx
// En src/pages/home.tsx
import { trackScrollToTop, trackScrollToDate, trackFavoritesModalOpen } from '@/lib/festival-analytics';

// En el botón de scroll to top:
const scrollToTop = () => {
  window.scrollTo({ top: 0, behavior: 'smooth' });
  trackScrollToTop(); // 🎯 AÑADIR
};

// En scrollToDate:
const scrollToDate = (date: string) => {
  const element = dateRefs.current[date];
  if (element) {
    element.scrollIntoView({ 
      behavior: 'smooth', 
      block: 'start',
      inline: 'nearest'
    });
    
    // 🎯 AÑADIR: Track navegación a fecha
    const eventsCount = futureEventsByDate[date]?.length || 0;
    trackScrollToDate(date, eventsCount);
  }
};

// En el botón de favoritos del header:
<Button
  variant="ghost"
  onClick={() => {
    setShowFavoritesModal(true);
    trackFavoritesModalOpen(favorites.size); // 🎯 AÑADIR
  }}
  className="text-gray-600 hover:text-festival-red transition-colors"
>
```

### 5. 🔗 **Footer** - Tracking de enlace externo

```tsx
// En src/pages/home.tsx, en el footer:
import { OutboundLink } from '@/components/analytics';

// Reemplazar el enlace normal por:
<footer className="mt-16 pb-8 text-center">
  <p className="text-gray-500 text-sm">
    Desarrollada por {' '}
    <OutboundLink 
      href="https://pablomagana.es" 
      linkId="footer_developer"
      className="text-gray-500 hover:text-gray-700 transition-colors underline"
    >
      pablomagana.es
    </OutboundLink>
  </p>
</footer>
```

## 🎯 **Props que necesitas pasar entre componentes:**

### Home.tsx → Header.tsx:
```tsx
<Header 
  // ... props existentes
  filteredEventsCount={filteredEvents.length} // 🎯 AÑADIR para tracking
/>
```

### Home.tsx → EventCard.tsx:
```tsx
<EventCard
  // ... props existentes  
  currentFavoritesCount={favorites.size} // 🎯 AÑADIR para tracking
/>
```

## 🔍 **Ejemplos de lo que verás en GA4 DebugView:**

### Búsquedas populares:
```
Event: search
Parameters:
- search_term: "música"
- results_count: 12
- search_location: "header"
- has_results: true
```

### Eventos favoritos más populares:
```
Event: favorite_event
Parameters:
- event_id: "concierto-plaza-mayor-001"
- event_name: "Concierto Plaza Mayor"
- event_category: "populares"
- event_type: "música"
- action: "add"
- favorite_count: 3
```

### Fechas más consultadas:
```
Event: calendar_date_click
Parameters:
- selected_date: "2024-08-25"
- events_on_date: 8
- has_favorites_on_date: true
```

## 📊 **Insights que obtendrás:**

1. **¿Qué busca la gente?** → Eventos `search` con términos populares
2. **¿Qué eventos son más populares?** → Counts de `favorite_event` 
3. **¿Qué fechas generan más interés?** → Clicks en `calendar_date_click`
4. **¿Cuándo viene más gente?** → `page_view` distribuidos por tiempo
5. **¿Categorías preferidas?** → `event_category` (patronales vs populares)
6. **¿Tipos de eventos favoritos?** → `event_type` (música, procesión, etc.)

## 🎯 **Componentes simplificados:**

Solo necesitas:
- ✅ **OutboundLink** - Para el enlace del footer
- ✅ **festival-analytics functions** - Tracking específico de tu app
- ❌ ~~LeadForm~~ - Eliminado (no hay formularios)
- ❌ ~~FileDownloadLink~~ - Eliminado (no hay descargas)
- ❌ ~~CTAButton~~ - Eliminado (usas funciones específicas)

## 🚀 **Plan de implementación:**

### Paso 1: **Configuración básica** (5 min)
```bash
echo "VITE_GA_MEASUREMENT_ID=G-TU_ID_AQUI" > .env
npm run dev
```

### Paso 2: **Tracking crítico** (15 min) - 80% del valor
- Búsquedas en `Header.tsx`
- Favoritos en `EventCard.tsx`

### Paso 3: **Tracking avanzado** (10 min)
- Calendario en `CalendarModal.tsx`
- Navegación en `Home.tsx`

### Paso 4: **Verificación** (5 min)
- Probar en GA4 DebugView
- Verificar todos los eventos

**Total: ~35 minutos para tener analytics completos** 🎉
