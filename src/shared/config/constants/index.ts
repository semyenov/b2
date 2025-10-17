/**
 * Constants Module
 * Shared constants, limits, and validation rules
 *
 * This module provides:
 * - Limits: Suggestion limits, score thresholds, tier configs
 * - Validation: Input validation patterns and helper functions
 * - Timing: Animation, AI, WebSocket, and toast timing constants
 */

// ============================================
// Limits & Thresholds
// ============================================
export {
  getScoreTier,
  SCORE_THRESHOLDS,
  SUGGESTION_LIMITS,
  TIER_CONFIG,
} from './limits'
export type { ScoreTier, TierConfig } from './limits'

// ============================================

// ============================================
// Timing Constants
// ============================================
export {
  AI_TIMING,
  ANIMATION_TIMING,
  PERFORMANCE_TIMING,
  TIMING,
  TOAST_TIMING,
  WEBSOCKET_TIMING,
} from './timing'

// Validation Rules
// ============================================
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
  VALIDATION,
} from './validation'
