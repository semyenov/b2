/**
 * Game status configuration
 *
 * Extracted from GameList.tsx to centralize status styling
 * Provides consistent status indicators across the application
 */

/**
 * Game status types
 */
export type GameStatus = 'waiting' | 'in_progress' | 'finished'

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
    color: 'bg-yellow-900 text-yellow-300 border-yellow-600',
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
