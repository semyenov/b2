/**
 * Web Frontend Environment Configuration
 * Centralized environment variable management with validation
 *
 * This configuration is separate from the backend config because:
 * - Vite builds run in a different context than the server
 * - Frontend only needs a subset of configuration (API URL, mode)
 * - Environment variables are injected at build time with VITE_ prefix
 */

interface EnvironmentConfig {
  /** API base URL for backend communication */
  apiBaseUrl: string
  /** WebSocket URL for real-time updates */
  wsBaseUrl: string
  /** Environment mode: development, production, test */
  mode: 'development' | 'production' | 'test'
  /** Enable development features */
  isDevelopment: boolean
  /** Enable production optimizations */
  isProduction: boolean
}

/**
 * Validates and returns environment configuration
 * Throws error if configuration is invalid
 */
function getEnvironmentConfig(): EnvironmentConfig {
  // TypeScript requires bracket notation for import.meta.env access with noUncheckedIndexedAccess
  const mode = (import.meta.env['MODE'] || 'development') as EnvironmentConfig['mode']

  // Validate mode
  if (!['development', 'production', 'test'].includes(mode)) {
    throw new Error(`Invalid MODE: ${mode}. Must be one of: development, production, test`)
  }

  // Get API URL with validation
  const apiBaseUrl = import.meta.env['VITE_API_URL'] || 'http://localhost:3000'

  // Validate API URL format
  try {
    // Validate URL by parsing it (result not needed)
    void new URL(apiBaseUrl)
  }
  catch {
    throw new Error(`Invalid VITE_API_URL: ${apiBaseUrl}. Must be a valid URL (e.g., http://localhost:3000)`)
  }

  // Warn if using default in production
  if (mode === 'production' && apiBaseUrl === 'http://localhost:3000') {
    console.warn('⚠️  Using default API URL (http://localhost:3000) in production. Set VITE_API_URL environment variable.')
  }

  // Generate WebSocket URL from API URL
  const wsBaseUrl = apiBaseUrl.replace(/^http/, 'ws')

  return {
    apiBaseUrl,
    wsBaseUrl,
    mode,
    isDevelopment: mode === 'development',
    isProduction: mode === 'production',
  }
}

/**
 * Validated environment configuration
 * Use this throughout the application instead of accessing import.meta.env directly
 */
export const env = getEnvironmentConfig()

/**
 * Type-safe environment check utilities
 */
export const isDev = env.isDevelopment
export const isProd = env.isProduction
