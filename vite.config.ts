import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'
import tsconfigPaths from 'vite-tsconfig-paths'
import { loadConfig as loadServerConfig } from './src/server/core/config'
import { loadConfig as loadWebConfig } from './src/web/config'

export default defineConfig(async () => {
  const webConfig = await loadWebConfig()
  const serverConfig = await loadServerConfig()

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
    },

    build: {
      outDir: '../../dist/web',
      emptyOutDir: true, // Allow emptying outDir outside of root
      sourcemap: true, // Better debugging
      rollupOptions: {
        output: {
          manualChunks: {
            // Split React vendor bundle
            'react-vendor': ['react', 'react-dom'],
            // Let Vite automatically chunk the rest
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
          target: `http://${serverConfig.server.host}:${serverConfig.server.port}`,
          changeOrigin: true,
          secure: false,
        },
        // Legacy /api prefix support
        '/api': {
          target: `http://${serverConfig.server.host}:${serverConfig.server.port}`,
          changeOrigin: true,
          secure: false,
          rewrite: path => path.replace(/^\/api/, ''),
        },
      },
    },
  }
})
