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
 * Detects API base URL based on environment
 * - Explicit VITE_API_URL takes priority (allows custom API domains)
 * - Development mode: defaults to http://localhost:3000
 * - Production mode: auto-detects from current window.location (same-origin)
 */
function detectApiBaseUrl(mode: EnvironmentConfig['mode']): string {
  // Explicit override via environment variable (highest priority)
  const envApiUrl = import.meta.env['VITE_API_URL']
  if (envApiUrl) {
    return envApiUrl
  }

  // Development: use localhost backend
  if (mode === 'development') {
    return 'http://localhost:3000'
  }

  // Production: auto-detect from current page URL (same-origin API)
  if (typeof window !== 'undefined' && window.location) {
    const { protocol, hostname, port } = window.location
    // Use current origin (same protocol, host, port)
    // This assumes frontend and backend are served from the same domain
    const detectedPort = port ? `:${port}` : ''
    return `${protocol}//${hostname}${detectedPort}`
  }

  // Fallback (should never happen in browser)
  return 'http://localhost:3000'
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

  // Detect API URL (smart detection based on mode)
  const apiBaseUrl = detectApiBaseUrl(mode)

  // Validate API URL format
  try {
    // Validate URL by parsing it (result not needed)
    void new URL(apiBaseUrl)
  }
  catch {
    throw new Error(`Invalid API URL: ${apiBaseUrl}. Must be a valid URL (e.g., http://localhost:3000)`)
  }

  // Log detected URL in development for debugging
  // Note: Cannot use logger here due to circular dependency (logger imports env)
  if (mode === 'development') {
    // eslint-disable-next-line no-console
    console.log(`🔗 API URL: ${apiBaseUrl}`)
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
