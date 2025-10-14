import type { BadgeVariant } from '@components/ui'
import type { Suggestion } from '@lib/client'
import { GAME_CONFIG } from '@constants/game'

/**
 * Score tier classification
 */
export type ScoreTier = 'high' | 'medium' | 'low'

/**
 * Tier configuration for visual styling
 */
export interface TierConfig {
  label: string
  icon: string
  variant: BadgeVariant
}

/**
 * Tier display configuration
 */
export const TIER_CONFIG: Record<ScoreTier, TierConfig> = {
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
}

/**
 * Determine score tier based on game thresholds
 * @param score - Suggestion score
 * @returns Score tier classification
 */
export function getScoreTier(score: number): ScoreTier {
  if (score >= GAME_CONFIG.SCORE_THRESHOLDS.HIGH) {
    return 'high'
  }
  if (score >= GAME_CONFIG.SCORE_THRESHOLDS.MEDIUM) {
    return 'medium'
  }
  return 'low'
}

/**
 * Get badge variant for a score
 * Maps score tier to appropriate badge color
 * @param score - Suggestion score
 * @returns Badge variant for styling
 */
export function getScoreColor(score: number): BadgeVariant {
  const tier = getScoreTier(score)
  return TIER_CONFIG[tier].variant
}

/**
 * Group suggestions by score tier
 * Maintains original order within each tier
 * @param suggestions - Array of suggestions to group
 * @returns Object with suggestions grouped by tier
 */
export function groupSuggestionsByTier(
  suggestions: Suggestion[],
): Record<ScoreTier, Suggestion[]> {
  const grouped: Record<ScoreTier, Suggestion[]> = {
    high: [],
    medium: [],
    low: [],
  }

  for (const suggestion of suggestions) {
    const tier = getScoreTier(suggestion.score)
    grouped[tier].push(suggestion)
  }

  return grouped
}

/**
 * Get coordinate label for a suggestion position
 * Format: row + column letter (e.g., "2Б")
 * @param suggestion - Suggestion with position
 * @returns Formatted coordinate string
 */
export function getSuggestionCoordLabel(suggestion: Suggestion): string {
  return `${suggestion.position.row}${String.fromCharCode(1040 + suggestion.position.col)}`
}
