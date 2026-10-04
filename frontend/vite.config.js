import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    // Local development proxy: /api requests go to Spring Boot
    // This is ONLY active during `npm run dev`.
    // In production (Netlify), VITE_API_URL is used instead (see src/services/api.js).
    proxy: {
      '/api': {
        target: 'http://localhost:8080',
        changeOrigin: true,
        secure: false,
      },
    },
  },
  build: {
    sourcemap: false,
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (id.includes('recharts')) return 'charts';
          if (id.includes('node_modules')) return 'vendor';
        },
      },
    },
  },
})
