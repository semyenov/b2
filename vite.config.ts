import react from '@vitejs/plugin-react'
import { resolve } from 'pathe'
import { defineConfig } from 'vite'

export default defineConfig({
  plugins: [react()],
  root: './src/web',
  build: {
    outDir: '../../dist/web',
  },
  resolve: {
    extensions: ['.ts', '.tsx', '.js', '.jsx'],
    alias: {
      '@components': resolve(__dirname, 'src/web/components'),
    },
  },
  server: {

    port: 5173,
    proxy: {
      '/api': {
        target: 'http://localhost:3000',
        changeOrigin: true,
        secure: false,
        rewrite: path => path.replace(/^\/api/, ''),
      },
    },
  },
})
