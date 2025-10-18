import type { GameState } from '@lib/client'
import type { Position } from '@shared/types'
import type { Suggestion } from '@web/lib/client'
import { createContext, useContext } from 'react'

/**
 * Game Context Value
 *
 * Centralized game state and actions shared across GameScreen components.
 * Reduces prop drilling by providing game data through React Context.
 */
export interface GameContextValue {
  // Core game state
  game: GameState
  playerName: string
  isMyTurn: boolean

  // UI interaction state
  selectedCell?: Position
  selectedLetter?: string
  wordPath: Position[]

  // Suggestions state
  showSuggestions: boolean
  suggestions: Suggestion[]
  loadingSuggestions: boolean

  // Actions
  onCellClick: (row: number, col: number) => void
  onLetterSelect: (letter: string) => void
  onSuggestionSelect: (suggestion: Suggestion) => void
  onSubmitMove: () => void
  onClearSelection: () => void
  onToggleSuggestions: () => void
  onHideSuggestions: () => void
  onExit: () => void
  onRestartWithNewWord: () => void
}

/**
 * Game Context
 *
 * Provides game state and actions to child components without prop drilling.
 * Used within GameScreen to share state with Board, Sidebar, GamePanel, etc.
 */
export const GameContext = createContext<GameContextValue | null>(null)

/**
 * Hook to access Game Context
 *
 * Must be used within a GameContext.Provider (inside GameScreen).
 * Throws an error if used outside the provider.
 *
 * @returns Game context value
 * @throws Error if used outside GameContext.Provider
 *
 * @example
 * ```tsx
 * function Board() {
 *   const { game, selectedCell, onCellClick } = useGameContext()
 *   // ...
 * }
 * ```
 */
export function useGameContext(): GameContextValue {
  const context = useContext(GameContext)
  if (!context) {
    throw new Error('useGameContext must be used within GameContext.Provider')
  }
  return context
}
