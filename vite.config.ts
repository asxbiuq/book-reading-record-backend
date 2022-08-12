import { fileURLToPath } from 'url';
import { defineConfig, loadEnv } from 'vite';


export default defineConfig({
  server: {
    port: 8080,
  },
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url)),
      'routes': fileURLToPath(new URL('./src/routes', import.meta.url)),
      'middleware': fileURLToPath(new URL('./src/middleware', import.meta.url)),
      'controllers': fileURLToPath(new URL('./src/controllers', import.meta.url)),
      'models': fileURLToPath(new URL('./src/models', import.meta.url)),
    },
  },
})
