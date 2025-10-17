/**
 * Game configuration constants
 * Imports from shared config with web-specific overrides
 */

import {
  AI_TIMING,
  ALPHABETS,
  BOARD_CONFIG,
  messages,
  SCORE_THRESHOLDS,
  SUGGESTION_LIMITS,
  WORD_CONFIG,
} from '../../shared/config'

// Note: Game status configuration moved to statusConfig.ts to avoid duplication
// Import from '../constants/statusConfig' if needed

export const GAME_CONFIG = {
  // Suggestions - from shared config
  MAX_SUGGESTIONS_DISPLAY: SUGGESTION_LIMITS.MAX_DISPLAY,

  // Board - from shared config
  DEFAULT_BOARD_SIZE: BOARD_CONFIG.DEFAULT_SIZE,
  MIN_WORD_LENGTH: WORD_CONFIG.MIN_LENGTH,

  // Alphabet - web-specific UI layout
  ALPHABET_GRID_COLUMNS: 11,

  // AI - from shared config
  AI_THINKING_DELAY_MS: AI_TIMING.THINKING_DELAY_MS,

  // Score thresholds - from shared config
  SCORE_THRESHOLDS: {
    HIGH: SCORE_THRESHOLDS.HIGH,
    MEDIUM: SCORE_THRESHOLDS.MEDIUM,
  },
} as const

// Valid board sizes - derived from shared config
export const BOARD_SIZES = [
  BOARD_CONFIG.MIN_SIZE,
  4,
  BOARD_CONFIG.DEFAULT_SIZE,
  6,
  BOARD_CONFIG.MAX_SIZE,
] as const

// Russian alphabet - from shared config
export const RUSSIAN_ALPHABET = ALPHABETS.RUSSIAN.split('')

export const A11Y_LABELS = messages.a11y
