import type { ApiClient, GameState, Suggestion } from '@lib/client'
import { logger } from '@utils/logger'
import { useCallback, useEffect, useMemo, useRef, useState } from 'react'

interface UseSuggestionsOptions {
  apiClient: ApiClient
  currentGame: GameState | null
}

interface UseSuggestionsReturn {
  suggestions: Suggestion[]
  loadingSuggestions: boolean
  loadSuggestions: () => Promise<void>
  clearSuggestions: () => void
}

/**
 * Custom hook to manage AI move suggestions
 * Provides loading, caching, and clearing of suggestions
 * Auto-loads suggestions when a new game starts
 */
export function useSuggestions({
  apiClient,
  currentGame,
}: UseSuggestionsOptions): UseSuggestionsReturn {
  const [suggestions, setSuggestions] = useState<Suggestion[]>([])
  const [loadingSuggestions, setLoadingSuggestions] = useState(false)
  const lastGameId = useRef<string | null>(null)

  // Memoize game ID to prevent unnecessary re-renders
  const gameId = useMemo(() => currentGame?.id, [currentGame?.id])

  const loadSuggestions = useCallback(async () => {
    if (!gameId) {
      return
    }

    setLoadingSuggestions(true)
    try {
      const result = await apiClient.getSuggestions(gameId, 20)
      setSuggestions(result)
    }
    catch (err) {
      logger.error('Failed to load suggestions', err as Error, { gameId })
      setSuggestions([])
    }
    finally {
      setLoadingSuggestions(false)
    }
  }, [gameId, apiClient])

  const clearSuggestions = useCallback(() => {
    setSuggestions([])
  }, [])

  // Auto-load suggestions when a new game starts
  useEffect(() => {
    if (!currentGame || !gameId) {
      return
    }

    // Check if this is a new game (different gameId or restarted game with 0 moves)
    const isNewGame = lastGameId.current !== gameId
    const isGameStart = currentGame.moves.length === 0

    if (isNewGame && isGameStart) {
      logger.info('New game detected, auto-loading suggestions', { gameId })
      lastGameId.current = gameId
      loadSuggestions()
    }
    else if (!isNewGame && isGameStart && lastGameId.current === gameId) {
      // Game was restarted with same ID (edge case)
      logger.info('Game restarted, reloading suggestions', { gameId })
      loadSuggestions()
    }
  }, [currentGame, gameId, loadSuggestions])

  return {
    suggestions,
    loadingSuggestions,
    loadSuggestions,
    clearSuggestions,
  }
}
