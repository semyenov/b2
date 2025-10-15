/**
 * Suggestions Constants
 * Configuration for suggestion display and tier classification
 */

import type { BadgeVariant } from '../components/ui'

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
 * Maps score tiers to visual presentation
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
