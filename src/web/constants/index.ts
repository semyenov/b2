/**
 * Constants - Application configuration and constants
 *
 * Centralized exports for all constant values and configuration
 * Organized by domain: game config, status, accessibility, alphabet, messages
 */

// Game Configuration
export {
  A11Y_LABELS,
  BOARD_SIZES,
  GAME_CONFIG,
  RUSSIAN_ALPHABET,
} from './game'

// Status Configuration (single source of truth)
export {
  STATUS_CONFIG,
} from './statusConfig'

export type { GameStatus, StatusConfig } from './statusConfig'

// Messages and Localization
export {
  ERROR_MESSAGES,
  ERROR_MESSAGE_MAP,
  LOADING_MESSAGES,
  SUCCESS_MESSAGES,
  translateErrorMessage,
} from './messages'
