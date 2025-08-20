# 🔧 Guía Paso a Paso: Configurar Variable en Cloudflare Pages

## 🎯 **Objetivo:** Configurar `VITE_GA_MEASUREMENT_ID=G-438BRCNW8N` en Cloudflare Pages

---

## 📋 **PASO 1: Acceder a Cloudflare Dashboard**

### 🌐 **1.1 Abrir Cloudflare**
1. Ve a [dash.cloudflare.com](https://dash.cloudflare.com)
2. **Inicia sesión** con tu cuenta de Cloudflare
3. Verás tu dashboard principal

### 🔍 **1.2 Localizar tu proyecto**
- Busca un proyecto que se llame algo como:
  - `mislataenfestes` 
  - `mislata-en-festes`
  - `festival-mislata`
  - O el nombre que le diste cuando lo desplegaste

### 📍 **1.3 Identificar el tipo correcto**
- Debe tener el **icono de Pages** 📄 (no Workers ⚡)
- **URL** debe terminar en `.pages.dev`
- **Tipo**: "Pages" en la descripción

---

## 📋 **PASO 2: Entrar al proyecto**

### 🖱️ **2.1 Hacer clic en tu proyecto**
- Haz clic en el **nombre del proyecto** (no en la URL)
- Te llevará al dashboard específico del proyecto

### 🔍 **2.2 Verificar que es el correcto**
- **URL de vista previa** debe mostrar algo como `https://tu-proyecto.pages.dev`
- **Estado** debe ser "Active" o "Success"
- Debe mostrar el historial de deployments recientes

---

## 📋 **PASO 3: Ir a configuración**

### ⚙️ **3.1 Navegar a Settings**
- En la **barra superior** del proyecto, busca las pestañas:
  - Overview
  - Deployments  
  - Functions
  - **Settings** ← Haz clic aquí
  - Analytics

### 📄 **3.2 Llegar a Environment Variables**
- Dentro de Settings, verás un menú lateral izquierdo
- Busca y haz clic en **"Environment variables"**
- Puede estar también como **"Variables de entorno"**

---

## 📋 **PASO 4: Añadir la variable**

### ➕ **4.1 Añadir nueva variable**
- Haz clic en **"Add variable"** o **"Add"**
- Se abrirá un formulario

### 📝 **4.2 Completar el formulario**
```
┌─────────────────────────────────────┐
│ Variable name                       │
│ VITE_GA_MEASUREMENT_ID             │ ← Copia exactamente esto
├─────────────────────────────────────┤
│ Value                              │
│ G-438BRCNW8N                       │ ← Copia exactamente esto  
├─────────────────────────────────────┤
│ Environment                        │
│ ☑️ Production                       │ ← Marca esta casilla
│ ☐ Preview (opcional)               │
└─────────────────────────────────────┘
```

### ⚠️ **4.3 Verificar datos**
**CRÍTICO:** Asegúrate de que:
- ✅ Variable name: `VITE_GA_MEASUREMENT_ID` (exacto, con guiones bajos)
- ✅ Value: `G-438BRCNW8N` (una sola G, no GG)
- ✅ Environment: Production marcado

### 💾 **4.4 Guardar**
- Haz clic en **"Save"** o **"Add variable"**
- Verás la variable añadida en la lista

---

## 📋 **PASO 5: Redesplegar**

### 🔄 **5.1 Ir a Deployments**
- Haz clic en la pestaña **"Deployments"** (arriba)
- Verás una lista de deployments recientes

### 🚀 **5.2 Redesplegar el último**
- Busca el deployment más reciente (arriba de la lista)
- Haz clic en **"Retry deployment"** o los **3 puntos** → **"Retry"**
- También puede ser **"Redeploy"**

### ⏳ **5.3 Esperar**
- El deployment tomará **2-3 minutos**
- Estado cambiará de "Building" → "Success"
- **NO cierres** la pestaña hasta que termine

---

## 📋 **PASO 6: Verificar funcionamiento**

### 🌐 **6.1 Visitar tu sitio**
- Una vez completado el deployment, ve a `https://mislataenfestes.es`
- **Usar modo incógnito** para evitar caché

### 🧪 **6.2 Probar Google Analytics**
1. **Abre las herramientas de desarrollador** (F12)
2. Ve a la pestaña **"Console"**
3. **Acepta las cookies** en el banner del sitio
4. Busca mensajes como:
   ```
   [GA4] Initializing GA4 G-438BRCNW8N
   [GA4] GA script loaded successfully
   ```

### 📊 **6.3 Verificar en Google Analytics**
1. Ve a [analytics.google.com](https://analytics.google.com)
2. Admin → **DebugView**  
3. **Navega por tu sitio web**
4. En 30-60 segundos deberías ver eventos en tiempo real

---

## 🚨 **Si algo no funciona:**

### ❌ **La variable no aparece en la lista**
- Verifica que seleccionaste **"Production"**
- Asegúrate de que hiciste clic en **"Save"**

### ❌ **El deployment falla**
- Ve a **"Deployments"** → clic en el deployment fallido
- Revisa los **logs** para ver el error específico

### ❌ **Sigue sin detectarse en Google Analytics**
1. **Espera 5-10 minutos** - Google puede tardar
2. **Verifica en modo incógnito** 
3. **Acepta las cookies** - sin ellas no funciona
4. **Comprueba la consola** para logs de error

---

## 🎯 **Lo que verás cuando funcione:**

### ✅ **En la consola del navegador:**
```
[GA4] Initializing GA4 G-438BRCNW8N
[GA4] Consent mode set to: {analytics_storage: "granted"}  
[GA4] GA script loaded successfully
[GA4] Tracking page view: {page_path: "/", page_title: "Festes Mislata"}
```

### ✅ **En Google Analytics DebugView:**
- 🟢 Tu dispositivo aparecerá en la lista
- 📊 Eventos `page_view` aparecerán al navegar
- 🔍 `search` events al buscar eventos
- ❤️ `favorite_event` al marcar favoritos

---

## 📞 **¿Necesitas ayuda específica?**

Si te quedas atascado en algún paso:
1. **Toma una captura** de lo que ves en Cloudflare
2. **Dime exactamente** dónde te quedaste
3. **Comparte** cualquier mensaje de error

**🎉 Una vez configurado, tendrás analytics completos para las Fiestas de Mislata!**
