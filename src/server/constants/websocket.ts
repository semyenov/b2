/**
 * WebSocket Constants
 * Configuration for WebSocket communication and game archiving
 */

import { UI_CONFIG } from '../../shared/config'

/**
 * WebSocket connection states
 * Maps to standard WebSocket readyState values
 * These are standard constants, not configuration
 */
export const WS_STATES = {
  CONNECTING: 0,
  OPEN: 1,
  CLOSING: 2,
  CLOSED: 3,
} as const

/**
 * Archive delay for games with no active clients
 * Re-exported from shared config
 */
export const ARCHIVE_DELAY_MS = UI_CONFIG.ARCHIVE.DELAY_MS
