import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'
import tsconfigPaths from 'vite-tsconfig-paths'

export default defineConfig({
  plugins: [
    react(),
    tsconfigPaths({
      root: '../..',
    }), // Auto-sync tsconfig paths ✨
  ],
  root: './src/web',
  build: {
    outDir: '../../dist/web',
    sourcemap: true, // Better debugging
    rollupOptions: {
      output: {
        manualChunks: {
          'react-vendor': ['react', 'react-dom'],
        },
      },
    },
  },
  resolve: {
    extensions: ['.ts', '.tsx', '.js', '.jsx', '.json'],
  },
  server: {
    port: 5173,
    // No proxy - frontend connects directly to backend
    // Backend CORS is configured to allow all origins in development
  },
})
