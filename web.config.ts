/**
 * Balda Web Frontend Configuration
 *
 * This file defines the default configuration for the Balda web frontend.
 * Values can be overridden by:
 * - Environment variables (highest priority)
 * - .env files
 * - This config file (lowest priority)
 *
 * Configuration is loaded by c12 during the Vite build process and injected
 * into the application.
 */

import type { WebConfig } from './src/shared/config/web/schema'

type DeepPartial<T> = {
  [K in keyof T]?: T[K] extends object ? DeepPartial<T[K]> : T[K]
}

export default {
  // Environment mode (auto-detected from NODE_ENV)
  mode: 'development',

  // API configuration
  api: {
    baseUrl: 'http://localhost:3000', // Override with VITE_API_URL
    timeout: 30000, // 30 seconds
    retryEnabled: true,
    maxRetries: 3,
  },

  // Application configuration
  app: {
    name: 'Balda',
    devMode: true,
    debugMode: false,
  },

  // UI/UX configuration
  ui: {
    theme: 'dark',
    animations: true,
    toastDuration: 3000, // 3 seconds
    autoLoadSuggestions: true,
    showCoordinates: true,
  },

  // Performance configuration
  performance: {
    enableServiceWorker: false, // Enable in production for offline support
    lazyLoading: true,
    searchDebounce: 300, // 300ms
    virtualScrollThreshold: 100, // items
  },

  // Monitoring configuration
  monitoring: {
    enabled: false, // Enable in production
    sampleRate: 1.0, // 100% of errors
    enablePerformance: false,
    performanceSampleRate: 0.1, // 10% of sessions
  },

  // Feature flags
  features: {
    aiPlayers: true,
    multiplayer: true,
    suggestions: true,
    authentication: false, // Future feature
    leaderboards: false, // Future feature
    socialSharing: false, // Future feature
  },

  // Environment-specific overrides
  $development: {
    app: {
      devMode: true,
      debugMode: true,
    },
    api: {
      baseUrl: 'http://localhost:3000',
    },
    monitoring: {
      enabled: false,
    },
  },

  $production: {
    app: {
      devMode: false,
      debugMode: false,
    },
    api: {
      // API URL auto-detected from window.location in production
      // Can be overridden with VITE_API_URL environment variable
      timeout: 60000, // 60 seconds - longer timeout for production
      maxRetries: 5, // More retries in production
    },
    ui: {
      animations: true, // Keep animations in production
    },
    performance: {
      enableServiceWorker: true, // Enable for offline support
      lazyLoading: true,
    },
    monitoring: {
      enabled: true, // Enable error tracking in production
      sampleRate: 1.0,
      enablePerformance: true,
      performanceSampleRate: 0.1,
    },
  },

  $test: {
    app: {
      devMode: false,
      debugMode: false,
    },
    api: {
      baseUrl: 'http://localhost:3001', // Test server
      timeout: 5000, // Faster timeout for tests
      retryEnabled: false, // No retries in tests
    },
    ui: {
      animations: false, // Disable animations in tests
      toastDuration: 100, // Faster toasts in tests
    },
    monitoring: {
      enabled: false,
    },
  },
} satisfies DeepPartial<WebConfig> & {
  $development?: DeepPartial<WebConfig>
  $production?: DeepPartial<WebConfig>
  $test?: DeepPartial<WebConfig>
}
