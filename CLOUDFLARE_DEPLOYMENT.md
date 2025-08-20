# Guía de Despliegue en Cloudflare Pages

Esta guía te ayudará a desplegar tu aplicación de eventos del Festival de Mislata en Cloudflare Pages.

## Prerrequisitos

1. **Cuenta de Cloudflare**: Crear una cuenta gratuita en [Cloudflare](https://cloudflare.com)
2. **Repositorio Git**: Tu código debe estar en GitHub, GitLab o Bitbucket
3. **Google Analytics ID**: Tu `VITE_GA_MEASUREMENT_ID` configurado

## Opción 1: Despliegue Directo desde Replit (Recomendado)

### Paso 1: Preparar el Proyecto
```bash
# Compilar para producción
npm run build
```

### Paso 2: Configurar Variables de Entorno
En Cloudflare Pages, necesitarás configurar:
- `VITE_GA_MEASUREMENT_ID`: Tu ID de Google Analytics (ej: G-XXXXXXXXXX)

### Paso 3: Usar Replit Deploy
1. Ve a la pestaña "Deploy" en tu Replit
2. Selecciona "Static Site" o "Full Stack App"
3. Cloudflare será una de las opciones disponibles

## Opción 2: Despliegue Manual via GitHub

### Paso 1: Exportar desde Replit
1. Descarga tu proyecto como ZIP desde Replit
2. Extrae los archivos a una carpeta local
3. Inicializa un repositorio Git:
```bash
git init
git add .
git commit -m "Initial commit - Festival Mislata App"
```

### Paso 2: Subir a GitHub
1. Crea un repositorio en GitHub
2. Conecta tu repositorio local:
```bash
git remote add origin https://github.com/tu-usuario/festival-mislata.git
git branch -M main
git push -u origin main
```

### Paso 3: Configurar Cloudflare Pages
1. Ve a [Cloudflare Dashboard](https://dash.cloudflare.com)
2. Selecciona "Pages" en el menú lateral
3. Haz clic en "Create a project"
4. Selecciona "Connect to Git"
5. Autoriza GitHub y selecciona tu repositorio

### Paso 4: Configuración de Build
```yaml
# Configuración recomendada para Cloudflare Pages
Build command: npm run build
Build output directory: dist/public
Root directory: /
Node.js version: 18
```

### Paso 5: Variables de Entorno
En la configuración del proyecto en Cloudflare:
1. Ve a "Settings" > "Environment variables"
2. Añade:
   - `VITE_GA_MEASUREMENT_ID`: Tu ID de Google Analytics
   - `NODE_VERSION`: 18

## Opción 3: Despliegue con Wrangler CLI

### Paso 1: Instalar Wrangler
```bash
npm install -g wrangler
```

### Paso 2: Autenticación
```bash
wrangler login
```

### Paso 3: Crear archivo de configuración
Crea `wrangler.toml` en la raíz del proyecto:
```toml
name = "festival-mislata"
compatibility_date = "2024-08-19"

[build]
command = "npm run build"
cwd = "."

[build.upload]
format = "modules"
dir = "dist/public"
main = "./index.js"

[[pages_build_output_dir]]
value = "dist/public"
```

### Paso 4: Desplegar
```bash
# Compilar primero
npm run build

# Desplegar a Cloudflare Pages
wrangler pages deploy dist/public --project-name festival-mislata
```

## Configuración Específica para esta Aplicación

### Estructura de Archivos después del Build
```
dist/
├── public/          # Frontend estático (para Cloudflare Pages)
│   ├── index.html
│   ├── assets/
│   └── ...
└── index.js         # Backend (para Cloudflare Workers, si es necesario)
```

### Variables de Entorno Requeridas
- `VITE_GA_MEASUREMENT_ID`: ID de Google Analytics
- `NODE_ENV`: production (automático en Cloudflare)

### Archivo `_redirects` (Opcional)
Para manejar las rutas de tu SPA, crea `dist/public/_redirects`:
```
/*    /index.html   200
```

## Configuración de Dominio Personalizado

### Paso 1: Añadir Dominio
1. En Cloudflare Pages, ve a "Custom domains"
2. Haz clic en "Set up a custom domain"
3. Introduce tu dominio (ej: festivalmislata.com)

### Paso 2: Configurar DNS
1. Ve a "DNS" en tu dashboard de Cloudflare
2. Añade un registro CNAME:
   - Nombre: `@` (o `www`)
   - Contenido: `tu-proyecto.pages.dev`

## Optimizaciones para Cloudflare

### 1. Configuración de Cache
En `dist/public/_headers`:
```
# Cache estático por 1 año
/assets/*
  Cache-Control: public, max-age=31536000, immutable

# Cache HTML por 1 hora
/*.html
  Cache-Control: public, max-age=3600

# No cachear la página principal
/
  Cache-Control: public, max-age=0, must-revalidate
```

### 2. Seguridad
En `dist/public/_headers` añadir:
```
/*
  X-Frame-Options: DENY
  X-Content-Type-Options: nosniff
  X-XSS-Protection: 1; mode=block
  Referrer-Policy: strict-origin-when-cross-origin
```

### 3. Performance
- Cloudflare automáticamente optimiza imágenes y CSS
- Activa "Auto Minify" en la configuración
- Usa el CDN global de Cloudflare

## Monitoreo y Analytics

### 1. Cloudflare Analytics
- Ve a "Analytics" en tu dashboard
- Monitorea tráfico, rendimiento y errores

### 2. Google Analytics
- Tu configuración actual ya incluye GA4
- El consentimiento de cookies funciona automáticamente

## Troubleshooting

### Error: "Build failed"
```bash
# Verificar que el build funciona localmente
npm run build

# Comprobar versión de Node.js
node --version  # Debe ser 18+
```

### Error: "Environment variables not found"
1. Verifica que `VITE_GA_MEASUREMENT_ID` esté configurado
2. Las variables deben tener prefijo `VITE_` para el frontend

### Error: "Routes not working"
1. Asegúrate de tener el archivo `_redirects`
2. Configura correctamente el SPA routing

## Costos

- **Cloudflare Pages**: Gratis para hasta 500 builds/mes
- **Bandwidth**: Ilimitado en el plan gratuito
- **Custom domains**: Gratis
- **Cloudflare Workers** (si necesitas backend): 100,000 requests/día gratis

## Comandos de Referencia Rápida

```bash
# Desarrollo local
npm run dev

# Compilar para producción
npm run build

# Previsualizar build
npm run preview

# Desplegar con Wrangler
wrangler pages deploy dist/public --project-name festival-mislata

# Ver logs
wrangler pages deployment tail
```

## Próximos Pasos

1. ✅ Compila tu aplicación: `npm run build`
2. 🔄 Elige tu método de despliegue (Replit Deploy recomendado)
3. 🌐 Configura tu dominio personalizado
4. 📊 Verifica que Google Analytics funcione
5. 🍪 Confirma que la alerta de cookies aparezca correctamente

Tu aplicación del Festival de Mislata estará disponible globalmente a través de la red CDN de Cloudflare con excelente rendimiento y seguridad.