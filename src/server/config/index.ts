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

  // Helper to parse arrays from comma-separated strings
  const parseArray = (value: string | undefined, defaultValue: string[]): string[] => {
    if (!value)
      return defaultValue
    return value.split(',').map(v => v.trim()).filter(Boolean)
  }

  return {
    server: {
      ...baseConfig.server,
      port: parseNumber(env['PORT'], baseConfig.server?.port || 3000),
      host: env['HOST'] || baseConfig.server?.host || 'localhost',
      nodeEnv,
      isProduction,
      isDevelopment,
      requestTimeout: parseNumber(env['REQUEST_TIMEOUT'], baseConfig.server?.requestTimeout || 30000),
      bodyLimit: parseNumber(env['BODY_LIMIT'], baseConfig.server?.bodyLimit || 10485760),
      shutdownTimeout: parseNumber(env['SHUTDOWN_TIMEOUT'], baseConfig.server?.shutdownTimeout || 10000),
      trustProxy: parseBoolean(env['TRUST_PROXY'], baseConfig.server?.trustProxy ?? false),
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
    security: {
      ...baseConfig.security,
      enabled: parseBoolean(env['SECURITY_ENABLED'], baseConfig.security?.enabled ?? isProduction),
      hsts: {
        enabled: parseBoolean(env['HSTS_ENABLED'], baseConfig.security?.hsts?.enabled ?? true),
        maxAge: parseNumber(env['HSTS_MAX_AGE'], baseConfig.security?.hsts?.maxAge || 31536000),
        includeSubDomains: parseBoolean(env['HSTS_INCLUDE_SUBDOMAINS'], baseConfig.security?.hsts?.includeSubDomains ?? true),
        preload: parseBoolean(env['HSTS_PRELOAD'], baseConfig.security?.hsts?.preload ?? true),
      },
      csp: {
        enabled: parseBoolean(env['CSP_ENABLED'], baseConfig.security?.csp?.enabled ?? true),
        directives: baseConfig.security?.csp?.directives || {},
      },
      frameOptions: (env['FRAME_OPTIONS'] || baseConfig.security?.frameOptions || 'DENY') as any,
      contentTypeOptions: parseBoolean(env['CONTENT_TYPE_OPTIONS'], baseConfig.security?.contentTypeOptions ?? true),
      xssProtection: parseBoolean(env['XSS_PROTECTION'], baseConfig.security?.xssProtection ?? true),
    },
    compression: {
      ...baseConfig.compression,
      enabled: parseBoolean(env['COMPRESSION_ENABLED'], baseConfig.compression?.enabled ?? true),
      level: parseNumber(env['COMPRESSION_LEVEL'], baseConfig.compression?.level || 6),
      threshold: parseNumber(env['COMPRESSION_THRESHOLD'], baseConfig.compression?.threshold || 1024),
      algorithms: baseConfig.compression?.algorithms || ['gzip', 'br'],
    },
    healthCheck: {
      ...baseConfig.healthCheck,
      enabled: parseBoolean(env['HEALTH_CHECK_ENABLED'], baseConfig.healthCheck?.enabled ?? true),
      path: env['HEALTH_CHECK_PATH'] || baseConfig.healthCheck?.path || '/health',
      timeout: parseNumber(env['HEALTH_CHECK_TIMEOUT'], baseConfig.healthCheck?.timeout || 5000),
      detailed: parseBoolean(env['HEALTH_CHECK_DETAILED'], baseConfig.healthCheck?.detailed ?? !isProduction),
    },
    monitoring: {
      ...baseConfig.monitoring,
      enabled: parseBoolean(env['MONITORING_ENABLED'], baseConfig.monitoring?.enabled ?? isProduction),
      sentryDsn: env['SENTRY_DSN'] || baseConfig.monitoring?.sentryDsn,
      sentryEnvironment: env['SENTRY_ENVIRONMENT'] || baseConfig.monitoring?.sentryEnvironment || nodeEnv,
      sentrySampleRate: env['SENTRY_SAMPLE_RATE'] ? Number.parseFloat(env['SENTRY_SAMPLE_RATE']) : (baseConfig.monitoring?.sentrySampleRate || 1.0),
      prometheusEnabled: parseBoolean(env['PROMETHEUS_ENABLED'], baseConfig.monitoring?.prometheusEnabled ?? false),
      prometheusPath: env['PROMETHEUS_PATH'] || baseConfig.monitoring?.prometheusPath || '/metrics',
      correlationEnabled: parseBoolean(env['CORRELATION_ENABLED'], baseConfig.monitoring?.correlationEnabled ?? true),
    },
    cache: {
      ...baseConfig.cache,
      enabled: parseBoolean(env['CACHE_ENABLED'], baseConfig.cache?.enabled ?? false),
      redisUrl: env['REDIS_URL'] || baseConfig.cache?.redisUrl,
      keyPrefix: env['REDIS_KEY_PREFIX'] || baseConfig.cache?.keyPrefix || 'balda:',
      defaultTtl: parseNumber(env['REDIS_DEFAULT_TTL'], baseConfig.cache?.defaultTtl || 3600),
      maxMemoryPolicy: env['REDIS_MAX_MEMORY_POLICY'] || baseConfig.cache?.maxMemoryPolicy || 'allkeys-lru',
    },
    game: {
      ...baseConfig.game,
      allowedBoardSizes: env['GAME_ALLOWED_BOARD_SIZES']
        ? parseArray(env['GAME_ALLOWED_BOARD_SIZES'], []).map(Number)
        : (baseConfig.game?.allowedBoardSizes || [3, 4, 5, 6, 7]),
      defaultBoardSize: parseNumber(env['GAME_DEFAULT_BOARD_SIZE'], baseConfig.game?.defaultBoardSize || 5),
      turnTimeout: parseNumber(env['GAME_TURN_TIMEOUT'], baseConfig.game?.turnTimeout || 0),
      maxConcurrentGames: parseNumber(env['GAME_MAX_CONCURRENT'], baseConfig.game?.maxConcurrentGames || 10),
      autoArchiveAfterHours: parseNumber(env['GAME_AUTO_ARCHIVE_HOURS'], baseConfig.game?.autoArchiveAfterHours || 24),
      maxPlayers: parseNumber(env['GAME_MAX_PLAYERS'], baseConfig.game?.maxPlayers || 4),
    },
    ai: {
      ...baseConfig.ai,
      thinkingDelay: parseNumber(env['AI_THINKING_DELAY'], baseConfig.ai?.thinkingDelay || 1500),
      difficulty: (env['AI_DIFFICULTY'] || baseConfig.ai?.difficulty || 'medium') as any,
      maxSuggestions: parseNumber(env['AI_MAX_SUGGESTIONS'], baseConfig.ai?.maxSuggestions || 100),
      randomizeEasy: parseBoolean(env['AI_RANDOMIZE_EASY'], baseConfig.ai?.randomizeEasy ?? true),
    },
    featureFlags: {
      ...baseConfig.featureFlags,
      aiPlayers: parseBoolean(env['FEATURE_AI_PLAYERS'], baseConfig.featureFlags?.aiPlayers ?? true),
      multiplayer: parseBoolean(env['FEATURE_MULTIPLAYER'], baseConfig.featureFlags?.multiplayer ?? true),
      suggestions: parseBoolean(env['FEATURE_SUGGESTIONS'], baseConfig.featureFlags?.suggestions ?? true),
      authentication: parseBoolean(env['FEATURE_AUTHENTICATION'], baseConfig.featureFlags?.authentication ?? false),
      leaderboards: parseBoolean(env['FEATURE_LEADERBOARDS'], baseConfig.featureFlags?.leaderboards ?? false),
    },
    maintenance: {
      ...baseConfig.maintenance,
      enabled: parseBoolean(env['MAINTENANCE_ENABLED'], baseConfig.maintenance?.enabled ?? false),
      message: env['MAINTENANCE_MESSAGE'] || baseConfig.maintenance?.message || 'System is under maintenance. Please try again later.',
      allowedIps: env['MAINTENANCE_ALLOWED_IPS'] ? parseArray(env['MAINTENANCE_ALLOWED_IPS'], []) : (baseConfig.maintenance?.allowedIps || []),
      estimatedEnd: env['MAINTENANCE_ESTIMATED_END'] || baseConfig.maintenance?.estimatedEnd,
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
