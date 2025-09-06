# 🌙 Lógica de Tiempo Festivalero

## Problema Resuelto

Los eventos de madrugada (00:30, 01:00, etc.) aparecían como "terminados" cuando en realidad pertenecían a la "noche anterior" y seguían siendo válidos.

**Ejemplo del problema:**
- Evento: 31/08 00:30 (Noche del 30 al 31)
- Hora actual: 1/09 02:00
- Status incorrecto: "Terminado" ❌
- Status correcto: "En curso" ✅

## Solución: Sistema de Día Festivalero

### Concepto

Un "día festivalero" no termina a las 00:00, sino a las **03:00 AM**. Los eventos entre 00:00-02:59 se consideran parte del día anterior.

### Reglas

1. **Eventos 00:00-02:59**: Pertenecen al día anterior
2. **Eventos 03:00-23:59**: Pertenecen al día actual  
3. **Duración**: 📅 **Hasta el siguiente evento** o 2 horas máximo si es el último
4. **⚡ NUEVO: Solo un evento a la vez**: Si empieza un nuevo evento, el anterior automáticamente termina

### Casos de Uso

| Evento | Hora Actual | Status Anterior | Status Nuevo |
|--------|-------------|-----------------|--------------|
| 31/08 00:30 | 1/09 02:00 | Terminado ❌ | En curso ✅ |
| 31/08 21:00 | 1/09 02:00 | Terminado ✅ | Terminado ✅ |
| 1/09 00:30 | 1/09 01:00 | En curso ✅ | En curso ✅ |

## Archivos Implementados

### `src/lib/festival-time.ts`
- `calculateEventStatusFestival()`: Estado usando lógica festivalera
- `toFestivalDate()`: Convierte fechas a "fecha festivalera"  
- `getCurrentFestivalDate()`: Fecha actual festivalera
- `groupEventsByFestivalDate()`: Agrupa eventos por fecha festivalera

### `src/hooks/use-festival-events.tsx`
- Actualizado para usar `calculateEventStatusFestival`

### `src/lib/date-utils.ts`  
- `isEventOngoing()`, `isEventUpcoming()`, `isEventFinished()` ahora usan lógica festivalera

## Beneficios

✅ **Status correcto** para eventos nocturnos  
✅ **UX sin confusión** para usuarios  
✅ **Respeta cultura festivalera** (la noche continúa)  
✅ **Transparente** - el usuario no ve cambios en fechas  
✅ **Escalable** para otros eventos nocturnos

## Funcionamiento Técnico

```typescript
// Evento de madrugada: 31/08 00:30
const status = calculateEventStatusFestival('2025-08-31', '00:30');

// Si son las 02:00 del 1/09:
// - El evento "realmente" empezó a las 00:30 del 31/08
// - Han pasado 1.5 horas, aún está en curso
// - Status: 'ongoing' ✅
```

## Agrupación por Fechas

Los eventos se agrupan automáticamente por "fecha festivalera":

```
📅 30 de agosto
  🌅 10:00 - Evento matutino
  🌆 21:00 - Evento nocturno  
  🌙 00:30 - Evento madrugada (técnicamente del 31/08)
  🌙 01:00 - Otro evento madrugada

📅 31 de agosto  
  🌅 09:00 - Evento matutino
  ...
```

La implementación es **completamente transparente** para el usuario final.

---

✅ **Implementación completa y lista para producción** 🎊
