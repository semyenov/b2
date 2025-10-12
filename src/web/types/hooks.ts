/**
 * Hook return type definitions
 * Centralizes types for custom React hooks
 */

import type { ApiClient, GameState, MoveBody, Suggestion } from '../lib/client'
import type { Position } from './game'

/**
 * Screen navigation type
 */
export type Screen = 'menu' | 'list' | 'create' | 'play'

/**
 * Return type for useGameClient hook
 * Main game state and actions
 */
export interface UseGameClientReturn {
  // State
  screen: Screen
  gameId: string
  games: GameState[]
  currentGame: GameState | null
  playerName: string
  loading: boolean
  error: string

  // Actions
  setScreen: (screen: Screen) => void
  setError: (error: string) => void
  loadGames: () => Promise<void>
  createGame: (body: import('../lib/client').CreateGameBody) => Promise<void>
  joinGame: (id: string, name: string) => Promise<void>
  makeMove: (move: MoveBody) => Promise<void>
  quickStart: () => Promise<void>
  quickStartVsAI: () => Promise<void>

  // Helpers
  isMyTurn: () => boolean
  apiClient: ApiClient
}

/**
 * Return type for useGameInteraction hook
 * UI interaction state management
 */
export interface UseGameInteractionReturn {
  selectedCell: Position | undefined
  selectedLetter: string
  wordPath: Position[]
  handleCellClick: (row: number, col: number) => void
  handleLetterSelect: (letter: string) => void
  handleClearSelection: () => void
  handleSuggestionSelect: (suggestion: Suggestion) => void
  clearAll: () => void
}

/**
 * Return type for useSuggestions hook
 * AI move suggestions management
 */
export interface UseSuggestionsReturn {
  suggestions: Suggestion[]
  loadingSuggestions: boolean
  loadSuggestions: () => Promise<void>
  clearSuggestions: () => void
}

/**
 * Return type for useGameControls hook
 * Game control actions
 */
export interface UseGameControlsReturn {
  showSuggestions: boolean
  toggleSuggestions: () => void
  hideSuggestions: () => void
  makeMove: (move: MoveBody) => Promise<void>
  handleExitToMenu: () => void
}

/**
 * Return type for useAIPlayer hook
 * AI player automation
 */
export interface UseAIPlayerReturn {
  aiThinking: boolean
  aiError: string | null
}

/**
 * Return type for useFullscreen hook
 * Fullscreen mode management
 */
export interface UseFullscreenReturn {
  isFullscreen: boolean
  toggleFullscreen: () => void
}

/**
 * Return type for useCreateGameForm hook
 * Form state management
 */
export interface UseCreateGameFormReturn {
  boardSize: number
  playerName: string
  errors: {
    boardSize?: string
    playerName?: string
  }
  setBoardSize: (size: number) => void
  setPlayerName: (name: string) => void
  handleSubmit: () => void
  isValid: boolean
}
