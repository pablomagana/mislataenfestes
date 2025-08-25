import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "path";

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "src"),
    },
  },
  build: {
    outDir: "dist/public",
    emptyOutDir: true,
    rollupOptions: {
      output: {
        manualChunks: (id) => {
          // Core libraries
          if (id.includes('react') && !id.includes('react-')) {
            return 'react';
          }
          if (id.includes('react-dom')) {
            return 'react';
          }
          
          // Router
          if (id.includes('wouter')) {
            return 'router';
          }
          
          // Only commonly used Radix UI components
          if (id.includes('@radix-ui/react-dialog') || 
              id.includes('@radix-ui/react-toast') ||
              id.includes('@radix-ui/react-tooltip') ||
              id.includes('@radix-ui/react-slot')) {
            return 'ui-core';
          }
          
          // Less frequently used Radix components
          if (id.includes('@radix-ui/')) {
            return 'ui-extended';
          }
          
          // Icons (heavy)
          if (id.includes('lucide-react') || id.includes('react-icons')) {
            return 'icons';
          }
          
          // Forms (only if used)
          if (id.includes('react-hook-form') || id.includes('@hookform/resolvers') || id.includes('zod')) {
            return 'forms';
          }
          
          // Heavy libraries
          if (id.includes('framer-motion')) {
            return 'motion';
          }
          if (id.includes('recharts')) {
            return 'charts';
          }
          if (id.includes('@tanstack/react-query')) {
            return 'query';
          }
          
          // Vendor chunk for other node_modules
          if (id.includes('node_modules')) {
            return 'vendor';
          }
        },
      },
    },
    target: 'es2020', // More modern target for better optimization
    minify: 'terser',
    terserOptions: {
      compress: {
        drop_console: true,
        drop_debugger: true,
        pure_funcs: ['console.log', 'console.info'],
        dead_code: true,
      },
      mangle: {
        safari10: true,
      },
    },
    sourcemap: false, // Disable sourcemaps in production for smaller builds
    reportCompressedSize: false, // Faster builds
  },
  esbuild: {
    drop: ['console', 'debugger'], // Remove console statements
  },
});