import type { ApiClient, GameState, Suggestion } from '../lib/client'
import type { Screen } from './useGameClient'
import { useCallback, useState } from 'react'

interface UseSuggestionsOptions {
  apiClient: ApiClient
  currentGame: GameState | null
  playerName: string
  screen: Screen
}

interface UseSuggestionsReturn {
  suggestions: Suggestion[]
  loadingSuggestions: boolean
  loadSuggestions: () => Promise<void>
  clearSuggestions: () => void
}

export function useSuggestions({
  apiClient,
  currentGame,
  playerName: _playerName, // Reserved for future auto-load logic
  screen: _screen, // Reserved for future auto-load logic
}: UseSuggestionsOptions): UseSuggestionsReturn {
  const [suggestions, setSuggestions] = useState<Suggestion[]>([])
  const [loadingSuggestions, setLoadingSuggestions] = useState(false)

  const loadSuggestions = useCallback(async () => {
    if (!currentGame) {
      return
    }

    setLoadingSuggestions(true)
    try {
      const result = await apiClient.getSuggestions(currentGame.id, 20)
      setSuggestions(result)
    }
    catch (err) {
      console.error('Failed to load suggestions:', err)
      setSuggestions([])
    }
    finally {
      setLoadingSuggestions(false)
    }
  }, [currentGame?.id, apiClient])

  // Auto-load disabled - suggestions now load only on manual button click
  // Users found auto-loading intrusive and distracting

  const clearSuggestions = () => {
    setSuggestions([])
  }

  return {
    suggestions,
    loadingSuggestions,
    loadSuggestions,
    clearSuggestions,
  }
}
