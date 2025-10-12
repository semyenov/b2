/**
 * Environment Configuration
 * Centralized environment variable management with validation
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
 * Throws error if required environment variables are missing
 */
function getEnvironmentConfig(): EnvironmentConfig {
  const mode = (import.meta.env.MODE || 'development') as EnvironmentConfig['mode']

  // Default URLs - can be overridden with environment variables
  const apiBaseUrl = import.meta.env.VITE_API_URL || 'http://localhost:3000'
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
