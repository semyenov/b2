import type { ApiClient, GameState, Suggestion } from '../lib/client'
import type { Screen } from './useGameClient'
import { useEffect, useState } from 'react'

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
  playerName,
  screen,
}: UseSuggestionsOptions): UseSuggestionsReturn {
  const [suggestions, setSuggestions] = useState<Suggestion[]>([])
  const [loadingSuggestions, setLoadingSuggestions] = useState(false)

  // Auto-load suggestions when it's player's turn
  useEffect(() => {
    if (!currentGame || !playerName || screen !== 'play') {
      return
    }

    // Check if it's my turn
    const isMyTurn = playerName === currentGame.players[currentGame.currentPlayerIndex]
    const isAIPlayer = currentGame.aiPlayers.includes(playerName)

    // Auto-load suggestions when it becomes my turn (but not for AI players)
    // AI players have their own suggestion loading in useAIPlayer hook
    if (isMyTurn && !isAIPlayer && !loadingSuggestions) {
      loadSuggestions()
    }
  }, [currentGame?.currentPlayerIndex, currentGame?.moves.length, playerName, screen])

  const loadSuggestions = async () => {
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
  }

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
