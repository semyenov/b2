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
 * Game status for display
 * Matches backend game status
 */
export type GameStatus = 'waiting' | 'in_progress' | 'finished'

/**
 * Banner/notification variants
 */
export type BannerVariant = 'error' | 'loading' | 'warning'

/**
 * Menu button variants
 */
export type MenuButtonVariant = 'primary' | 'secondary' | 'success' | 'warning'

/**
 * Menu button sizes
 */
export type MenuButtonSize = 'normal' | 'large'

/**
 * Game status configuration for UI rendering
 */
export interface GameStatusConfig {
  label: string
  className: string
}

/**
 * Props for components with variant styling
 */
export interface VariantProps {
  variant: MenuButtonVariant
}

/**
 * Props for components with size options
 */
export interface SizeProps {
  size?: MenuButtonSize
}
