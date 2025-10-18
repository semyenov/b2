import type { ApiClient, GameState, MoveBody } from '@lib/client'
import { GAME_CONFIG } from '@constants/game'
import { ERROR_MESSAGES, translateErrorMessage } from '@constants/messages'
import { logger } from '@utils/logger'
import { useEffect, useRef, useState } from 'react'

interface UseAIPlayerOptions {
  /** Current game state */
  currentGame: GameState | null
  /** Function to submit a move */
  makeMove: (move: MoveBody) => Promise<boolean>
  /** API client instance */
  apiClient: ApiClient
}

interface UseAIPlayerReturn {
  /** Whether AI is currently "thinking" */
  aiThinking: boolean
  /** AI error message if AI move failed */
  aiError: string | null
}

/**
 * AI Player Automation Hook
 *
 * Extracted from useGameClient for better separation of concerns.
 * Automatically detects when it's an AI player's turn and makes optimal moves.
 *
 * **How it works:**
 * 1. Monitors currentGame state for AI player turns
 * 2. Simulates "thinking" delay for better UX (1.5s)
 * 3. Fetches move suggestions from the backend
 * 4. Selects the highest-scored move
 * 5. Submits the move via makeMove callback
 *
 * **Race condition prevention:**
 * - Tracks last processed move count to prevent double-triggers
 * - Uses aiMoveInProgress ref to prevent concurrent AI moves
 * - Prevents re-triggering during async "thinking" delay
 *
 * @param options - Hook options
 * @returns AI state (thinking, error)
 *
 * @example
 * ```tsx
 * const { aiThinking, aiError } = useAIPlayer({
 *   currentGame,
 *   makeMove,
 *   apiClient,
 * })
 * ```
 */
export function useAIPlayer({
  currentGame,
  makeMove,
  apiClient,
}: UseAIPlayerOptions): UseAIPlayerReturn {
  // AI state
  const [aiThinking, setAIThinking] = useState(false)
  const [aiError, setAIError] = useState<string | null>(null)

  // Track processed moves to prevent re-triggering
  const lastProcessedMoveCount = useRef(0)
  // Prevent concurrent AI moves during thinking delay
  const aiMoveInProgress = useRef(false)

  // AI Player automation effect
  useEffect(() => {
    logger.debug('AI effect triggered', {
      hasCurrentGame: !!currentGame,
      currentPlayerIndex: currentGame?.currentPlayerIndex,
      movesLength: currentGame?.moves.length,
      lastProcessed: lastProcessedMoveCount.current,
      aiPlayers: currentGame?.aiPlayers,
    })

    if (!currentGame) {
      setAIThinking(false)
      return
    }

    // Check if current player is AI
    const currentPlayer = currentGame.players[currentGame.currentPlayerIndex]!
    const isAITurn = currentGame.aiPlayers.includes(currentPlayer)

    logger.debug('AI turn check', {
      currentPlayer,
      isAITurn,
      aiPlayers: currentGame.aiPlayers,
    })

    if (!isAITurn) {
      setAIThinking(false)
      aiMoveInProgress.current = false
      return
    }

    // Don't re-trigger if we already processed this turn
    if (currentGame.moves.length === lastProcessedMoveCount.current) {
      logger.debug('AI turn already processed, skipping', {
        currentMoves: currentGame.moves.length,
        lastProcessed: lastProcessedMoveCount.current,
      })
      return
    }

    // CRITICAL: Prevent race condition during AI "thinking" delay
    // If AI move is already in progress, skip to prevent double-submission
    if (aiMoveInProgress.current) {
      logger.debug('AI move already in progress, skipping duplicate trigger', {
        currentMoves: currentGame.moves.length,
      })
      return
    }

    // AI's turn - make a move
    const makeAIMove = async () => {
      // Mark AI move as in progress BEFORE any async operations
      aiMoveInProgress.current = true
      setAIThinking(true)
      setAIError(null)

      try {
        logger.info('AI turn detected:', {
          player: currentPlayer,
          moveCount: currentGame.moves.length,
        })

        // Simulate "thinking" delay for better UX
        await new Promise(resolve => setTimeout(resolve, GAME_CONFIG.AI_THINKING_DELAY_MS))

        // Load suggestions
        const suggestions = await apiClient.getSuggestions(
          currentGame.id,
          GAME_CONFIG.MAX_SUGGESTIONS_DISPLAY,
        )

        if (suggestions.length > 0) {
          // Select best suggestion (first one is highest scored)
          const bestMove = suggestions[0]!

          // Construct move body
          const moveBody: MoveBody = {
            playerId: currentPlayer,
            position: bestMove.position,
            letter: bestMove.letter,
            word: bestMove.word.toUpperCase(),
          }

          logger.debug('AI making move:', { moveBody, suggestion: bestMove })

          // Submit the move using the same state-updating function as user moves
          const success = await makeMove(moveBody)

          if (success) {
            // Update counter after successful AI move to prevent re-triggering
            lastProcessedMoveCount.current = currentGame.moves.length + 1
            logger.debug('AI move completed, updated counter', {
              lastProcessed: lastProcessedMoveCount.current,
            })
          }
        }
        else {
          // No valid moves available - game is stuck
          setAIError(ERROR_MESSAGES.AI_NO_MOVES)
          logger.warn('AI has no valid moves available', {
            gameId: currentGame.id,
            player: currentPlayer,
          })
          // Reset to allow future detection if game state changes
          lastProcessedMoveCount.current = currentGame.moves.length
        }
      }
      catch (error) {
        const errorMessage = error instanceof Error
          ? translateErrorMessage(error.message)
          : ERROR_MESSAGES.AI_MOVE_FAILED
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
        // Clear in-progress flag after move completes (success or failure)
        aiMoveInProgress.current = false
      }
    }

    makeAIMove()
  }, [currentGame, makeMove, apiClient])

  return {
    aiThinking,
    aiError,
  }
}
