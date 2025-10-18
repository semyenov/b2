import type { CreateGameBody, GameState, MoveBody } from '@lib/client'
import type { Screen, UseGameClientReturn } from '@types'
import { ERROR_MESSAGES, translateErrorMessage } from '@constants/messages'
import { ApiClient } from '@lib/client'
import { logger } from '@utils/logger'
import { useCallback, useEffect, useRef, useState } from 'react'
import { useAIPlayer } from './useAIPlayer'

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

  // Refs
  const apiClient = useRef(new ApiClient()).current
  const wsRef = useRef<WebSocket | null>(null)
  const wsConnected = useRef(false)
  const lastUpdateTimestamp = useRef(0) // Track local updates to prevent race conditions

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

          // Skip WebSocket update if we just made a local move (within 200ms)
          // This prevents race conditions between local state updates and WebSocket broadcasts
          const timeSinceLastUpdate = Date.now() - lastUpdateTimestamp.current
          if (timeSinceLastUpdate < 200) {
            logger.debug('Skipping WebSocket update (local update recent)', {
              timeSinceLastUpdate,
              gameId: updatedGame.id,
            })
            return
          }

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
      // Update timestamp to prevent WebSocket race condition
      lastUpdateTimestamp.current = Date.now()

      // Update local state immediately with the move result
      // WebSocket broadcast will be skipped if it arrives within 200ms
      setCurrentGame(result)
      return true
    }
    else {
      logger.error('Move failed: result is null')
      return false
    }
  }, [currentGame, apiClient, apiCall])

  // AI Player automation - Extracted to separate hook for better separation of concerns
  const { aiThinking, aiError } = useAIPlayer({
    currentGame,
    makeMove,
    apiClient,
  })

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

  const restartWithNewWord = async () => {
    if (!currentGame || !playerName) {
      logger.warn('Cannot restart: no current game or player name')
      return
    }

    // Get current game parameters
    const { size, players, aiPlayers } = currentGame

    // Fetch a new random word matching the board size
    const words = await apiCall(() => apiClient.getRandomWords(size, 1))
    if (words && words[0]) {
      // Create new game with same parameters but new base word
      await createGame({
        size,
        baseWord: words[0],
        players,
        aiPlayers,
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
    restartWithNewWord,

    // Helpers
    isMyTurn,
    apiClient,
  }
}
