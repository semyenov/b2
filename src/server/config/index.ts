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
    })

    // Merge environment variables with loaded config
    const config = mergeEnvVariables(userConfig || {})

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
 * Merge environment variables into configuration
 * Environment variables override config file values
 */
function mergeEnvVariables(baseConfig: Partial<AppConfig>): Partial<AppConfig> {
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

  // Determine node environment
  const nodeEnv = (env['NODE_ENV'] || 'development') as 'development' | 'production' | 'test'
  const isProduction = nodeEnv === 'production'
  const isDevelopment = nodeEnv === 'development'

  return {
    server: {
      ...baseConfig.server,
      port: parseNumber(env['PORT'], baseConfig.server?.port || 3000),
      host: env['HOST'] || baseConfig.server?.host || 'localhost',
      nodeEnv,
      isProduction,
      isDevelopment,
    },
    database: {
      ...baseConfig.database,
      url: env['DATABASE_URL'] || baseConfig.database?.url || '',
      maxConnections: parseNumber(env['DB_MAX_CONNECTIONS'], baseConfig.database?.maxConnections || 20),
      idleTimeout: parseNumber(env['DB_IDLE_TIMEOUT'], baseConfig.database?.idleTimeout || 20),
      connectTimeout: parseNumber(env['DB_CONNECT_TIMEOUT'], baseConfig.database?.connectTimeout || 10),
      preparedStatements: parseBoolean(env['DB_PREPARED_STATEMENTS'], baseConfig.database?.preparedStatements ?? true),
    },
    jwt: {
      ...baseConfig.jwt,
      secret: env['JWT_SECRET'] || baseConfig.jwt?.secret || 'change-me-in-production',
      refreshSecret: env['JWT_REFRESH_SECRET'] || baseConfig.jwt?.refreshSecret || 'change-me-refresh-in-production',
      accessTokenExpiry: env['JWT_ACCESS_TOKEN_EXPIRY'] || baseConfig.jwt?.accessTokenExpiry || '1h',
      refreshTokenExpiry: env['JWT_REFRESH_TOKEN_EXPIRY'] || baseConfig.jwt?.refreshTokenExpiry || '7d',
    },
    logging: {
      ...baseConfig.logging,
      level: (env['LOG_LEVEL'] || baseConfig.logging?.level || (isProduction ? 'info' : 'debug')) as any,
      format: (env['LOG_FORMAT'] || baseConfig.logging?.format || (isProduction ? 'json' : 'pretty')) as 'json' | 'pretty',
      colors: parseBoolean(env['LOG_COLORS'], baseConfig.logging?.colors ?? !isProduction),
    },
    rateLimit: {
      ...baseConfig.rateLimit,
      enabled: parseBoolean(env['RATE_LIMIT_ENABLED'], baseConfig.rateLimit?.enabled ?? true),
      duration: parseNumber(env['RATE_LIMIT_DURATION'], baseConfig.rateLimit?.duration || 60000),
      max: parseNumber(env['RATE_LIMIT_MAX'], baseConfig.rateLimit?.max || 100),
    },
    cors: {
      ...baseConfig.cors,
      origin: env['CORS_ORIGIN'] ? (env['CORS_ORIGIN'] === 'true' ? true : env['CORS_ORIGIN'].split(',')) : (baseConfig.cors?.origin ?? true),
      credentials: parseBoolean(env['CORS_CREDENTIALS'], baseConfig.cors?.credentials ?? true),
    },
    dictionary: {
      ...baseConfig.dictionary,
      path: env['DICT_PATH'] || baseConfig.dictionary?.path,
      allowAll: parseBoolean(env['DICT_ALLOW_ALL'], baseConfig.dictionary?.allowAll ?? false),
    },
    storage: {
      ...baseConfig.storage,
      gamesDir: env['STORAGE_DIR'] || baseConfig.storage?.gamesDir || './data/games',
    },
    websocket: {
      ...baseConfig.websocket,
      archiveDelayMs: parseNumber(env['WS_ARCHIVE_DELAY_MS'], baseConfig.websocket?.archiveDelayMs || 300000),
    },
    swagger: {
      ...baseConfig.swagger,
      enabled: parseBoolean(env['SWAGGER_ENABLED'], baseConfig.swagger?.enabled ?? !isProduction),
      path: env['SWAGGER_PATH'] || baseConfig.swagger?.path || '/swagger',
    },
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
