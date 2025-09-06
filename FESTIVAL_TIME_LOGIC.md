# 🌙 Lógica de Tiempo Festivalero

## Problema Resuelto

Los eventos que ocurren después de medianoche (00:30, 01:00, 02:30) aparecían marcados como "terminados" cuando en realidad aún no habían comenzado, porque el sistema los consideraba del día siguiente.

## Solución Implementada

### 📅 **Concepto de "Día Festivalero"**
- La jornada festivalera termina a las **3:00 AM**, no a medianoche
- Los eventos de 00:00-02:59 se consideran parte del día anterior
- Transparente para el usuario (no ve cambios en las fechas mostradas)

### 🔧 **Funcionalidades Implementadas**

#### 1. **`getFestivalToday()`**
```typescript
// Si son las 02:30 AM del 1 de septiembre
getFestivalToday() // Devuelve "2025-08-31" (día anterior)

// Si son las 10:00 AM del 1 de septiembre  
getFestivalToday() // Devuelve "2025-09-01" (día actual)
```

#### 2. **`getEventFestivalDate()`**
```typescript
// Evento: 2025-09-01 a las 00:30
getEventFestivalDate("2025-09-01", "00:30") // Devuelve "2025-08-31"

// Evento: 2025-09-01 a las 10:00
getEventFestivalDate("2025-09-01", "10:00") // Devuelve "2025-09-01"
```

#### 3. **`getFestivalEventStatus()`**
Determina el status real del evento considerando:
- Fecha festivalera vs fecha actual festivalera
- Hora del evento vs hora actual
- Estados: `upcoming`, `ongoing`, `finished`

### 📱 **Integración en la App**

#### **Página Principal (`home.tsx`):**
- ✅ Usa `getFestivalToday()` en lugar de fecha normal
- ✅ Aplica `getFestivalEventStatus()` a todos los eventos
- ✅ Agrupa eventos por fecha festivalera
- ✅ Ordena eventos considerando madrugadas al final del día anterior

#### **Página de Detalles (`event-detail.tsx`):**
- ✅ Aplica lógica de status festivalero
- ✅ Muestra badges de estado correctos
- ✅ Analytics usan el status correcto

### 🎯 **Casos de Uso Resueltos**

#### **Ejemplo Real:**
```
Fecha actual: 31 Agosto 2025, 01:30 AM

Evento: "NIT D'ALBAES" - 31 Agosto 2025 a las 00:30
❌ Lógica anterior: "Terminado" (porque 01:30 > 00:30)  
✅ Lógica nueva: "En curso" (porque ambos son del mismo día festivalero)

Evento: "PROCESIÓN" - 31 Agosto 2025 a las 21:00  
❌ Lógica anterior: "Terminado" (porque ya es día siguiente)
✅ Lógica nueva: "Terminado correctamente" (porque 21:00 ya pasó en el día festivalero)
```

### 🔄 **Flujo de Funcionamiento**

1. **Usuario accede a la app a las 02:00 AM**
2. **Sistema calcula:** "Aún estamos en el día festivalero anterior"
3. **Eventos de madrugada:** Se muestran como "En curso" o "Próximos"
4. **Eventos de ayer por la tarde:** Se muestran como "Terminados"
5. **Usuario no nota diferencia** en las fechas mostradas

### 🎨 **Transparencia Total**

- **Fechas mostradas:** Sin cambios (siempre la fecha real del evento)
- **Status calculado:** Usa lógica festivalera internamente
- **Ordenación:** Madrugadas aparecen al final del día anterior
- **UX:** Completamente transparente para el usuario

### 🧪 **Testing de Casos Edge**

```typescript
// 2:30 AM del 1 septiembre - Evento a las 00:30 del 1 septiembre
getFestivalEventStatus("2025-09-01", "00:30", "upcoming") 
// → "ongoing" (mismo día festivalero)

// 4:00 AM del 1 septiembre - Evento a las 00:30 del 1 septiembre  
getFestivalEventStatus("2025-09-01", "00:30", "upcoming")
// → "finished" (día festivalero anterior)

// 10:00 AM del 31 agosto - Evento a las 00:30 del 1 septiembre
getFestivalEventStatus("2025-09-01", "00:30", "upcoming")
// → "upcoming" (aún no ha llegado el día festivalero)
```

## ✨ Beneficios

- **Problem solved:** Los eventos de madrugada ahora tienen el status correcto
- **UX mejorada:** No confusión con eventos "terminados" que no han empezado
- **Lógica cultural:** Respeta el concepto de "noche festivalera"
- **Transparente:** El usuario no nota cambios visuales
- **Escalable:** Se puede aplicar a otros sistemas de eventos nocturnos

---

*Implementado en Enero 2025 para mejorar la experiencia durante las Fiestas de Mislata* 🎊
