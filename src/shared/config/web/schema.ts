/**
 * Web Frontend Configuration Schema
 * Type-safe configuration for the Balda web frontend
 *
 * This schema is loaded by c12 during the Vite build process and injected
 * into the application at build time.
 */

/**
 * API configuration
 */
export interface ApiConfig {
  /** Backend API base URL (default: auto-detected) */
  baseUrl: string
  /** WebSocket base URL (default: derived from apiBaseUrl) */
  wsBaseUrl: string
  /** Request timeout in milliseconds (default: 30000 = 30s) */
  timeout: number
  /** Retry failed requests (default: true) */
  retryEnabled: boolean
  /** Maximum retry attempts (default: 3) */
  maxRetries: number
}

/**
 * Application behavior configuration
 */
export interface AppConfig {
  /** Application name (default: 'Balda') */
  name: string
  /** Application version (from package.json) */
  version: string
  /** Enable development features (default: false in production) */
  devMode: boolean
  /** Enable debug logging (default: false in production) */
  debugMode: boolean
}

/**
 * UI/UX configuration
 */
export interface UiConfig {
  /** Default theme (default: 'dark') */
  theme: 'light' | 'dark'
  /** Enable animations (default: true) */
  animations: boolean
  /** Toast notification duration in milliseconds (default: 3000) */
  toastDuration: number
  /** AI suggestion auto-load (default: true) */
  autoLoadSuggestions: boolean
  /** Show coordinates on board (default: true) */
  showCoordinates: boolean
}

/**
 * Performance configuration
 */
export interface PerformanceConfig {
  /** Enable service worker (default: false) */
  enableServiceWorker: boolean
  /** Lazy load components (default: true) */
  lazyLoading: boolean
  /** Debounce search input in milliseconds (default: 300) */
  searchDebounce: number
  /** Virtual scrolling threshold (default: 100 items) */
  virtualScrollThreshold: number
}

/**
 * Monitoring configuration
 */
export interface MonitoringConfig {
  /** Enable error tracking (default: false) */
  enabled: boolean
  /** Sentry DSN for frontend error tracking */
  sentryDsn?: string
  /** Sentry environment name (default: production/development) */
  sentryEnvironment?: string
  /** Sample rate for error tracking 0.0-1.0 (default: 1.0) */
  sampleRate: number
  /** Enable performance monitoring (default: false) */
  enablePerformance: boolean
  /** Performance sample rate 0.0-1.0 (default: 0.1) */
  performanceSampleRate: number
}

/**
 * Feature flags for A/B testing and gradual rollouts
 */
export interface FeatureFlagsConfig {
  /** Enable AI players (default: true) */
  aiPlayers: boolean
  /** Enable multiplayer mode (default: true) */
  multiplayer: boolean
  /** Enable game suggestions (default: true) */
  suggestions: boolean
  /** Enable user authentication (default: false, future) */
  authentication: boolean
  /** Enable leaderboards (default: false, future) */
  leaderboards: boolean
  /** Enable social sharing (default: false, future) */
  socialSharing: boolean
}

/**
 * Complete web frontend configuration
 */
export interface WebConfig {
  /** Environment mode */
  mode: 'development' | 'production' | 'test'
  /** API configuration */
  api: ApiConfig
  /** Application configuration */
  app: AppConfig
  /** UI/UX configuration */
  ui: UiConfig
  /** Performance configuration */
  performance: PerformanceConfig
  /** Monitoring configuration */
  monitoring: MonitoringConfig
  /** Feature flags */
  features: FeatureFlagsConfig
}

/**
 * Default frontend configuration values
 */
export const defaultWebConfig: WebConfig = {
  mode: 'development',
  api: {
    baseUrl: 'http://localhost:3000',
    wsBaseUrl: 'ws://localhost:3000',
    timeout: 30000,
    retryEnabled: true,
    maxRetries: 3,
  },
  app: {
    name: 'Balda',
    version: '1.0.0',
    devMode: false,
    debugMode: false,
  },
  ui: {
    theme: 'dark',
    animations: true,
    toastDuration: 3000,
    autoLoadSuggestions: true,
    showCoordinates: true,
  },
  performance: {
    enableServiceWorker: false,
    lazyLoading: true,
    searchDebounce: 300,
    virtualScrollThreshold: 100,
  },
  monitoring: {
    enabled: false,
    sampleRate: 1.0,
    enablePerformance: false,
    performanceSampleRate: 0.1,
  },
  features: {
    aiPlayers: true,
    multiplayer: true,
    suggestions: true,
    authentication: false,
    leaderboards: false,
    socialSharing: false,
  },
}
