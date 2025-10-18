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
  /** Request timeout in milliseconds (default: 30000 = 30s) */
  requestTimeout: number
  /** Request body size limit in bytes (default: 10485760 = 10MB) */
  bodyLimit: number
  /** Graceful shutdown timeout in milliseconds (default: 10000 = 10s) */
  shutdownTimeout: number
  /** Trust proxy headers (X-Forwarded-*) - set to true behind reverse proxy (default: false) */
  trustProxy: boolean
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
  /** Maximum concurrent WebSocket connections per server instance (default: 1000) */
  maxConnections: number
  /** Keep-alive ping interval in milliseconds (default: 30000 = 30 seconds) */
  pingInterval: number
  /** Timeout waiting for pong response in milliseconds (default: 10000 = 10 seconds) */
  pongTimeout: number
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
 * Security headers configuration
 * Production-ready HTTP security headers for OWASP compliance
 */
export interface SecurityConfig {
  /** Enable security headers (default: true in production) */
  enabled: boolean
  /** Enable HSTS (HTTP Strict Transport Security) */
  hsts: {
    enabled: boolean
    maxAge: number // seconds, default: 31536000 (1 year)
    includeSubDomains: boolean
    preload: boolean
  }
  /** Content Security Policy directives */
  csp: {
    enabled: boolean
    directives: Record<string, string | string[]>
  }
  /** X-Frame-Options header (default: DENY) */
  frameOptions: 'DENY' | 'SAMEORIGIN' | string
  /** X-Content-Type-Options (default: nosniff) */
  contentTypeOptions: boolean
  /** X-XSS-Protection (default: 1; mode=block) */
  xssProtection: boolean
}

/**
 * Compression configuration
 * Response compression for better performance
 */
export interface CompressionConfig {
  /** Enable compression (default: true) */
  enabled: boolean
  /** Compression level 0-9 (default: 6) */
  level: number
  /** Minimum response size to compress in bytes (default: 1024) */
  threshold: number
  /** Algorithms to use (default: ['gzip', 'br']) */
  algorithms: ('gzip' | 'br' | 'deflate')[]
}

/**
 * Health check configuration
 * Endpoint for monitoring and load balancer health checks
 */
export interface HealthCheckConfig {
  /** Enable health check endpoint (default: true) */
  enabled: boolean
  /** Health check endpoint path (default: /health) */
  path: string
  /** Health check timeout in milliseconds (default: 5000) */
  timeout: number
  /** Include detailed system info in response (default: false in production) */
  detailed: boolean
}

/**
 * Monitoring and APM configuration
 * Application Performance Monitoring and metrics
 */
export interface MonitoringConfig {
  /** Enable monitoring (default: true in production) */
  enabled: boolean
  /** Sentry DSN for error tracking */
  sentryDsn?: string
  /** Sentry environment name (default: NODE_ENV) */
  sentryEnvironment?: string
  /** Sentry sample rate 0.0-1.0 (default: 1.0 = 100%) */
  sentrySampleRate: number
  /** Enable Prometheus metrics (default: false) */
  prometheusEnabled: boolean
  /** Prometheus metrics path (default: /metrics) */
  prometheusPath: string
  /** Enable request correlation IDs (default: true) */
  correlationEnabled: boolean
}

/**
 * Cache configuration
 * Redis-based caching for performance
 */
export interface CacheConfig {
  /** Enable caching (default: false) */
  enabled: boolean
  /** Redis connection URL */
  redisUrl?: string
  /** Redis key prefix (default: 'balda:') */
  keyPrefix: string
  /** Default TTL in seconds (default: 3600 = 1 hour) */
  defaultTtl: number
  /** Max memory policy (default: allkeys-lru) */
  maxMemoryPolicy: string
}

/**
 * Letter normalization configuration
 * Controls how letters are normalized during gameplay
 */
export interface LetterNormalizationConfig {
  /** Normalize Ё to Е (default: false) */
  normalizeYoToE: boolean
  /** Normalize Е to Ё (default: false) */
  normalizeEToYo: boolean
}

/**
 * Game-specific configuration
 * Core game rules and limits
 */
export interface GameConfig {
  /** Allowed board sizes (default: [3, 4, 5, 6, 7]) */
  allowedBoardSizes: number[]
  /** Default board size (default: 5) */
  defaultBoardSize: number
  /** Turn timeout in seconds, 0 = no limit (default: 0) */
  turnTimeout: number
  /** Maximum concurrent games per user (default: 10) */
  maxConcurrentGames: number
  /** Auto-archive inactive games after N hours (default: 24) */
  autoArchiveAfterHours: number
  /** Maximum players per game (default: 4) */
  maxPlayers: number
  /** Letter normalization settings */
  letterNormalization: LetterNormalizationConfig
}

/**
 * AI player configuration
 * AI difficulty and behavior settings
 */
export interface AIConfig {
  /** AI thinking delay in milliseconds (default: 1500) */
  thinkingDelay: number
  /** AI difficulty level (default: 'medium') */
  difficulty: 'easy' | 'medium' | 'hard'
  /** Maximum suggestions to consider (default: 100) */
  maxSuggestions: number
  /** Use random moves occasionally for 'easy' difficulty (default: true) */
  randomizeEasy: boolean
}

/**
 * Feature flags configuration
 * Toggle features on/off without code changes
 */
export interface FeatureFlagsConfig {
  /** Enable AI players (default: true) */
  aiPlayers: boolean
  /** Enable multiplayer mode (default: true) */
  multiplayer: boolean
  /** Enable game suggestions (default: true) */
  suggestions: boolean
  /** Enable user authentication (default: false, future feature) */
  authentication: boolean
  /** Enable leaderboards (default: false, future feature) */
  leaderboards: boolean
}

/**
 * Maintenance mode configuration
 * Gracefully handle maintenance windows
 */
export interface MaintenanceConfig {
  /** Enable maintenance mode (default: false) */
  enabled: boolean
  /** Maintenance message to display */
  message: string
  /** IP addresses allowed during maintenance (default: []) */
  allowedIps: string[]
  /** Estimated completion time (ISO 8601 datetime) */
  estimatedEnd?: string
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
  security: SecurityConfig
  compression: CompressionConfig
  healthCheck: HealthCheckConfig
  monitoring: MonitoringConfig
  cache: CacheConfig
  game: GameConfig
  ai: AIConfig
  featureFlags: FeatureFlagsConfig
  maintenance: MaintenanceConfig
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
    requestTimeout: 30000, // 30 seconds
    bodyLimit: 10485760, // 10 MB
    shutdownTimeout: 10000, // 10 seconds
    trustProxy: false,
  },
  database: {
    url: 'postgresql://balda:balda@postgres:5432/balda',
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
    maxConnections: 1000,
    pingInterval: 30000, // 30 seconds
    pongTimeout: 10000, // 10 seconds
  },
  swagger: {
    enabled: true,
    path: '/swagger',
  },
  security: {
    enabled: false, // Enable in production
    hsts: {
      enabled: true,
      maxAge: 31536000, // 1 year
      includeSubDomains: true,
      preload: true,
    },
    csp: {
      enabled: true,
      directives: {
        'default-src': ['\'self\''],
        'script-src': ['\'self\'', '\'unsafe-inline\''],
        'style-src': ['\'self\'', '\'unsafe-inline\''],
        'img-src': ['\'self\'', 'data:', 'https:'],
        'connect-src': ['\'self\''],
        'font-src': ['\'self\''],
        'object-src': ['\'none\''],
        'base-uri': ['\'self\''],
        'form-action': ['\'self\''],
        'frame-ancestors': ['\'none\''],
        'upgrade-insecure-requests': [],
      },
    },
    frameOptions: 'DENY',
    contentTypeOptions: true,
    xssProtection: true,
  },
  compression: {
    enabled: true,
    level: 6,
    threshold: 1024, // 1 KB
    algorithms: ['gzip', 'br'],
  },
  healthCheck: {
    enabled: true,
    path: '/health',
    timeout: 5000, // 5 seconds
    detailed: false,
  },
  monitoring: {
    enabled: false,
    sentrySampleRate: 1.0, // 100%
    prometheusEnabled: false,
    prometheusPath: '/metrics',
    correlationEnabled: true,
  },
  cache: {
    enabled: false,
    keyPrefix: 'balda:',
    defaultTtl: 3600, // 1 hour
    maxMemoryPolicy: 'allkeys-lru',
  },
  game: {
    allowedBoardSizes: [3, 4, 5, 6, 7],
    defaultBoardSize: 5,
    turnTimeout: 0, // No limit
    maxConcurrentGames: 10,
    autoArchiveAfterHours: 24,
    maxPlayers: 4,
    letterNormalization: {
      normalizeYoToE: false, // Don't normalize Ё to Е by default
      normalizeEToYo: false, // Don't normalize Е to Ё by default
    },
  },
  ai: {
    thinkingDelay: 1500, // 1.5 seconds
    difficulty: 'medium',
    maxSuggestions: 100,
    randomizeEasy: true,
  },
  featureFlags: {
    aiPlayers: true,
    multiplayer: true,
    suggestions: true,
    authentication: false, // Future feature
    leaderboards: false, // Future feature
  },
  maintenance: {
    enabled: false,
    message: 'System is under maintenance. Please try again later.',
    allowedIps: [],
  },
}

/**
 * Validate configuration
 * Throws error if required fields are missing or invalid
 */
export function validateConfig(config: Partial<AppConfig>): void {
  const errors: string[] = []
  const warnings: string[] = []
  const isProduction = config.server?.isProduction

  // ============================================
  // Server validation
  // ============================================
  if (config.server?.port && (config.server.port < 1 || config.server.port > 65535)) {
    errors.push('server.port must be between 1 and 65535')
  }
  if (config.server?.requestTimeout && config.server.requestTimeout < 1000) {
    warnings.push('server.requestTimeout is less than 1000ms - may cause premature timeouts')
  }
  if (config.server?.bodyLimit && config.server.bodyLimit < 1024) {
    errors.push('server.bodyLimit must be at least 1024 bytes (1 KB)')
  }
  if (config.server?.bodyLimit && config.server.bodyLimit > 104857600) {
    warnings.push('server.bodyLimit is greater than 100MB - may cause memory issues')
  }

  // ============================================
  // Database validation
  // ============================================
  if (!config.database?.url) {
    errors.push('database.url is required (set DATABASE_URL environment variable)')
  }
  else if (!config.database.url.startsWith('postgresql://') && !config.database.url.startsWith('postgres://')) {
    errors.push('database.url must be a valid PostgreSQL connection string (postgresql://...)')
  }
  if (config.database?.maxConnections && config.database.maxConnections < 1) {
    errors.push('database.maxConnections must be at least 1')
  }

  // ============================================
  // JWT validation
  // ============================================
  if (isProduction) {
    if (config.jwt?.secret === 'change-me-in-production') {
      errors.push('jwt.secret must be changed in production (set JWT_SECRET environment variable, generate with: openssl rand -base64 32)')
    }
    if (config.jwt?.refreshSecret === 'change-me-refresh-in-production') {
      errors.push('jwt.refreshSecret must be changed in production (set JWT_REFRESH_SECRET environment variable)')
    }
    if (config.jwt?.secret && config.jwt.secret.length < 32) {
      warnings.push('jwt.secret should be at least 32 characters for security')
    }
    if (config.jwt?.refreshSecret && config.jwt.refreshSecret.length < 32) {
      warnings.push('jwt.refreshSecret should be at least 32 characters for security')
    }
  }

  // ============================================
  // Rate limit validation
  // ============================================
  if (config.rateLimit?.max && config.rateLimit.max < 1) {
    errors.push('rateLimit.max must be greater than 0')
  }
  if (config.rateLimit?.duration && config.rateLimit.duration < 1000) {
    warnings.push('rateLimit.duration is less than 1000ms - may be too aggressive')
  }

  // ============================================
  // Security validation
  // ============================================
  if (isProduction && !config.security?.enabled) {
    warnings.push('security headers are disabled in production - enable for OWASP compliance')
  }
  if (config.security?.hsts?.maxAge && config.security.hsts.maxAge < 86400) {
    warnings.push('security.hsts.maxAge is less than 1 day - OWASP recommends at least 1 year (31536000)')
  }

  // ============================================
  // Compression validation
  // ============================================
  if (config.compression?.level && (config.compression.level < 0 || config.compression.level > 9)) {
    errors.push('compression.level must be between 0 and 9')
  }

  // ============================================
  // Monitoring validation
  // ============================================
  if (config.monitoring?.sentryDsn && !config.monitoring.sentryDsn.startsWith('https://')) {
    errors.push('monitoring.sentryDsn must be a valid HTTPS URL')
  }
  if (config.monitoring?.sentrySampleRate && (config.monitoring.sentrySampleRate < 0 || config.monitoring.sentrySampleRate > 1)) {
    errors.push('monitoring.sentrySampleRate must be between 0.0 and 1.0')
  }
  if (isProduction && !config.monitoring?.enabled && !config.monitoring?.sentryDsn) {
    warnings.push('monitoring is disabled in production - consider enabling Sentry for error tracking')
  }

  // ============================================
  // Cache validation
  // ============================================
  if (config.cache?.enabled && !config.cache?.redisUrl) {
    errors.push('cache.redisUrl is required when cache is enabled (set REDIS_URL environment variable)')
  }
  if (config.cache?.redisUrl && !config.cache.redisUrl.startsWith('redis://') && !config.cache.redisUrl.startsWith('rediss://')) {
    errors.push('cache.redisUrl must be a valid Redis connection string (redis://...)')
  }
  if (config.cache?.defaultTtl && config.cache.defaultTtl < 1) {
    errors.push('cache.defaultTtl must be at least 1 second')
  }

  // ============================================
  // Game configuration validation
  // ============================================
  if (config.game?.allowedBoardSizes && config.game.allowedBoardSizes.length === 0) {
    errors.push('game.allowedBoardSizes must include at least one board size')
  }
  if (config.game?.defaultBoardSize && config.game.allowedBoardSizes && !config.game.allowedBoardSizes.includes(config.game.defaultBoardSize)) {
    errors.push('game.defaultBoardSize must be one of the allowedBoardSizes')
  }
  if (config.game?.maxConcurrentGames && config.game.maxConcurrentGames < 1) {
    errors.push('game.maxConcurrentGames must be at least 1')
  }
  if (config.game?.maxPlayers && (config.game.maxPlayers < 2 || config.game.maxPlayers > 10)) {
    errors.push('game.maxPlayers must be between 2 and 10')
  }

  // ============================================
  // AI configuration validation
  // ============================================
  if (config.ai?.thinkingDelay && config.ai.thinkingDelay < 0) {
    errors.push('ai.thinkingDelay must be non-negative')
  }
  if (config.ai?.maxSuggestions && config.ai.maxSuggestions < 1) {
    errors.push('ai.maxSuggestions must be at least 1')
  }

  // ============================================
  // Maintenance mode validation
  // ============================================
  if (config.maintenance?.enabled && !config.maintenance?.message) {
    warnings.push('maintenance mode is enabled but no message is set')
  }

  // ============================================
  // Cross-field validation
  // ============================================
  if (config.server?.trustProxy && isProduction && config.cors?.origin === true) {
    warnings.push('CORS is set to allow all origins in production with trustProxy enabled - this may be a security risk')
  }

  // Throw errors if any validation failed
  if (errors.length > 0) {
    const errorMsg = `Configuration validation failed:\n${errors.map(e => `  ❌ ${e}`).join('\n')}`
    throw new Error(errorMsg)
  }

  // Log warnings (non-fatal)
  if (warnings.length > 0) {
    console.warn(`\n⚠️  Configuration warnings:\n${warnings.map(w => `  - ${w}`).join('\n')}\n`)
  }
}
