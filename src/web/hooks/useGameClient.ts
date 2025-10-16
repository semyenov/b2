import type { CreateGameBody, GameState, MoveBody } from '@lib/client'
import type { Screen, UseGameClientReturn } from '@types'
import { GAME_CONFIG } from '@constants/game'
import { ERROR_MESSAGES, translateErrorMessage } from '@constants/messages'
import { ApiClient } from '@lib/client'
import { logger } from '@utils/logger'
import { useCallback, useEffect, useRef, useState } from 'react'

// Re-export for backwards compatibility
export type { Screen, UseGameClientReturn } from '@types'

export function useGameClient(): UseGameClientReturn {
  // Core state
  const [screen, setScreen] = useState<Screen>('menu')
  const [gameId, setGameId] = useState<string>('')
  const [games, setGames] = useState<GameState[]>([])
  const [currentGame, setCurrentGame] = useState<GameState | null>(null)
  const [playerName, setPlayerName] = useState<string>('')

  // UI state
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string>('')

  // AI state
  const [aiThinking, setAIThinking] = useState(false)
  const [aiError, setAIError] = useState<string | null>(null)

  // Refs
  const apiClient = useRef(new ApiClient()).current
  const wsRef = useRef<WebSocket | null>(null)
  const lastProcessedMoveCount = useRef(0)
  const aiMoveInProgress = useRef(false)
  const wsConnected = useRef(false)

  // Check server health on mount
  useEffect(() => {
    apiClient.getHealth().catch(() => {
      setError(ERROR_MESSAGES.SERVER_CONNECTION_FAILED)
    })
  }, [apiClient])

  // WebSocket connection management
  useEffect(() => {
    if (screen === 'play' && gameId && !wsRef.current) {
      logger.info('Connecting WebSocket for game', { gameId })
      wsRef.current = apiClient.connectWebSocket(
        gameId,
        (updatedGame) => {
          wsConnected.current = true
          logger.debug('WebSocket game update received', {
            gameId: updatedGame.id,
            moves: updatedGame.moves.length,
            currentPlayerIndex: updatedGame.currentPlayerIndex,
          })
          setCurrentGame(updatedGame)
        },
        () => {
          wsConnected.current = false
          logger.warn('WebSocket connection lost')
          setError(ERROR_MESSAGES.CONNECTION_LOST)
        },
      )
    }

    return () => {
      if (wsRef.current && screen !== 'play') {
        logger.info('Closing WebSocket connection')
        wsRef.current.close()
        wsRef.current = null
        wsConnected.current = false
      }
    }
  }, [screen, gameId, apiClient])

  // API wrapper with error handling
  const apiCall = useCallback(async <T>(fn: () => Promise<T>): Promise<T | null> => {
    setLoading(true)
    setError('')
    try {
      return await fn()
    }
    catch (err) {
      const errorMessage = err instanceof Error ? translateErrorMessage(err.message) : ERROR_MESSAGES.GENERIC_ERROR
      setError(errorMessage)
      return null
    }
    finally {
      setLoading(false)
    }
  }, [])

  const loadGames = async () => {
    const result = await apiCall(() => apiClient.getGames())
    if (result) {
      setGames(result)
      setScreen('list')
    }
  }

  const joinGame = async (id: string, name: string) => {
    const game = await apiCall(() => apiClient.getGame(id))
    if (!game) {
      return
    }

    setCurrentGame(game)
    setPlayerName(name)
    setGameId(id)

    // Try to claim a slot if not already in game
    if (!game.players.includes(name)) {
      const slotIndex = game.players.findIndex(
        p => p.startsWith('Player ') && p !== 'Player 1',
      )
      if (slotIndex !== -1) {
        // slotIndex checked to be valid (-1 check above) - safe to use non-null assertion
        const updated = await apiCall(() =>
          apiClient.updatePlayerName(id, game.players[slotIndex]!, name),
        )
        if (updated) {
          setCurrentGame(updated)
        }
      }
    }

    setScreen('play')
  }

  const createGame = async (body: CreateGameBody) => {
    const game = await apiCall(() => apiClient.createGame(body))
    if (game && body.players && body.players[0]) {
      // First player checked to exist - safe to use non-null assertion
      await joinGame(game.id, body.players[0])
    }
  }

  const makeMove = useCallback(async (move: MoveBody): Promise<boolean> => {
    if (!currentGame) {
      logger.warn('Cannot make move: currentGame is null')
      return false
    }

    logger.debug('Making move:', { move, currentMoves: currentGame.moves.length })
    const result = await apiCall(() => apiClient.makeMove(currentGame.id, move))

    if (result) {
      logger.info('Move successful:', {
        word: move.word,
        playerId: move.playerId,
        totalMoves: result.moves.length,
        previousMoves: currentGame.moves.length,
      })
      // CRITICAL FIX: Update local state immediately with the move result
      // Don't rely solely on WebSocket broadcast which has 50ms delay
      setCurrentGame(result)
      return true
    }
    else {
      logger.error('Move failed: result is null')
      return false
    }
  }, [currentGame, apiClient, apiCall])

  // AI Player automation
  // Integrated into useGameClient for consistent state management
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
        const suggestions = await apiClient.getSuggestions(currentGame.id, GAME_CONFIG.MAX_SUGGESTIONS_DISPLAY)

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
        const errorMessage = error instanceof Error ? translateErrorMessage(error.message) : ERROR_MESSAGES.AI_MOVE_FAILED
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

  const quickStart = async () => {
    const words = await apiCall(() => apiClient.getRandomWords(5, 1))
    if (words && words[0]) {
      const name = `Player_${Date.now()}`
      // First word checked to exist above - safe to use non-null assertion
      await createGame({
        size: 5,
        baseWord: words[0],
        players: [name, 'Player 2'],
      })
    }
  }

  const quickStartVsAI = async () => {
    const words = await apiCall(() => apiClient.getRandomWords(5, 1))
    if (words && words[0]) {
      const name = `Player_${Date.now()}`
      // First word checked to exist above - safe to use non-null assertion
      await createGame({
        size: 5,
        baseWord: words[0],
        players: [name, 'Computer'],
        aiPlayers: ['Computer'],
      })
    }
  }

  const isMyTurn = () => {
    // currentPlayerIndex is guaranteed to be valid game state
    return !!currentGame && playerName === currentGame.players[currentGame.currentPlayerIndex]!
  }

  return {
    // State
    screen,
    gameId,
    games,
    currentGame,
    playerName,
    loading,
    error,
    aiThinking,
    aiError,

    // Actions
    setScreen,
    setError,
    loadGames,
    createGame,
    joinGame,
    makeMove,
    quickStart,
    quickStartVsAI,

    // Helpers
    isMyTurn,
    apiClient,
  }
}
