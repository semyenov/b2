/**
 * Game status configuration
 *
 * Extracted from GameList.tsx to centralize status styling
 * Provides consistent status indicators across the application
 */

import type { GameStatus } from '../types'

// Re-export for modules that use STATUS_CONFIG
export type { GameStatus }

/**
 * Status configuration for display
 */
export interface StatusConfig {
  label: string
  color: string
}

/**
 * Status configuration mapping
 *
 * Maps game status to display label and color classes
 */
export const STATUS_CONFIG: Record<GameStatus, StatusConfig> = {
  waiting: {
    label: 'Ожидание',
    color: 'bg-user-900 text-user-300 border-user-600',
  },
  in_progress: {
    label: 'В процессе',
    color: 'bg-green-900 text-green-300 border-green-600',
  },
  finished: {
    label: 'Завершена',
    color: 'bg-gray-700 text-gray-300 border-gray-600',
  },
} as const
