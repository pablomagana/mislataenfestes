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