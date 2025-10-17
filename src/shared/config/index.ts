/**
 * Shared Configuration - Main Export
 * Centralized configuration for the Balda game
 *
 * This module provides a single import point for all shared game configuration:
 * - Game: Core rules, scoring, and alphabets
 * - Constants: Limits, validation, and timing
 * - Types: Shared type definitions
 * - I18n: Internationalization and localization
 *
 * @example
 * ```typescript
 * import { GAME, CONSTANTS, messages } from '@shared/config'
 *
 * // Access game rules
 * const boardSize = GAME.RULES.BOARD.DEFAULT_SIZE // 5
 * const letterScore = GAME.SCORING.getLetterScore('А') // 1
 *
 * // Access constants
 * const suggestionLimit = CONSTANTS.SUGGESTION_LIMITS.MAX // 200
 * const isValid = CONSTANTS.isValidPlayerName('Player1') // true
 *
 * // Access i18n
 * const error = messages.errors.GENERIC_ERROR // 'Произошла ошибка'
 * ```
 */

// ============================================
// Game Domain (rules, scoring, alphabets)
// ============================================
// ============================================
// Convenience Grouped Exports
// ============================================

import {
  AI_TIMING as _AI_TIMING,
  ANIMATION_TIMING as _ANIMATION_TIMING,
  BASE_WORD_VALIDATION as _BASE_WORD_VALIDATION,
  EMAIL_VALIDATION as _EMAIL_VALIDATION,
  GAME_ID_VALIDATION as _GAME_ID_VALIDATION,
  getScoreTier as _getScoreTier,
  isValidBaseWord as _isValidBaseWord,
  isValidEmail as _isValidEmail,
  isValidGameId as _isValidGameId,
  isValidPlayerName as _isValidPlayerName,
  MOVE_VALIDATION as _MOVE_VALIDATION,
  PASSWORD_VALIDATION as _PASSWORD_VALIDATION,
  PERFORMANCE_TIMING as _PERFORMANCE_TIMING,
  PLAYER_NAME_VALIDATION as _PLAYER_NAME_VALIDATION,
  SCORE_THRESHOLDS as _SCORE_THRESHOLDS,
  SUGGESTION_LIMITS as _SUGGESTION_LIMITS,
  TIER_CONFIG as _TIER_CONFIG,
  TOAST_TIMING as _TOAST_TIMING,
  USERNAME_VALIDATION as _USERNAME_VALIDATION,
  WEBSOCKET_TIMING as _WEBSOCKET_TIMING,
} from './constants'

import {
  ALPHABETS as _ALPHABETS,
  calculateWordScore as _calculateWordScore,
  filterToAlphabet as _filterToAlphabet,
  GAME_RULES as _GAME_RULES,
  getAlphabet as _getAlphabet,
  getLettersByScore as _getLettersByScore,
  getLetterScore as _getLetterScore,
  getScoreDistribution as _getScoreDistribution,
  isValidChar as _isValidChar,
  LETTER_SCORES as _LETTER_SCORES,
  SCORING_METADATA as _SCORING_METADATA,
} from './game'

import { messages as _messages } from './i18n'

// ============================================
// Constants (limits, validation, timing)
// ============================================
export * from './constants'

export * from './game'

// ============================================
// Internationalization
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

export type { Locale, LocaleCode } from './i18n'
// ============================================
// Shared Types
// ============================================
export * from './types'

/**
 * Game configuration grouped by domain
 * Provides organized access to game-related configs
 */
export const GAME = {
  /** Game rules (board, word, player, turn) */
  RULES: _GAME_RULES,
  /** Letter scoring system */
  SCORING: {
    LETTER_SCORES: _LETTER_SCORES,
    METADATA: _SCORING_METADATA,
    getLetterScore: _getLetterScore,
    calculateWordScore: _calculateWordScore,
    getLettersByScore: _getLettersByScore,
    getScoreDistribution: _getScoreDistribution,
  },
  /** Alphabets (Russian, Latin, combined) */
  ALPHABETS: {
    ..._ALPHABETS,
    isValidChar: _isValidChar,
    filterToAlphabet: _filterToAlphabet,
    getAlphabet: _getAlphabet,
  },
} as const

/**
 * Constants grouped by category
 * Provides organized access to limits, validation, and timing
 */
export const CONSTANTS = {
  /** Suggestion limits and score thresholds */
  LIMITS: {
    SUGGESTION_LIMITS: _SUGGESTION_LIMITS,
    SCORE_THRESHOLDS: _SCORE_THRESHOLDS,
    TIER_CONFIG: _TIER_CONFIG,
    getScoreTier: _getScoreTier,
  },
  /** Validation patterns and helper functions */
  VALIDATION: {
    PLAYER_NAME: _PLAYER_NAME_VALIDATION,
    BASE_WORD: _BASE_WORD_VALIDATION,
    MOVE: _MOVE_VALIDATION,
    GAME_ID: _GAME_ID_VALIDATION,
    EMAIL: _EMAIL_VALIDATION,
    PASSWORD: _PASSWORD_VALIDATION,
    USERNAME: _USERNAME_VALIDATION,
    isValidPlayerName: _isValidPlayerName,
    isValidBaseWord: _isValidBaseWord,
    isValidEmail: _isValidEmail,
    isValidGameId: _isValidGameId,
  },
  /** Timing constants (animation, AI, WebSocket, toast) */
  TIMING: {
    ANIMATION: _ANIMATION_TIMING,
    AI: _AI_TIMING,
    WEBSOCKET: _WEBSOCKET_TIMING,
    TOAST: _TOAST_TIMING,
    PERFORMANCE: _PERFORMANCE_TIMING,
  },
} as const

/**
 * Complete configuration object
 * Legacy export for backward compatibility
 * @deprecated Use GAME and CONSTANTS instead for better tree-shaking
 */
export const CONFIG = {
  GAME,
  CONSTANTS,
  I18N: _messages,
} as const
