/**
 * Web Frontend Configuration
 * Centralized configuration loaded by c12 and injected by Vite at build time
 *
 * Configuration is loaded from multiple sources (priority order):
 * 1. Environment variables (VITE_* prefix)
 * 2. .env files
 * 3. web.config.ts file
 * 4. Default values
 *
 * The configuration is injected as global constants during the Vite build process,
 * making it available in the browser without additional runtime loading.
 */

import type { WebConfig } from '@shared/config/web/schema'

/**
 * Complete web configuration
 * Loaded by c12 during build and injected by Vite
 */
export const config: WebConfig = __WEB_CONFIG__

/**
 * Environment configuration (backward compatibility)
 * Maps to the new config structure
 */
export const env = {
  /** API base URL for backend communication */
  apiBaseUrl: config.api.baseUrl,
  /** WebSocket URL for real-time updates */
  wsBaseUrl: config.api.wsBaseUrl,
  /** Environment mode: development, production, test */
  mode: config.mode,
  /** Enable development features */
  isDevelopment: config.mode === 'development',
  /** Enable production optimizations */
  isProduction: config.mode === 'production',
} as const

/**
 * Type-safe environment check utilities
 */
export const isDev = config.mode === 'development'
export const isProd = config.mode === 'production'

/**
 * Convenience exports for common config values
 */
export const appName = config.app.name
export const appVersion = config.app.version
export const apiTimeout = config.api.timeout
export const debugMode = config.app.debugMode
