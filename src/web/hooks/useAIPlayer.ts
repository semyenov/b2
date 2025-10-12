import type { ApiClient, GameState, MoveBody } from '../lib/client'
import { useEffect, useRef, useState } from 'react'
import { GAME_CONFIG } from '../constants/game'
import { logger } from '../utils/logger'

interface UseAIPlayerOptions {
  currentGame: GameState | null
  apiClient: ApiClient
}

interface UseAIPlayerReturn {
  aiThinking: boolean
  aiError: string | null
}

/**
 * AI Player automation hook
 * Automatically plays moves for AI players using suggestions API
 *
 * @param options - Current game state and API client
 * @returns AI thinking state and error messages
 */
export function useAIPlayer({
  currentGame,
  apiClient,
}: UseAIPlayerOptions): UseAIPlayerReturn {
  const [aiThinking, setAIThinking] = useState(false)
  const [aiError, setAIError] = useState<string | null>(null)
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
      setAIError(null) // Clear previous errors
      // Mark this turn as processed BEFORE making move to prevent re-trigger
      // After move completes, moves.length will be currentGame.moves.length + 1
      lastProcessedMoveCount.current = currentGame.moves.length + 1

      try {
        // Simulate "thinking" delay for better UX
        await new Promise(resolve => setTimeout(resolve, GAME_CONFIG.AI_THINKING_DELAY_MS))

        // Load suggestions
        const suggestions = await apiClient.getSuggestions(currentGame.id, GAME_CONFIG.MAX_SUGGESTIONS_DISPLAY)

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
        else {
          // No valid moves available - game is stuck
          setAIError('У AI нет доступных ходов')
          logger.warn('AI has no valid moves available', {
            gameId: currentGame.id,
            player: currentPlayer,
          })
          // Reset to allow future detection if game state changes
          lastProcessedMoveCount.current = currentGame.moves.length
        }
      }
      catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Ошибка AI хода'
        setAIError(errorMessage)
        logger.error('AI move failed', error as Error, {
          gameId: currentGame.id,
          player: currentPlayer,
        })
        // Reset to allow retry on next state change
        lastProcessedMoveCount.current = currentGame.moves.length
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
    aiError,
  }
}
