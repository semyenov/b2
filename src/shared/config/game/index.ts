/**
 * Game Configuration Module
 * Core game rules, scoring, and alphabets
 *
 * This module contains all the fundamental game logic configuration:
 * - Rules: Board sizes, word lengths, player counts, movement
 * - Scoring: Letter point values and calculation functions
 * - Alphabets: Valid character sets for different languages
 */

// ============================================
// Alphabets
// ============================================
export {
  ALPHABETS,
  filterToAlphabet,
  getAlphabet,
  isValidChar,
} from './alphabets'
// ============================================
// Game Rules
// ============================================
export {
  BOARD_CONFIG,
  GAME_RULES,
  ORTHOGONAL_DIRS,
  PLAYER_CONFIG,
  TURN_CONFIG,
  WORD_CONFIG,
} from './rules'

export type { BoardPosition, BoardSize } from './rules'

// ============================================
// Scoring System
// ============================================
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
