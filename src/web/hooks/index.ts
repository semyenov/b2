/**
 * Custom Hooks - Application-specific React hooks
 *
 * Centralized exports for all custom hooks used throughout the application
 * Organized by domain: game client, AI, interactions, UI state, and utilities
 */

// AI & Suggestions
export { useAIPlayer } from './useAIPlayer'
// Animation & Visual
export { useAnimatedPanel } from './useAnimatedPanel'

// UI Interaction
export { useClickOutside } from './useClickOutside'
// Form Management
export { useCreateGameForm } from './useCreateGameForm'

export { useFullscreen } from './useFullscreen'
export { useGameActions } from './useGameActions'

// Game Client & State Management
export { useGameClient } from './useGameClient'

export type { Screen, UseGameClientReturn } from './useGameClient'
export { useGameControls } from './useGameControls'

export { useGameInteraction } from './useGameInteraction'
export { useHover } from './useHover'

export { useKeyboardNavigation } from './useKeyboardNavigation'
// Accessibility
export { useLiveRegion } from './useLiveRegion'
// Game Stats
export { usePlayerStats } from './usePlayerStats'
export { useSuggestions } from './useSuggestions'

export type { UseGameInteractionReturn } from '@types'

export type { UseGameControlsReturn } from '@types'
export type { UseAIPlayerReturn } from '@types'

export type { UseSuggestionsReturn } from '@types'

export type { UseCreateGameFormReturn } from '@types'
