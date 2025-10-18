/**
 * Configuration Loader
 * Loads and validates application configuration using c12
 *
 * Configuration is loaded from multiple sources (in order of priority):
 * 1. Environment variables (highest priority)
 * 2. .env files
 * 3. balda.config.ts file
 * 4. Default values (lowest priority)
 *
 * Usage:
 * ```typescript
 * import { config } from './config'
 * console.log(config.server.port)
 * ```
 */

import type { AppConfig } from './schema'
import { loadConfig as c12LoadConfig } from 'c12'
import { consola } from 'consola'
import { defaultConfig, validateConfig } from './schema'

/**
 * Cached configuration instance
 * Loaded once on first access
 */
let cachedConfig: AppConfig | null = null

/**
 * Load configuration from all sources
 * Merges environment variables, config files, and defaults
 */
export async function loadConfig(): Promise<AppConfig> {
  // Return cached config if already loaded
  if (cachedConfig) {
    return cachedConfig
  }

  try {
    // Load configuration using c12
    const { config: userConfig } = await c12LoadConfig<Partial<AppConfig>>({
      name: 'balda',
      defaults: defaultConfig,
      dotenv: true, // Load from .env files
      packageJson: false, // Don't load from package.json

      // Environment variable resolution
      // Maps environment variables to config paths
      envName: process.env['NODE_ENV'] || 'development',

      // Explicit environment variable mapping
      env: {
        DATABASE_URL: 'database.url',
        JWT_SECRET: 'jwt.secret',
        JWT_REFRESH_SECRET: 'jwt.refreshSecret',
        PORT: 'server.port',
        HOST: 'server.host',
        NODE_ENV: 'server.nodeEnv',
        LOG_LEVEL: 'logging.level',
        CORS_ORIGIN: 'cors.origin',
      },
    })

    // Merge environment variables with loaded config
    const config = (userConfig || {})

    // Validate the complete configuration
    validateConfig(config)

    // Cache the configuration
    cachedConfig = config as AppConfig

    consola.success('Configuration loaded successfully')

    // Log warnings for development mode
    if (config.server?.isProduction === false) {
      if (config.jwt?.secret === 'change-me-in-production') {
        consola.warn('Using default JWT_SECRET. Set JWT_SECRET environment variable in production!')
      }
    }

    return cachedConfig
  }
  catch (error) {
    consola.error('Failed to load configuration:', error)
    throw error
  }
}

/**
 * Get configuration synchronously
 * Must call loadConfig() first during application startup
 */
export function getConfig(): AppConfig {
  if (!cachedConfig) {
    throw new Error('Configuration not loaded. Call loadConfig() during application startup.')
  }
  return cachedConfig
}

/**
 * Export config singleton
 * This will be populated after loadConfig() is called
 */
export { type AppConfig } from './schema'
