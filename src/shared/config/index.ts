/**
 * Shared Configuration - Main Export
 * Centralized configuration for the Balda game
 *
 * This module provides a single import point for all game configuration:
 * - Game rules and mechanics
 * - Scoring system
 * - Suggestions engine
 * - Validation rules
 * - UI/UX constants
 * - Internationalization (i18n)
 *
 * @example
 * ```typescript
 * import { GAME_RULES, SCORING_CONFIG, messages } from '@shared/config'
 *
 * const boardSize = GAME_RULES.BOARD.DEFAULT_SIZE // 5
 * const scoreFor_A = SCORING_CONFIG.LETTER_SCORES['А'] // 1
 * const errorMsg = messages.errors.GENERIC_ERROR // 'Произошла ошибка'
 * ```
 */

// ============================================
// Core Game Configuration
// ============================================

export {
  ALPHABET_CONFIG,
  BOARD_CONFIG,
  GAME_RULES,
  ORTHOGONAL_DIRS,
  PLAYER_CONFIG,
  TURN_CONFIG,
  WORD_CONFIG,
} from './game-rules'
export type { BoardPosition, BoardSize } from './game-rules'

// ============================================
// Scoring System
// ============================================

export {
  DEFAULT_LOCALE,
  ERROR_MESSAGE_MAP,
  formatTimeAgo,
  getMessages,
  getRussianPlural,
  messages,
  ru,
  translateError,
} from './i18n'

// ============================================
// Suggestions Engine
// ============================================

export type { Locale, LocaleCode } from './i18n'
export {
  calculateWordScore,
  DEFAULT_LETTER_SCORE,
  getLettersByScore,
  getLetterScore,
  getScoreDistribution,
  LETTER_SCORES,
  SCORING_CONFIG,
  SCORING_METADATA,
} from './scoring'

// ============================================
// Validation Rules
// ============================================

export {
  getScoreTier,
  SCORE_THRESHOLDS,
  SUGGESTION_LIMITS,
  SUGGESTIONS_CONFIG,
  TIER_CONFIG,
} from './suggestions'

// ============================================
// UI/UX Configuration
// ============================================

export type { ScoreTier, TierConfig } from './suggestions'
export {
  AI_CONFIG,
  ANIMATION_CONFIG,
  ARCHIVE_CONFIG,
  LAYOUT_CONFIG,
  PERFORMANCE_CONFIG,
  TOAST_CONFIG,
  UI_CONFIG,
  WEBSOCKET_CONFIG,
  WS_STATES,
} from './ui'

// ============================================
// Internationalization (i18n)
// ============================================

export type { WebSocketState } from './ui'
export {
  BASE_WORD_VALIDATION,
  EMAIL_VALIDATION,
  GAME_ID_VALIDATION,
  isValidBaseWord,
  isValidEmail,
  isValidGameId,
  isValidPlayerName,
  MOVE_VALIDATION,
  PASSWORD_VALIDATION,
  PLAYER_NAME_VALIDATION,
  USERNAME_VALIDATION,
  VALIDATION_RULES,
} from './validation'

// ============================================
// Convenience Re-exports
// ============================================

/**
 * All configuration grouped by category
 * Use this for organized imports when you need multiple configs
 *
 * @example
 * ```typescript
 * import { CONFIG } from '@shared/config'
 *
 * const { GAME_RULES, SCORING_CONFIG, UI_CONFIG } = CONFIG
 * ```
 */
export const CONFIG = {
  GAME: {
    RULES: import('./game-rules').then(m => m.GAME_RULES),
    BOARD: import('./game-rules').then(m => m.BOARD_CONFIG),
    WORD: import('./game-rules').then(m => m.WORD_CONFIG),
    PLAYER: import('./game-rules').then(m => m.PLAYER_CONFIG),
    ALPHABET: import('./game-rules').then(m => m.ALPHABET_CONFIG),
  },
  SCORING: import('./scoring').then(m => m.SCORING_CONFIG),
  SUGGESTIONS: import('./suggestions').then(m => m.SUGGESTIONS_CONFIG),
  VALIDATION: import('./validation').then(m => m.VALIDATION_RULES),
  UI: import('./ui').then(m => m.UI_CONFIG),
  I18N: import('./i18n').then(m => m.messages),
} as const
