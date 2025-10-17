/**
 * Timing Constants
 * Shared timing and duration constants
 *
 * Centralizes timing-related constants used across client and server:
 * - Animation durations
 * - AI behavior delays
 * - WebSocket intervals
 * - Toast display times
 *
 * These are SHARED constants - environment-specific timing configs
 * should be in server/config or web/config respectively.
 */

/**
 * Animation timing configuration
 * Shared durations for consistent UI animations
 */
export const ANIMATION_TIMING = {
  /**
   * Default transition duration (matches Tailwind defaults)
   */
  TRANSITION_MS: 300,

  /**
   * Opponent move highlight duration
   * How long to show path highlight after opponent moves
   */
  OPPONENT_MOVE_HIGHLIGHT_MS: 2000,

  /**
   * Stagger delay between suggestion cards
   * Creates cascading animation effect
   */
  SUGGESTION_STAGGER_MS: 50,

  /**
   * Fade transition for screen changes
   */
  SCREEN_FADE_MS: 200,
} as const

/**
 * AI behavior timing
 * Delays to make AI feel natural (not instant)
 */
export const AI_TIMING = {
  /**
   * Base thinking delay before AI makes a move
   * Creates human-like pause
   */
  THINKING_DELAY_MS: 1500,

  /**
   * Minimum response delay
   * Prevents instant moves that feel unnatural
   */
  MIN_RESPONSE_MS: 800,

  /**
   * Maximum response delay
   * Prevents frustrating wait times
   */
  MAX_RESPONSE_MS: 3000,
} as const

/**
 * WebSocket timing configuration
 * Shared between client and server WebSocket implementations
 */
export const WEBSOCKET_TIMING = {
  /**
   * Ping/keep-alive interval
   * Keeps connection alive and detects disconnects
   */
  PING_INTERVAL_MS: 30000, // 30 seconds

  /**
   * Reconnect delay after disconnect (client-side)
   * Time to wait before attempting reconnection
   */
  RECONNECT_DELAY_MS: 3000, // 3 seconds

  /**
   * Connection timeout
   * Maximum time to wait for connection establishment
   */
  CONNECTION_TIMEOUT_MS: 10000, // 10 seconds

  /**
   * Maximum reconnect attempts (client-side)
   * Give up after this many failed reconnections
   */
  MAX_RECONNECT_ATTEMPTS: 5,

  /**
   * Archive delay for inactive games
   * Games archived after this much inactivity
   */
  ARCHIVE_DELAY_MS: 5 * 60 * 1000, // 5 minutes
} as const

/**
 * Toast notification timing
 * Display durations for different toast types
 */
export const TOAST_TIMING = {
  /**
   * Success toast display duration
   */
  SUCCESS_MS: 3000,

  /**
   * Error toast display duration (longer for user to read)
   */
  ERROR_MS: 5000,

  /**
   * Info toast display duration
   */
  INFO_MS: 4000,

  /**
   * Maximum concurrent toasts
   */
  MAX_CONCURRENT: 3,
} as const

/**
 * Performance optimization timing
 * Debounce/throttle delays
 */
export const PERFORMANCE_TIMING = {
  /**
   * Debounce delay for search inputs
   * Prevents excessive API calls while typing
   */
  SEARCH_DEBOUNCE_MS: 300,

  /**
   * Throttle delay for window resize events
   * Prevents excessive reflows/repaints
   */
  RESIZE_THROTTLE_MS: 150,
} as const

/**
 * Consolidated timing configuration
 * Single import for all timing constants
 */
export const TIMING = {
  ANIMATION: ANIMATION_TIMING,
  AI: AI_TIMING,
  WEBSOCKET: WEBSOCKET_TIMING,
  TOAST: TOAST_TIMING,
  PERFORMANCE: PERFORMANCE_TIMING,
} as const
