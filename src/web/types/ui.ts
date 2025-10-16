/**
 * UI-specific type definitions
 * Types related to UI state, navigation, and user interactions
 */

/**
 * Application screen/route identifiers
 */
export type Screen = 'menu' | 'list' | 'create' | 'play'

/**
 * Game step in the user interaction flow
 * Determines what action the player should take next
 */
export type GameStep = 'waiting' | 'select-cell' | 'select-letter' | 'build-word' | 'ready-to-submit'

/**
 * Banner/notification variants
 */
export type BannerVariant = 'error' | 'loading' | 'warning'

/**
 * Game status configuration for UI rendering
 */
export interface GameStatusConfig {
  label: string
  className: string
}
