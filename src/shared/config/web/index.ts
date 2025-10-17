/**
 * Web Frontend Configuration Loader
 * Loads and validates web frontend configuration using c12
 *
 * This configuration is loaded during the Vite build process and injected
 * into the application at build time via Vite's define option.
 *
 * Configuration is loaded from multiple sources (in order of priority):
 * 1. Environment variables (highest priority)
 * 2. .env files
 * 3. web.config.ts file
 * 4. Default values (lowest priority)
 */

import type { WebConfig } from './schema'
import { loadConfig as c12LoadConfig } from 'c12'
import { consola } from 'consola'
import { defaultWebConfig } from './schema'

/**
 * Cached configuration instance
 */
let cachedConfig: WebConfig | null = null

/**
 * Load web frontend configuration from all sources
 * Merges environment variables, config files, and defaults
 */
export async function loadWebConfig(): Promise<WebConfig> {
  // Return cached config if already loaded
  if (cachedConfig) {
    return cachedConfig
  }

  try {
    // Load configuration using c12
    const { config: userConfig } = await c12LoadConfig<Partial<WebConfig>>({
      name: 'web',
      defaults: defaultWebConfig,
      dotenv: true, // Load from .env files
      packageJson: false, // Don't load from package.json
      envName: process.env['NODE_ENV'] || 'development',
    })

    // Merge environment variables with loaded config
    const config = mergeEnvVariables(userConfig || {})

    // Cache the configuration
    cachedConfig = config as WebConfig

    consola.success('Web frontend configuration loaded successfully')

    return cachedConfig
  }
  catch (error) {
    consola.error('Failed to load web frontend configuration:', error)
    throw error
  }
}

/**
 * Merge environment variables into configuration
 * Environment variables override config file values
 */
function mergeEnvVariables(baseConfig: Partial<WebConfig>): Partial<WebConfig> {
  const env = process.env

  // Helper to safely parse numbers
  const parseNumber = (value: string | undefined, defaultValue: number): number => {
    if (!value)
      return defaultValue
    const parsed = Number.parseInt(value, 10)
    return Number.isNaN(parsed) ? defaultValue : parsed
  }

  // Helper to safely parse booleans
  const parseBoolean = (value: string | undefined, defaultValue: boolean): boolean => {
    if (!value)
      return defaultValue
    return value.toLowerCase() === 'true' || value === '1'
  }

  // Determine environment mode
  const mode = (env['NODE_ENV'] || 'development') as WebConfig['mode']

  // Get API base URL with auto-detection support
  const apiBaseUrl = env['VITE_API_URL'] || baseConfig.api?.baseUrl || 'http://localhost:3000'

  // Generate WebSocket URL from API URL
  const wsBaseUrl = apiBaseUrl.replace(/^http/, 'ws')

  return {
    mode,
    api: {
      ...baseConfig.api,
      baseUrl: apiBaseUrl,
      wsBaseUrl,
      timeout: parseNumber(env['VITE_API_TIMEOUT'], baseConfig.api?.timeout || 30000),
      retryEnabled: parseBoolean(env['VITE_API_RETRY'], baseConfig.api?.retryEnabled ?? true),
      maxRetries: parseNumber(env['VITE_API_MAX_RETRIES'], baseConfig.api?.maxRetries || 3),
    },
    app: {
      ...baseConfig.app,
      name: env['VITE_APP_NAME'] || baseConfig.app?.name || 'Balda',
      version: baseConfig.app?.version || '1.0.0',
      devMode: mode === 'development',
      debugMode: parseBoolean(env['VITE_DEBUG'], baseConfig.app?.debugMode ?? false),
    },
    ui: {
      ...baseConfig.ui,
      theme: (env['VITE_THEME'] || baseConfig.ui?.theme || 'dark') as 'light' | 'dark',
      animations: parseBoolean(env['VITE_ANIMATIONS'], baseConfig.ui?.animations ?? true),
      toastDuration: parseNumber(env['VITE_TOAST_DURATION'], baseConfig.ui?.toastDuration || 3000),
      autoLoadSuggestions: parseBoolean(env['VITE_AUTO_SUGGESTIONS'], baseConfig.ui?.autoLoadSuggestions ?? true),
      showCoordinates: parseBoolean(env['VITE_SHOW_COORDINATES'], baseConfig.ui?.showCoordinates ?? true),
    },
    performance: {
      ...baseConfig.performance,
      enableServiceWorker: parseBoolean(env['VITE_SERVICE_WORKER'], baseConfig.performance?.enableServiceWorker ?? false),
      lazyLoading: parseBoolean(env['VITE_LAZY_LOADING'], baseConfig.performance?.lazyLoading ?? true),
      searchDebounce: parseNumber(env['VITE_SEARCH_DEBOUNCE'], baseConfig.performance?.searchDebounce || 300),
      virtualScrollThreshold: parseNumber(env['VITE_VIRTUAL_SCROLL'], baseConfig.performance?.virtualScrollThreshold || 100),
    },
    monitoring: {
      ...baseConfig.monitoring,
      enabled: parseBoolean(env['VITE_MONITORING'], baseConfig.monitoring?.enabled ?? false),
      sentryDsn: env['VITE_SENTRY_DSN'] || baseConfig.monitoring?.sentryDsn,
      sentryEnvironment: env['VITE_SENTRY_ENV'] || baseConfig.monitoring?.sentryEnvironment || mode,
      sampleRate: env['VITE_SENTRY_SAMPLE_RATE'] ? Number.parseFloat(env['VITE_SENTRY_SAMPLE_RATE']) : (baseConfig.monitoring?.sampleRate || 1.0),
      enablePerformance: parseBoolean(env['VITE_PERFORMANCE_MONITORING'], baseConfig.monitoring?.enablePerformance ?? false),
      performanceSampleRate: env['VITE_PERFORMANCE_SAMPLE_RATE'] ? Number.parseFloat(env['VITE_PERFORMANCE_SAMPLE_RATE']) : (baseConfig.monitoring?.performanceSampleRate || 0.1),
    },
    features: {
      ...baseConfig.features,
      aiPlayers: parseBoolean(env['VITE_FEATURE_AI'], baseConfig.features?.aiPlayers ?? true),
      multiplayer: parseBoolean(env['VITE_FEATURE_MULTIPLAYER'], baseConfig.features?.multiplayer ?? true),
      suggestions: parseBoolean(env['VITE_FEATURE_SUGGESTIONS'], baseConfig.features?.suggestions ?? true),
      authentication: parseBoolean(env['VITE_FEATURE_AUTH'], baseConfig.features?.authentication ?? false),
      leaderboards: parseBoolean(env['VITE_FEATURE_LEADERBOARDS'], baseConfig.features?.leaderboards ?? false),
      socialSharing: parseBoolean(env['VITE_FEATURE_SOCIAL'], baseConfig.features?.socialSharing ?? false),
    },
  }
}

/**
 * Get configuration synchronously
 * Must call loadWebConfig() first during build process
 */
export function getWebConfig(): WebConfig {
  if (!cachedConfig) {
    throw new Error('Web configuration not loaded. Call loadWebConfig() during build process.')
  }
  return cachedConfig
}

export { type WebConfig } from './schema'
