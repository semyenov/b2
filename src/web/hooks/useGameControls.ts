import type { MoveBody } from '../lib/client'
import type { Screen } from './useGameClient'
import { useCallback, useState } from 'react'

interface UseGameControlsOptions {
  makeApiMove: (move: MoveBody) => Promise<void>
  clearSuggestions: () => void
  clearInteraction: () => void
  setScreen: (screen: Screen) => void
  loadSuggestions: () => void
  suggestions: unknown[]
  loadingSuggestions: boolean
}

interface UseGameControlsReturn {
  showSuggestions: boolean
  toggleSuggestions: () => void
  hideSuggestions: () => void
  makeMove: (move: MoveBody) => Promise<void>
  handleExitToMenu: () => void
}

/**
 * Custom hook to manage game control actions
 * Extracted from App.tsx for better separation of concerns
 */
export function useGameControls({
  makeApiMove,
  clearSuggestions,
  clearInteraction,
  setScreen,
  loadSuggestions,
  suggestions,
  loadingSuggestions,
}: UseGameControlsOptions): UseGameControlsReturn {
  const [showSuggestions, setShowSuggestions] = useState(false)

  // Toggle suggestions visibility and load if needed
  const toggleSuggestions = useCallback(() => {
    if (!showSuggestions && suggestions.length === 0 && !loadingSuggestions) {
      loadSuggestions()
    }
    setShowSuggestions(prev => !prev)
  }, [showSuggestions, suggestions.length, loadingSuggestions, loadSuggestions])

  // Wrapper to clear selections after move
  const makeMove = useCallback(
    async (move: MoveBody) => {
      await makeApiMove(move)
      clearSuggestions()
      clearInteraction()
      setShowSuggestions(false)
    },
    [makeApiMove, clearSuggestions, clearInteraction],
  )

  // Handle exit to menu
  const handleExitToMenu = useCallback(() => {
    setScreen('menu')
    clearSuggestions()
    clearInteraction()
    setShowSuggestions(false)
  }, [setScreen, clearSuggestions, clearInteraction])

  // Hide suggestions panel
  const hideSuggestions = useCallback(() => {
    setShowSuggestions(false)
  }, [])

  return {
    showSuggestions,
    toggleSuggestions,
    hideSuggestions,
    makeMove,
    handleExitToMenu,
  }
}
