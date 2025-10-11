import type { CreateGameBody, GameState, MoveBody, Suggestion } from './lib/client'
import { useEffect, useRef, useState } from 'react'
import { Board } from './components/Board'
import { CreateGame } from './components/CreateGame'
import { GameInfo } from './components/GameInfo'
import { GameList } from './components/GameList'
import { MoveInput } from './components/MoveInput'
import { Suggestions } from './components/Suggestions'
import { ApiClient } from './lib/client'

type Screen = 'menu' | 'list' | 'create' | 'play'

export function App() {
  // Core state
  const [screen, setScreen] = useState<Screen>('menu')
  const [gameId, setGameId] = useState<string>('')
  const [games, setGames] = useState<GameState[]>([])
  const [currentGame, setCurrentGame] = useState<GameState | null>(null)
  const [playerName, setPlayerName] = useState<string>('')

  // UI state
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string>('')
  const [suggestions, setSuggestions] = useState<Suggestion[]>([])
  const [showSuggestions, setShowSuggestions] = useState(false)
  const [loadingSuggestions, setLoadingSuggestions] = useState(false)
  const [selectedSuggestion, setSelectedSuggestion] = useState<Suggestion | undefined>()

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
        (updatedGame) => setCurrentGame(updatedGame),
        () => setError('Connection lost')
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
  const apiCall = async <T,>(fn: () => Promise<T>): Promise<T | null> => {
    setLoading(true)
    setError('')
    try {
      return await fn()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred')
      return null
    } finally {
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
    if (!game) return

    setCurrentGame(game)
    setPlayerName(name)
    setGameId(id)

    // Try to claim a slot if not already in game
    if (!game.players.includes(name)) {
      const slotIndex = game.players.findIndex(p => p.startsWith('Player ') && p !== 'Player 1')
      if (slotIndex !== -1) {
        const updated = await apiCall(() =>
          apiClient.updatePlayerName(id, game.players[slotIndex], name)
        )
        if (updated) setCurrentGame(updated)
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
    if (!currentGame) return
    const result = await apiCall(() => apiClient.makeMove(currentGame.id, move))
    if (result) {
      // Clear suggestions after successful move
      setSuggestions([])
      setShowSuggestions(false)
      setSelectedSuggestion(undefined)
    }
  }

  const loadSuggestions = async () => {
    if (!currentGame) return

    setLoadingSuggestions(true)
    try {
      const result = await apiClient.getSuggestions(currentGame.id, 10)
      setSuggestions(result)
      setShowSuggestions(true)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load suggestions')
    } finally {
      setLoadingSuggestions(false)
    }
  }

  const quickStart = async () => {
    const words = await apiCall(() => apiClient.getRandomWords(5, 1))
    if (words && words[0]) {
      const name = `Player_${Date.now()}`
      await createGame({
        size: 5,
        baseWord: words[0],
        players: [name, 'Player 2']
      })
    }
  }

  // Render helpers
  const isMyTurn = () => {
    return currentGame && playerName === currentGame.players[currentGame.currentPlayerIndex]
  }

  return (
    <div className="min-h-screen bg-gray-900 text-gray-100 p-4">
      {/* Error banner */}
      {error && (
        <div className="fixed top-4 right-4 bg-red-600 text-white px-4 py-2 rounded-lg shadow-lg z-50">
          <div className="flex items-center gap-2">
            <span>{error}</span>
            <button onClick={() => setError('')} className="ml-4 hover:bg-red-700 px-2 py-1 rounded">
              ✕
            </button>
          </div>
        </div>
      )}

      {/* Loading indicator */}
      {loading && (
        <div className="fixed top-4 left-4 bg-blue-600 text-white px-4 py-2 rounded-lg shadow-lg z-50">
          <div className="flex items-center gap-2">
            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
            <span>Loading...</span>
          </div>
        </div>
      )}

      {/* Main content */}
      <div className="max-w-7xl mx-auto">
        {screen === 'menu' && (
          <div className="flex flex-col items-center justify-center min-h-[80vh]">
            <h1 className="text-6xl font-bold text-cyan-400 mb-8">BALDA</h1>
            <div className="flex flex-col gap-4">
              <button
                onClick={quickStart}
                className="px-8 py-3 bg-green-600 hover:bg-green-700 rounded-lg text-xl font-semibold transition"
              >
                Quick Start 5x5
              </button>
              <button
                onClick={() => setScreen('create')}
                className="px-8 py-3 bg-blue-600 hover:bg-blue-700 rounded-lg text-xl font-semibold transition"
              >
                Create Game
              </button>
              <button
                onClick={loadGames}
                className="px-8 py-3 bg-purple-600 hover:bg-purple-700 rounded-lg text-xl font-semibold transition"
              >
                Join Game
              </button>
            </div>
          </div>
        )}

        {screen === 'create' && (
          <CreateGame
            onSubmit={createGame}
            onBack={() => setScreen('menu')}
          />
        )}

        {screen === 'list' && (
          <GameList
            games={games}
            onJoin={joinGame}
            onBack={() => setScreen('menu')}
          />
        )}

        {screen === 'play' && currentGame && (
          <div className="space-y-4">
            {/* Header */}
            <div className="bg-gray-800 rounded-lg p-4 flex justify-between items-center">
              <button
                onClick={() => {
                  setScreen('menu')
                  setCurrentGame(null)
                  setPlayerName('')
                  setGameId('')
                }}
                className="px-4 py-2 bg-gray-700 hover:bg-gray-600 rounded transition"
              >
                ← Back
              </button>
              <div className="text-center">
                <span className="text-gray-400">Game ID: </span>
                <span className="text-cyan-400 font-mono font-bold">{gameId}</span>
              </div>
              {playerName && (
                <div>
                  <span className="text-gray-400">Playing as: </span>
                  <span className="text-green-400 font-bold">{playerName}</span>
                </div>
              )}
            </div>

            {/* Game area */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
              <div className="lg:col-span-1">
                <GameInfo game={currentGame} currentPlayerName={playerName} />
              </div>

              <div className="lg:col-span-2 space-y-4">
                <Board game={currentGame} />

                {/* Suggestions toggle button */}
                {playerName && isMyTurn() && (
                  <div className="flex gap-2">
                    <button
                      onClick={loadSuggestions}
                      disabled={loadingSuggestions}
                      className="px-4 py-2 bg-yellow-600 hover:bg-yellow-700 rounded transition flex items-center gap-2"
                    >
                      {loadingSuggestions ? (
                        <>
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                          Loading...
                        </>
                      ) : (
                        <>💡 Get Suggestions</>
                      )}
                    </button>
                    {showSuggestions && suggestions.length > 0 && (
                      <button
                        onClick={() => setShowSuggestions(false)}
                        className="px-4 py-2 bg-gray-600 hover:bg-gray-700 rounded transition"
                      >
                        Hide Suggestions
                      </button>
                    )}
                  </div>
                )}

                {/* Suggestions display */}
                {showSuggestions && (
                  <Suggestions
                    suggestions={suggestions}
                    loading={loadingSuggestions}
                    onSelectSuggestion={(suggestion) => {
                      setSelectedSuggestion(suggestion)
                    }}
                  />
                )}

                {playerName && (
                  <MoveInput
                    game={currentGame}
                    playerName={playerName}
                    onMove={makeMove}
                    disabled={!isMyTurn()}
                    suggestion={selectedSuggestion}
                  />
                )}
              </div>
            </div>

            {/* Used words */}
            <div className="bg-gray-800 rounded-lg p-4">
              <h3 className="text-xl font-bold mb-4 text-purple-400">Used Words ({currentGame.usedWords.length})</h3>
              <div className="flex flex-wrap gap-2">
                {currentGame.usedWords.map((word, i) => (
                  <span key={i} className="px-2 py-1 bg-gray-700 rounded text-sm">
                    {word}
                  </span>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}