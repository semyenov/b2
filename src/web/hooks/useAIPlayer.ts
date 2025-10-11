import type { ApiClient, GameState, MoveBody } from '../lib/client'
import { useEffect, useRef, useState } from 'react'

interface UseAIPlayerOptions {
  currentGame: GameState | null
  apiClient: ApiClient
}

interface UseAIPlayerReturn {
  aiThinking: boolean
}

/**
 * AI Player automation hook
 * Automatically plays moves for AI players using suggestions API
 */
export function useAIPlayer({
  currentGame,
  apiClient,
}: UseAIPlayerOptions): UseAIPlayerReturn {
  const [aiThinking, setAIThinking] = useState(false)
  const lastProcessedMoveCount = useRef(0)

  useEffect(() => {
    if (!currentGame) {
      setAIThinking(false)
      return
    }

    // Check if current player is AI
    const currentPlayer = currentGame.players[currentGame.currentPlayerIndex]
    const isAITurn = currentGame.aiPlayers.includes(currentPlayer)

    if (!isAITurn) {
      setAIThinking(false)
      return
    }

    // Don't re-trigger if we already processed this turn
    if (currentGame.moves.length === lastProcessedMoveCount.current) {
      return
    }

    // AI's turn - make a move
    const makeAIMove = async () => {
      setAIThinking(true)
      lastProcessedMoveCount.current = currentGame.moves.length

      try {
        // Simulate "thinking" delay for better UX
        await new Promise(resolve => setTimeout(resolve, 1500))

        // Load suggestions
        const suggestions = await apiClient.getSuggestions(currentGame.id, 20)

        if (suggestions.length > 0) {
          // Select best suggestion (first one is highest scored)
          const bestMove = suggestions[0]

          // Construct move body
          const moveBody: MoveBody = {
            playerId: currentPlayer,
            position: bestMove.position,
            letter: bestMove.letter,
            word: bestMove.word.toUpperCase(),
          }

          // Submit the move
          await apiClient.makeMove(currentGame.id, moveBody)
        }
      }
      catch (error) {
        console.error('AI move failed:', error)
      }
      finally {
        setAIThinking(false)
      }
    }

    makeAIMove()
  }, [
    currentGame?.currentPlayerIndex,
    currentGame?.moves.length,
    currentGame?.aiPlayers,
    apiClient,
  ])

  return {
    aiThinking,
  }
}
