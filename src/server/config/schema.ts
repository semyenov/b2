/**
 * Configuration Schema
 * Centralized type-safe configuration for the Balda application
 *
 * This file defines all configuration options with types, validation, and defaults.
 * Configuration can be loaded from multiple sources:
 * - Environment variables
 * - .env files
 * - balda.config.ts file
 * - Command-line arguments
 */

/**
 * Server configuration
 */
export interface ServerConfig {
  /** Server port (default: 3000) */
  port: number
  /** Hostname to bind to (default: localhost) */
  host: string
  /** Node environment: development, production, or test */
  nodeEnv: 'development' | 'production' | 'test'
  /** Enable production mode optimizations */
  isProduction: boolean
  /** Enable development mode features */
  isDevelopment: boolean
}

/**
 * Database configuration
 */
export interface DatabaseConfig {
  /** PostgreSQL connection URL */
  url: string
  /** Maximum number of connections in the pool (default: 20) */
  maxConnections: number
  /** Idle connection timeout in seconds (default: 20) */
  idleTimeout: number
  /** Connection timeout in seconds (default: 10) */
  connectTimeout: number
  /** Use prepared statements for performance (default: true) */
  preparedStatements: boolean
}

/**
 * JWT authentication configuration
 */
export interface JwtConfig {
  /** Secret key for signing JWT access tokens */
  secret: string
  /** Secret key for signing JWT refresh tokens */
  refreshSecret: string
  /** Access token expiration time (default: 1h) */
  accessTokenExpiry: string
  /** Refresh token expiration time (default: 7d) */
  refreshTokenExpiry: string
}

/**
 * Logging configuration
 */
export interface LoggingConfig {
  /** Log level: debug, info, warn, error, silent */
  level: 'debug' | 'info' | 'warn' | 'error' | 'silent'
  /** Log format: json or pretty (default: json in production, pretty in development) */
  format: 'json' | 'pretty'
  /** Enable colored output (default: true in development, false in production) */
  colors: boolean
}

/**
 * Rate limiting configuration
 */
export interface RateLimitConfig {
  /** Enable rate limiting (default: true) */
  enabled: boolean
  /** Time window in milliseconds (default: 60000 = 1 minute) */
  duration: number
  /** Maximum requests per window per IP (default: 100) */
  max: number
}

/**
 * CORS configuration
 */
export interface CorsConfig {
  /** Allow all origins (true) or specify allowed origins */
  origin: boolean | string | string[]
  /** Allow credentials in CORS requests (default: true) */
  credentials: boolean
}

/**
 * Dictionary configuration
 */
export interface DictionaryConfig {
  /** Path to dictionary file (one word per line) */
  path?: string
  /** Use allow-all dictionary for testing (default: false) */
  allowAll: boolean
}

/**
 * Storage configuration
 */
export interface StorageConfig {
  /** Directory for storing game data (default: ./data/games) */
  gamesDir: string
}

/**
 * WebSocket configuration
 */
export interface WebSocketConfig {
  /** Archive delay for inactive games in milliseconds (default: 300000 = 5 minutes) */
  archiveDelayMs: number
}

/**
 * Swagger/API documentation configuration
 */
export interface SwaggerConfig {
  /** Enable Swagger UI (default: true in development, false in production) */
  enabled: boolean
  /** Swagger UI path (default: /swagger) */
  path: string
}

/**
 * Complete application configuration
 */
export interface AppConfig {
  server: ServerConfig
  database: DatabaseConfig
  jwt: JwtConfig
  logging: LoggingConfig
  rateLimit: RateLimitConfig
  cors: CorsConfig
  dictionary: DictionaryConfig
  storage: StorageConfig
  websocket: WebSocketConfig
  swagger: SwaggerConfig
}

/**
 * Default configuration values
 * These can be overridden by environment variables or config files
 */
export const defaultConfig: AppConfig = {
  server: {
    port: 3000,
    host: 'localhost',
    nodeEnv: 'development',
    isProduction: false,
    isDevelopment: true,
  },
  database: {
    url: 'postgresql://balda:balda@localhost:5432/balda',
    maxConnections: 20,
    idleTimeout: 20,
    connectTimeout: 10,
    preparedStatements: true,
  },
  jwt: {
    secret: 'change-me-in-production',
    refreshSecret: 'change-me-refresh-in-production',
    accessTokenExpiry: '1h',
    refreshTokenExpiry: '7d',
  },
  logging: {
    level: 'info',
    format: 'pretty',
    colors: true,
  },
  rateLimit: {
    enabled: true,
    duration: 60000, // 1 minute
    max: 100,
  },
  cors: {
    origin: true,
    credentials: true,
  },
  dictionary: {
    allowAll: false,
  },
  storage: {
    gamesDir: './data/games',
  },
  websocket: {
    archiveDelayMs: 300000, // 5 minutes
  },
  swagger: {
    enabled: true,
    path: '/swagger',
  },
}

/**
 * Validate configuration
 * Throws error if required fields are missing or invalid
 */
export function validateConfig(config: Partial<AppConfig>): void {
  const errors: string[] = []

  // Server validation
  if (config.server?.port && (config.server.port < 1 || config.server.port > 65535)) {
    errors.push('server.port must be between 1 and 65535')
  }

  // Database validation
  if (!config.database?.url) {
    errors.push('database.url is required (set DATABASE_URL environment variable)')
  }

  // JWT validation
  if (config.server?.isProduction) {
    if (config.jwt?.secret === 'change-me-in-production') {
      errors.push('jwt.secret must be changed in production (set JWT_SECRET environment variable)')
    }
    if (config.jwt?.refreshSecret === 'change-me-refresh-in-production') {
      errors.push('jwt.refreshSecret must be changed in production (set JWT_REFRESH_SECRET environment variable)')
    }
  }

  // Rate limit validation
  if (config.rateLimit?.max && config.rateLimit.max < 1) {
    errors.push('rateLimit.max must be greater than 0')
  }

  if (errors.length > 0) {
    throw new Error(`Configuration validation failed:\n${errors.map(e => `  - ${e}`).join('\n')}`)
  }
}
