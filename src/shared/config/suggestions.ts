/**
 * Suggestions Configuration
 * AI move suggestion engine settings
 *
 * Controls suggestion generation, scoring, and display:
 * - Request/display limits
 * - Score tier classification
 * - Visual styling for tiers
 */

import type { BadgeVariant } from '../../web/components/ui'

/**
 * Suggestion request limits
 */
export const SUGGESTION_LIMITS = {
  /**
   * Default number of suggestions to return from API
   */
  DEFAULT: 20,

  /**
   * Maximum suggestions that can be requested from server
   * Prevents excessive computation
   */
  MAX: 200,

  /**
   * Maximum suggestions to display in web UI
   * Balances performance with usefulness
   */
  MAX_DISPLAY: 100,
} as const

/**
 * Score tier thresholds for suggestion quality classification
 */
export const SCORE_THRESHOLDS = {
  /**
   * High-value suggestions (rare letters, long words)
   */
  HIGH: 10,

  /**
   * Medium-value suggestions (decent scoring opportunities)
   */
  MEDIUM: 5,

  // Anything below MEDIUM is considered "low" tier
} as const

/**
 * Score tier classification type
 */
export type ScoreTier = 'high' | 'medium' | 'low'

/**
 * Tier visual configuration for UI display
 */
export interface TierConfig {
  /** Display label (Russian) */
  label: string
  /** Icon/emoji for visual identification */
  icon: string
  /** Badge color variant for styling */
  variant: BadgeVariant
}

/**
 * Tier display configuration mapping
 * Used by web UI to style suggestion cards
 */
export const TIER_CONFIG: Readonly<Record<ScoreTier, TierConfig>> = Object.freeze({
  high: {
    label: 'Лучшие',
    icon: '🏆',
    variant: 'success',
  },
  medium: {
    label: 'Хорошие',
    icon: '💡',
    variant: 'warning',
  },
  low: {
    label: 'Другие',
    icon: '📋',
    variant: 'gray',
  },
})

/**
 * Consolidated suggestions configuration
 */
export const SUGGESTIONS_CONFIG = {
  LIMITS: SUGGESTION_LIMITS,
  SCORE_THRESHOLDS,
  TIER_CONFIG,
} as const

/**
 * Helper function to determine score tier
 * @param score - Suggestion score
 * @returns Score tier classification
 */
export function getScoreTier(score: number): ScoreTier {
  if (score >= SCORE_THRESHOLDS.HIGH) {
    return 'high'
  }
  if (score >= SCORE_THRESHOLDS.MEDIUM) {
    return 'medium'
  }
  return 'low'
}
