import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "path";

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "src"),
    },
    dedupe: ['react', 'react-dom'], // Evitar múltiples versiones de React
  },
  define: {
    // Evitar problemas con process.env en producción
    'process.env.NODE_ENV': JSON.stringify(process.env.NODE_ENV || 'production'),
  },
  build: {
    outDir: "dist/public",
    emptyOutDir: true,
    rollupOptions: {
      output: {
        format: 'es',
        manualChunks: {
          // React core - mantener juntos para evitar problemas de dependencias
          'react-vendor': ['react', 'react-dom'],
          // Router
          'router': ['wouter'],
          // Query client
          'query': ['@tanstack/react-query'],
          // UI Components (Radix UI)
          'ui-components': [
            '@radix-ui/react-dialog',
            '@radix-ui/react-toast',
            '@radix-ui/react-tooltip',
            '@radix-ui/react-slot',
            '@radix-ui/react-checkbox',
            '@radix-ui/react-label',
            '@radix-ui/react-separator',
            '@radix-ui/react-popover'
          ],
          // Icons
          'icons': ['lucide-react']
        },
      },
    },
    target: 'es2020', // More modern target for better optimization
    minify: 'esbuild', // Usar esbuild que es más rápido y está integrado
    sourcemap: false, // Disable sourcemaps in production for smaller builds
    reportCompressedSize: false, // Faster builds
  },
  esbuild: {
    drop: ['console', 'debugger'], // Remove console statements
  },
});