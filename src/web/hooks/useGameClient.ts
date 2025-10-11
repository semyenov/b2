import type { CreateGameBody, GameState, MoveBody } from '../lib/client'
import { useEffect, useRef, useState } from 'react'
import { ApiClient } from '../lib/client'

export type Screen = 'menu' | 'list' | 'create' | 'play'

interface UseGameClientReturn {
  // State
  screen: Screen
  gameId: string
  games: GameState[]
  currentGame: GameState | null
  playerName: string
  loading: boolean
  error: string

  // Actions
  setScreen: (screen: Screen) => void
  setError: (error: string) => void
  loadGames: () => Promise<void>
  createGame: (body: CreateGameBody) => Promise<void>
  joinGame: (id: string, name: string) => Promise<void>
  makeMove: (move: MoveBody) => Promise<void>
  quickStart: () => Promise<void>
  quickStartVsAI: () => Promise<void>

  // Helpers
  isMyTurn: () => boolean
  apiClient: ApiClient
}

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

  // Check server health on mount
  useEffect(() => {
    apiClient.getHealth().catch(() => {
      setError('Cannot connect to server. Make sure it\'s running on http://localhost:3000')
    })
  }, [apiClient])

  // WebSocket connection management
  useEffect(() => {
    if (screen === 'play' && gameId && !wsRef.current) {
      wsRef.current = apiClient.connectWebSocket(
        gameId,
        updatedGame => setCurrentGame(updatedGame),
        () => setError('Connection lost'),
      )
    }

    return () => {
      if (wsRef.current && screen !== 'play') {
        wsRef.current.close()
        wsRef.current = null
      }
    }
  }, [screen, gameId, apiClient])

  // API wrapper with error handling
  const apiCall = async <T>(fn: () => Promise<T>): Promise<T | null> => {
    setLoading(true)
    setError('')
    try {
      return await fn()
    }
    catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred')
      return null
    }
    finally {
      setLoading(false)
    }
  }

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
        const updated = await apiCall(() =>
          apiClient.updatePlayerName(id, game.players[slotIndex], name),
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
    if (game && body.players) {
      await joinGame(game.id, body.players[0])
    }
  }

  const makeMove = async (move: MoveBody) => {
    if (!currentGame) {
      return
    }
    const result = await apiCall(() => apiClient.makeMove(currentGame.id, move))
    if (!result) {
      // Error already set by apiCall
    }
  }

  const quickStart = async () => {
    const words = await apiCall(() => apiClient.getRandomWords(5, 1))
    if (words && words[0]) {
      const name = `Player_${Date.now()}`
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
      await createGame({
        size: 5,
        baseWord: words[0],
        players: [name, 'Computer'],
        aiPlayers: ['Computer'],
      })
    }
  }

  const isMyTurn = () => {
    return !!currentGame && playerName === currentGame.players[currentGame.currentPlayerIndex]
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
