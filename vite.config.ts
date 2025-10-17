import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'
import tsconfigPaths from 'vite-tsconfig-paths'
import { loadWebConfig } from './src/shared/config/web'

export default defineConfig(async () => {
  // Load web config using c12 (same pattern as backend)
  const webConfig = await loadWebConfig()

  return {
    plugins: [
      react(),
      tsconfigPaths({
        root: '../..',
      }), // Auto-sync tsconfig paths ✨
    ],
    root: './src/web',

    // Inject configuration into the app at build time
    define: {
      __WEB_CONFIG__: JSON.stringify(webConfig),
      __APP_VERSION__: JSON.stringify(webConfig.app.version),
      __API_BASE_URL__: JSON.stringify(webConfig.api.baseUrl),
      __WS_BASE_URL__: JSON.stringify(webConfig.api.wsBaseUrl),
    },

    build: {
      outDir: '../../dist/web',
      emptyOutDir: true, // Allow emptying outDir outside of root
      sourcemap: true, // Better debugging
      rollupOptions: {
        output: {
          manualChunks: {
            'react-vendor': ['react', 'react-dom'],
            'lib': ['@lib'],
            'hooks': ['@hooks'],
            'components': ['@components'],
            'utils': ['@utils'],
            'config': ['@config'],
            'types': ['@types'],
            'constants': ['@constants'],
            'shared': ['@shared'],
          },
        },
      },
    },
    resolve: {
      extensions: ['.ts', '.tsx', '.js', '.jsx', '.json'],
    },
    server: {
      port: 5173,
      proxy: {
        // Proxy all API endpoints (games, dictionary, health, etc.)
        '^/(games|dictionary|health|swagger)': {
          target: webConfig.api.baseUrl,
          changeOrigin: true,
          secure: false,
        },
      },
    },
  }
})
