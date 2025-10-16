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

import type { AppConfig } from './src/server/config/schema'

export default {
  // Server configuration
  server: {
    port: 3000,
    host: 'localhost',
    nodeEnv: 'development',
    isProduction: false,
    isDevelopment: true,
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
    origin: true, // Allow all origins (set to specific domains in production)
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
    archiveDelayMs: 300000, // 5 minutes
  },

  // API documentation (Swagger)
  swagger: {
    enabled: true, // Disable in production
    path: '/swagger',
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
  },

  $production: {
    logging: {
      level: 'info',
      format: 'json',
      colors: false,
    },
    swagger: {
      enabled: false, // Disable Swagger in production
    },
    rateLimit: {
      enabled: true,
      max: 100, // Stricter rate limiting in production
    },
  },

  $test: {
    server: {
      port: 3001, // Use different port for tests
    },
    logging: {
      level: 'silent', // Quiet logs during tests
    },
    dictionary: {
      allowAll: true, // Allow any word in tests
    },
  },
} satisfies Partial<AppConfig> & {
  $development?: Partial<AppConfig>
  $production?: Partial<AppConfig>
  $test?: Partial<AppConfig>
}
