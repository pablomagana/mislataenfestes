# 🔧 Configuración de Variables de Entorno para Cloudflare Pages

## ✅ **DESARROLLO LOCAL** - ¡YA CONFIGURADO!

Tu archivo `.env` ya está configurado correctamente:
```
VITE_GA_MEASUREMENT_ID=G-438BRCNW8N
```

El servidor de desarrollo ya se reinició con la configuración corregida.

---

## 🌐 **PRODUCCIÓN (Cloudflare Pages)** - NECESARIO CONFIGURAR

Para que Google Analytics funcione en tu sitio web desplegado (`https://mislataenfestes.es`), necesitas configurar la variable en Cloudflare Pages.

### 🚀 **Paso 1: Acceder al Dashboard de Cloudflare**

1. Ve a [Cloudflare Dashboard](https://dash.cloudflare.com)
2. Selecciona tu proyecto "mislataenfestes" (o como se llame)
3. Ve a la sección **"Pages"**

### ⚙️ **Paso 2: Configurar Variables de Entorno**

1. Dentro de tu proyecto, ve a **"Settings"**
2. Busca la sección **"Environment variables"**
3. Haz clic en **"Add variable"**

### 📝 **Paso 3: Añadir la Variable**

Añade exactamente esta variable:

| Campo | Valor |
|-------|-------|
| **Variable name** | `VITE_GA_MEASUREMENT_ID` |
| **Value** | `G-438BRCNW8N` |
| **Environment** | `Production` (y opcionalmente `Preview`) |

### 🔄 **Paso 4: Redesplegar**

1. Después de guardar la variable, ve a **"Deployments"**
2. Haz clic en **"Retry deployment"** o pushea un nuevo commit
3. Espera a que se complete el deployment (~2-3 minutos)

---

## 🧪 **VERIFICACIÓN**

### ✅ **Desarrollo Local (http://localhost:5173)**
1. Abre la consola del navegador (F12)
2. Busca logs: `[GA4] Initializing GA4 G-438BRCNW8N`
3. Acepta cookies en el banner
4. Busca un evento o añade favoritos
5. Deberías ver: `[GA4] Tracking event: search {...}`

### ✅ **Producción (https://mislataenfestes.es)**
1. Después del redespliegue, abre tu sitio web
2. Acepta cookies en el banner  
3. Ve a Google Analytics → Admin → DebugView
4. Busca eventos o navega por tu sitio
5. Deberías ver eventos `page_view`, `search`, `favorite_event` en tiempo real

---

## 🔍 **Google Analytics DebugView**

Para verificar que funciona en **tiempo real**:

1. Ve a [Google Analytics](https://analytics.google.com)
2. Admin → DebugView
3. Busca tu sitio web en la lista de dispositivos activos
4. Realiza acciones en tu web:
   - ✅ Navegar entre páginas → `page_view`
   - ✅ Buscar eventos → `search`
   - ✅ Añadir favoritos → `favorite_event`
   - ✅ Usar calendario → `calendar_open`, `calendar_date_click`

### 📊 **Eventos que deberías ver:**

| Evento | Cuándo aparece | Datos incluidos |
|--------|---------------|-----------------|
| `page_view` | Al cargar cualquier página | `page_path`, `page_title` |
| `search` | Al buscar eventos | `search_term`, `results_count` |
| `favorite_event` | Al marcar/desmarcar favoritos | `event_name`, `action`, `event_category` |
| `calendar_open` | Al abrir el calendario | `current_favorites`, `current_date` |
| `calendar_date_click` | Al hacer click en fechas | `selected_date`, `events_on_date` |
| `scroll_to_top` | Al usar el botón flotante | `action_type` |
| `click` | Al hacer click en "pablomagana.es" | `link_domain`, `outbound: true` |

---

## 🚨 **Troubleshooting**

### Problema: "No veo eventos en DebugView"
**Solución:**
1. Verifica que aceptaste las cookies
2. Comprueba que la variable `VITE_GA_MEASUREMENT_ID` está configurada en Cloudflare
3. Asegúrate de que el deployment se completó correctamente

### Problema: "Aparece 'Missing VITE_GA_MEASUREMENT_ID' en consola"
**Solución:**
1. La variable no está configurada en Cloudflare Pages
2. Revisa que el nombre sea exacto: `VITE_GA_MEASUREMENT_ID`
3. Redesplegar después de añadir la variable

### Problema: "Los eventos no aparecen inmediatamente"
**Solución:**
- DebugView muestra eventos en tiempo real, pero puede tardar 30-60 segundos
- Asegúrate de estar en la vista correcta en Google Analytics

---

## 📋 **Resumen de Estado**

### ✅ **COMPLETADO:**
- [x] **.env local** configurado correctamente (`G-438BRCNW8N`)
- [x] **Servidor reiniciado** con la variable corregida
- [x] **Código implementado** con todos los eventos de tracking

### 🔄 **PENDIENTE:**
- [ ] **Configurar variable** en Cloudflare Pages
- [ ] **Redesplegar** el sitio web
- [ ] **Verificar funcionamiento** en DebugView

### 🎯 **Siguiente paso:**
**Configurar `VITE_GA_MEASUREMENT_ID=G-438BRCNW8N` en Cloudflare Pages** siguiendo los pasos de esta guía.

---

**🎉 ¡Una vez configurado tendrás analytics completos para las Fiestas de Mislata!**
