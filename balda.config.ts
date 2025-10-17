/**
 * Balda Application Configuration
 *
 * This file defines the default configuration for the Balda game server.
 * Values can be overridden by:
 * - Environment variables (highest priority)
 * - .env files
 * - This config file (lowest priority)
 *
 * For production deployments, always use environment variables for sensitive data
 * like JWT secrets and database credentials.
 */

import type { AppConfig } from './src/shared/config/server/schema'

type DeepPartial<T> = {
  [K in keyof T]?: T[K] extends object ? DeepPartial<T[K]> : T[K]
}

export default {
  // Server configuration
  server: {
    port: 3000,
    host: 'localhost',
    nodeEnv: 'development',
    isProduction: false,
    isDevelopment: true,
    requestTimeout: 30000, // 30 seconds
    bodyLimit: 10485760, // 10 MB
    shutdownTimeout: 10000, // 10 seconds - time to wait for connections to close
    trustProxy: false, // Enable if behind Nginx/HAProxy reverse proxy
  },

  // Database configuration
  database: {
    url: 'postgresql://balda:balda@localhost:5432/balda',
    maxConnections: 20,
    idleTimeout: 20, // seconds
    connectTimeout: 10, // seconds
    preparedStatements: true,
  },

  // JWT authentication
  jwt: {
    secret: 'change-me-in-production',
    refreshSecret: 'change-me-refresh-in-production',
    accessTokenExpiry: '1h',
    refreshTokenExpiry: '7d',
  },

  // Logging configuration
  logging: {
    level: 'debug', // debug, info, warn, error, silent
    format: 'pretty', // json or pretty
    colors: true,
  },

  // Rate limiting
  rateLimit: {
    enabled: true,
    duration: 60000, // 1 minute in milliseconds
    max: 100, // max requests per duration per IP
  },

  // CORS configuration
  cors: {
    origin: true, // Allow all origins in development (override in production with specific domains)
    credentials: true,
  },

  // Dictionary configuration
  dictionary: {
    // path: './dictionaries/russian.txt', // Uncomment and set path to dictionary file
    allowAll: false, // Set to true to allow any word (testing only)
  },

  // Storage configuration
  storage: {
    gamesDir: './data/games',
  },

  // WebSocket configuration
  websocket: {
    archiveDelayMs: 300000, // 5 minutes - delay before archiving inactive game connections
    maxConnections: 1000, // Maximum concurrent WebSocket connections (per server instance)
    pingInterval: 30000, // 30 seconds - keep-alive ping interval
    pongTimeout: 10000, // 10 seconds - timeout waiting for pong response
  },

  // API documentation (Swagger)
  swagger: {
    enabled: true, // Disable in production
    path: '/swagger',
  },

  // ============================================================================
  // Security & Production Features
  // ============================================================================

  // Security headers (OWASP compliance)
  security: {
    enabled: false, // Enable in production for OWASP compliance
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

  // Response compression
  compression: {
    enabled: true,
    level: 6, // 0-9, higher = better compression but slower
    threshold: 1024, // Only compress responses larger than 1KB
    algorithms: ['gzip', 'br'], // Brotli is more efficient than gzip
  },

  // Health check endpoint
  healthCheck: {
    enabled: true,
    path: '/health',
    timeout: 5000, // 5 seconds
    detailed: false, // Set to true in development to see system metrics
  },

  // Monitoring & APM (Application Performance Monitoring)
  monitoring: {
    enabled: false, // Enable in production
    // sentryDsn: 'https://your-sentry-dsn@sentry.io/project-id', // Set via env var
    // sentryEnvironment: 'production', // Auto-detected from NODE_ENV
    sentrySampleRate: 1.0, // 100% of errors sent to Sentry
    prometheusEnabled: false, // Set to true to expose /metrics endpoint
    prometheusPath: '/metrics',
    correlationEnabled: true, // Add correlation IDs to requests
  },

  // Caching (Redis)
  cache: {
    enabled: false, // Enable for better performance with Redis
    // redisUrl: 'redis://localhost:6379', // Set via env var
    keyPrefix: 'balda:',
    defaultTtl: 3600, // 1 hour
    maxMemoryPolicy: 'allkeys-lru',
  },

  // ============================================================================
  // Game-Specific Configuration
  // ============================================================================

  // Game rules and limits
  game: {
    allowedBoardSizes: [3, 4, 5, 6, 7],
    defaultBoardSize: 5,
    turnTimeout: 0, // 0 = no limit, set to N seconds for timed games
    maxConcurrentGames: 10, // Per user (prevents abuse)
    autoArchiveAfterHours: 24, // Archive inactive games after 24 hours
    maxPlayers: 4,
  },

  // AI player configuration
  ai: {
    thinkingDelay: 1500, // 1.5 seconds - feels more natural
    difficulty: 'medium', // 'easy', 'medium', or 'hard'
    maxSuggestions: 100,
    randomizeEasy: true, // Easy difficulty makes occasional suboptimal moves
  },

  // Feature flags (toggle features without code changes)
  featureFlags: {
    aiPlayers: true,
    multiplayer: true,
    suggestions: true,
    authentication: false, // Future: user accounts
    leaderboards: false, // Future: global leaderboards
  },

  // Maintenance mode
  maintenance: {
    enabled: false, // Set to true to enable maintenance mode
    message: 'The game is currently under maintenance. Please try again in a few minutes.',
    allowedIps: [], // IPs that can access during maintenance (e.g., ['127.0.0.1'])
    // estimatedEnd: '2025-10-18T12:00:00Z', // ISO 8601 datetime
  },

  // Environment-specific overrides
  // These are applied based on NODE_ENV
  $development: {
    logging: {
      level: 'debug',
      format: 'pretty',
      colors: true,
    },
    swagger: {
      enabled: true,
    },
    healthCheck: {
      detailed: true, // Show detailed system info in development
    },
    security: {
      enabled: false, // Disabled in development for easier debugging
    },
    monitoring: {
      enabled: false, // Typically disabled in local development
    },
  },

  $production: {
    server: {
      trustProxy: true, // Enable when behind reverse proxy (Nginx, HAProxy, Caddy, etc.)
      requestTimeout: 60000, // 60 seconds - longer timeout for production
    },
    logging: {
      level: 'info', // Only log important information in production
      format: 'json', // Structured logging for log aggregation (ELK, Datadog, etc.)
      colors: false, // No ANSI colors in production logs
    },
    swagger: {
      enabled: false, // Disable Swagger in production for security
    },
    rateLimit: {
      enabled: true,
      max: 200, // Higher limit for production traffic
      duration: 60000, // 1 minute window
    },
    cors: {
      // IMPORTANT: Set specific origins in production for security
      // Example: origin: ['https://balda.example.com', 'https://www.balda.example.com']
      origin: true, // Override with specific domains via CORS_ORIGIN env var
    },
    security: {
      enabled: true, // Enable all security headers in production
    },
    healthCheck: {
      detailed: false, // Hide detailed system metrics in production
    },
    monitoring: {
      enabled: true, // Enable error tracking and metrics in production
      sentrySampleRate: 1.0, // Send all errors to Sentry (adjust if high volume)
    },
    compression: {
      enabled: true,
      level: 6, // Good balance between speed and compression ratio
    },
    websocket: {
      maxConnections: 2000, // Higher limit for production (adjust based on server capacity)
      pingInterval: 45000, // 45 seconds - slightly longer interval for production
    },
    game: {
      maxConcurrentGames: 20, // Higher limit per user in production
      autoArchiveAfterHours: 48, // Keep games longer in production (2 days)
    },
  },

  $test: {
    server: {
      port: 3001, // Use different port for tests
      requestTimeout: 5000, // Shorter timeout for faster test failures
    },
    logging: {
      level: 'silent', // Quiet logs during tests
    },
    dictionary: {
      allowAll: true, // Allow any word in tests
    },
    healthCheck: {
      enabled: false, // Not needed in tests
    },
    security: {
      enabled: false, // Disabled for test simplicity
    },
    monitoring: {
      enabled: false, // No monitoring in tests
    },
    compression: {
      enabled: false, // Faster tests without compression
    },
  },
} satisfies DeepPartial<AppConfig> & {
  $development?: DeepPartial<AppConfig>
  $production?: DeepPartial<AppConfig>
  $test?: DeepPartial<AppConfig>
}
