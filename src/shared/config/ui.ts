/**
 * UI/UX Configuration
 * User interface and experience constants
 *
 * Controls timing, animations, performance, and layout:
 * - Animation durations
 * - Cache sizes for performance
 * - Layout dimensions
 * - WebSocket connection settings
 * - AI behavior delays
 */

/**
 * Animation timing configuration
 */
export const ANIMATION_CONFIG = {
  /**
   * Default animation/transition duration
   * Should match Tailwind CSS transition durations
   */
  DURATION_MS: 300,

  /**
   * Opponent move highlight duration
   * How long to show path highlight after opponent moves
   * Currently hardcoded in GameScreen.tsx line 130
   */
  OPPONENT_MOVE_HIGHLIGHT_MS: 2000,

  /**
   * Stagger delay between suggestion cards
   * Creates cascading animation effect
   */
  SUGGESTION_STAGGER_DELAY_MS: 50,

  /**
   * Fade transition duration for screen changes
   */
  SCREEN_FADE_MS: 200,
} as const

/**
 * Performance optimization configuration
 */
export const PERFORMANCE_CONFIG = {
  /**
   * Path-finding cache size
   * LRU cache for memoized path validation
   * Currently in balda.ts line 130
   */
  PATH_CACHE_SIZE: 500,

  /**
   * General memoization cache size
   * For expensive function call results
   * Currently in balda.ts line 21
   */
  MEMOIZATION_CACHE_SIZE: 1000,

  /**
   * Debounce delay for search inputs
   */
  SEARCH_DEBOUNCE_MS: 300,

  /**
   * Throttle delay for resize events
   */
  RESIZE_THROTTLE_MS: 150,
} as const

/**
 * Layout configuration
 */
export const LAYOUT_CONFIG = {
  /**
   * Number of columns in alphabet grid
   * Russian alphabet has 33 letters, arranged in 3 rows of 11
   */
  ALPHABET_GRID_COLUMNS: 11,

  /**
   * Maximum content width for centered layouts
   */
  MAX_CONTENT_WIDTH_PX: 1400,

  /**
   * Sidebar width for game panels
   */
  SIDEBAR_WIDTH_PX: 320,
} as const

/**
 * AI behavior configuration
 */
export const AI_CONFIG = {
  /**
   * Delay before AI makes a move
   * Creates human-like thinking pause
   */
  THINKING_DELAY_MS: 1500,

  /**
   * Minimum delay for AI responses
   * Prevents instant moves that feel unnatural
   */
  MIN_RESPONSE_MS: 800,

  /**
   * Maximum delay for AI responses
   * Prevents frustrating wait times
   */
  MAX_RESPONSE_MS: 3000,
} as const

/**
 * WebSocket configuration
 */
export const WEBSOCKET_CONFIG = {
  /**
   * Delay before attempting reconnection after disconnect
   */
  RECONNECT_DELAY_MS: 3000,

  /**
   * Ping interval to keep connection alive
   */
  PING_INTERVAL_MS: 30000,

  /**
   * Maximum reconnection attempts before giving up
   */
  MAX_RECONNECT_ATTEMPTS: 5,

  /**
   * Timeout for WebSocket connection establishment
   */
  CONNECTION_TIMEOUT_MS: 10000,
} as const

/**
 * Game archiving configuration
 */
export const ARCHIVE_CONFIG = {
  /**
   * Delay before archiving inactive games
   * Games archived 5 minutes after last client disconnects
   * Matches server websocket.ts and schema.ts
   */
  DELAY_MS: 5 * 60 * 1000, // 5 minutes
} as const

/**
 * Toast notification configuration
 */
export const TOAST_CONFIG = {
  /**
   * Default duration for success toasts
   */
  SUCCESS_DURATION_MS: 3000,

  /**
   * Default duration for error toasts
   */
  ERROR_DURATION_MS: 5000,

  /**
   * Default duration for info toasts
   */
  INFO_DURATION_MS: 4000,

  /**
   * Maximum number of concurrent toasts
   */
  MAX_CONCURRENT: 3,
} as const

/**
 * Consolidated UI configuration
 */
export const UI_CONFIG = {
  ANIMATION: ANIMATION_CONFIG,
  PERFORMANCE: PERFORMANCE_CONFIG,
  LAYOUT: LAYOUT_CONFIG,
  AI: AI_CONFIG,
  WEBSOCKET: WEBSOCKET_CONFIG,
  ARCHIVE: ARCHIVE_CONFIG,
  TOAST: TOAST_CONFIG,
} as const

/**
 * WebSocket ready states (maps to standard WebSocket API)
 */
export const WS_STATES = {
  CONNECTING: 0,
  OPEN: 1,
  CLOSING: 2,
  CLOSED: 3,
} as const

export type WebSocketState = (typeof WS_STATES)[keyof typeof WS_STATES]
