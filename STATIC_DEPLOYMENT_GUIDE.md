# Guía de Despliegue Estático - Festival Mislata

## ✅ Conversión Completada

Tu aplicación del Festival de Mislata ha sido **completamente convertida a una aplicación estática**. Ya no necesita un servidor backend y puede desplegarse en cualquier servicio de hosting estático.

## Qué Se Eliminó

- ❌ Servidor Express.js
- ❌ Base de datos PostgreSQL/Neon
- ❌ APIs dinámicas
- ❌ Dependencias de backend

## Qué Se Mantiene

- ✅ Interfaz React completa
- ✅ Todos los eventos del festival (21 eventos)
- ✅ Sistema de filtros y búsqueda
- ✅ Favoritos (localStorage)
- ✅ Cookie consent y Google Analytics
- ✅ Cálculo dinámico de estado de eventos
- ✅ Diseño responsive y temático

## Estructura de Archivos Finales

```
dist/public/
├── index.html                    # Aplicación React
├── assets/
│   ├── index-[hash].js          # JavaScript bundleado
│   └── index-[hash].css         # CSS bundleado
├── api/
│   └── events.json              # Datos de eventos (estático)
└── _redirects                   # Para SPAs en Cloudflare Pages
```

## Comandos Simplificados

### Desarrollo Local
```bash
npx vite dev
```

### Compilar para Producción
```bash
npx vite build
```

### Vista Previa Local
```bash
npx vite preview --port 5000 --host 0.0.0.0
```

## Opciones de Despliegue

### 1. Cloudflare Pages (Recomendado)
- Despliegue automático desde GitHub
- CDN global incluido
- SSL automático
- **Comando de build**: `vite build`
- **Directorio de salida**: `dist/public`

### 2. Vercel
```bash
npm install -g vercel
vercel --prod
```

### 3. Netlify
- Arrastra la carpeta `dist/public` al dashboard
- O conecta tu repositorio Git

### 4. GitHub Pages
- Sube los archivos de `dist/public` a la rama `gh-pages`

## Funcionalidades Dinámicas Mantenidas

### Cálculo de Estado de Eventos
Los eventos cambian automáticamente entre:
- **upcoming** (próximos)
- **ongoing** (en curso) 
- **finished** (finalizados)

Basado en la fecha/hora actual vs. fecha/hora del evento.

### Persistencia Local
- Favoritos guardados en localStorage
- Preferencias de cookies guardadas
- Filtros recordados entre sesiones

## Variables de Entorno

Solo necesitas configurar:
```
VITE_GA_MEASUREMENT_ID=G-XXXXXXXXXX
```

## Ventajas de la Conversión Estática

1. **Más rápido**: Sin latencia de servidor
2. **Más barato**: Hosting gratuito en muchos servicios
3. **Más confiable**: No hay servidor que pueda fallar
4. **Mejor SEO**: Carga más rápida
5. **Escalable**: CDN automático en Cloudflare
6. **Simple**: Un solo comando para desplegar

## Eventos Incluidos

La aplicación incluye **21 eventos completos** del Festival de Mislata 2025:
- Noche Remember con José Coll
- Gran Entrada Mora y Cristiana
- Festival de Bandas de Música
- Juegos Tradicionales Infantiles
- Processiones y Passejàs
- Mascletàs y Despertàs
- Conciertos y eventos gastronómicos

## ¿Todo Funciona Igual?

**¡SÍ!** Todas las funcionalidades siguen funcionando:
- ✅ Filtrado por categoría (patronales/populares)
- ✅ Filtrado por estado (upcoming/ongoing/finished)
- ✅ Búsqueda de eventos
- ✅ Sistema de favoritos
- ✅ Cookie consent banner
- ✅ Google Analytics (con consentimiento)
- ✅ Diseño responsive
- ✅ Tema festival con colores oficiales

La única diferencia es que ahora es **más rápido y fácil de desplegar**.