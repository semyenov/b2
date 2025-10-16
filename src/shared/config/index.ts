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

// Import values for internal use in CONFIG object
import {
  ALPHABET_CONFIG as _ALPHABET_CONFIG,
  BOARD_CONFIG as _BOARD_CONFIG,
  GAME_RULES as _GAME_RULES,
  PLAYER_CONFIG as _PLAYER_CONFIG,
  WORD_CONFIG as _WORD_CONFIG,
} from './game-rules'
import { messages as _messages } from './i18n'
import { SCORING_CONFIG as _SCORING_CONFIG } from './scoring'
import { SUGGESTIONS_CONFIG as _SUGGESTIONS_CONFIG } from './suggestions'
import { UI_CONFIG as _UI_CONFIG } from './ui'
import { VALIDATION_RULES as _VALIDATION_RULES } from './validation'

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
    RULES: _GAME_RULES,
    BOARD: _BOARD_CONFIG,
    WORD: _WORD_CONFIG,
    PLAYER: _PLAYER_CONFIG,
    ALPHABET: _ALPHABET_CONFIG,
  },
  SCORING: _SCORING_CONFIG,
  SUGGESTIONS: _SUGGESTIONS_CONFIG,
  VALIDATION: _VALIDATION_RULES,
  UI: _UI_CONFIG,
  I18N: _messages,
} as const
