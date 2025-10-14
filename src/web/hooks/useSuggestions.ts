import type { ApiClient, GameState, Suggestion } from '@lib/client'
import { logger } from '@utils/logger'
import { useCallback, useMemo, useState } from 'react'

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
 */
export function useSuggestions({
  apiClient,
  currentGame,
}: UseSuggestionsOptions): UseSuggestionsReturn {
  const [suggestions, setSuggestions] = useState<Suggestion[]>([])
  const [loadingSuggestions, setLoadingSuggestions] = useState(false)

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

  return {
    suggestions,
    loadingSuggestions,
    loadSuggestions,
    clearSuggestions,
  }
}
