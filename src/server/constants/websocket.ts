/**
 * WebSocket Constants
 * Configuration for WebSocket communication and game archiving
 */

/**
 * WebSocket connection states
 * Maps to standard WebSocket readyState values
 */
export const WS_STATES = {
  CONNECTING: 0,
  OPEN: 1,
  CLOSING: 2,
  CLOSED: 3,
} as const

/**
 * Archive delay for games with no active clients
 * Games are automatically archived 5 minutes after the last client disconnects
 */
export const ARCHIVE_DELAY_MS = 5 * 60 * 1000 // 5 minutes
