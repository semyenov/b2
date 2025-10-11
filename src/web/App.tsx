import type { CreateGameBody, GameState, MoveBody, Suggestion } from './lib/client'
import { useEffect, useRef, useState } from 'react'
import { Board } from './components/Board'
import { BottomControls } from './components/BottomControls'
import { CreateGame } from './components/CreateGame'
import { GameList } from './components/GameList'
import { PlayerPanel } from './components/PlayerPanel'
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

  // Mouse interaction state
  const [selectedCell, setSelectedCell] = useState<{ row: number; col: number } | undefined>()
  const [selectedLetter, setSelectedLetter] = useState<string>('')
  const [wordPath, setWordPath] = useState<Array<{ row: number; col: number }>>([])

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
      // Clear interaction state after successful move
      setSuggestions([])
      setShowSuggestions(false)
      setSelectedCell(undefined)
      setSelectedLetter('')
      setWordPath([])
    }
  }

  // Mouse interaction handlers
  const handleCellClick = (row: number, col: number) => {
    if (!currentGame || !isMyTurn()) return

    // If no cell selected yet, select empty cell
    if (!selectedCell) {
      if (!currentGame.board[row][col]) {
        setSelectedCell({ row, col })
        setWordPath([])
      }
      return
    }

    // If we have cell and letter, build word path
    if (selectedLetter) {
      // Check if clicking the selected cell itself
      if (row === selectedCell.row && col === selectedCell.col) {
        // Add selected cell to path if not already there
        if (!wordPath.some(p => p.row === row && p.col === col)) {
          setWordPath([...wordPath, { row, col }])
        }
        return
      }

      // Check if cell is already in path
      const pathIndex = wordPath.findIndex(p => p.row === row && p.col === col)
      if (pathIndex >= 0) {
        // Remove from path by clicking again
        setWordPath(wordPath.slice(0, pathIndex))
        return
      }

      // Add to path if adjacent to last position
      const lastPos = wordPath.length > 0 ? wordPath[wordPath.length - 1] : selectedCell
      const isAdjacent = Math.abs(row - lastPos.row) <= 1 && Math.abs(col - lastPos.col) <= 1

      if (isAdjacent && currentGame.board[row][col]) {
        setWordPath([...wordPath, { row, col }])
      }
    }
  }

  const handleLetterSelect = (letter: string) => {
    if (selectedCell && !selectedLetter) {
      setSelectedLetter(letter)
      // Start word path with the selected cell
      setWordPath([selectedCell])
    }
  }

  const handleClearSelection = () => {
    setSelectedCell(undefined)
    setSelectedLetter('')
    setWordPath([])
  }

  const handleSuggestionSelect = (suggestion: Suggestion) => {
    setSelectedCell(suggestion.position)
    setSelectedLetter(suggestion.letter)
    // Build word path from suggestion
    const path: Array<{ row: number; col: number }> = []
    const word = suggestion.word.toUpperCase()
    const board = currentGame?.board

    if (!board) return

    // Simple path reconstruction (this is a simplified version)
    // In a real implementation, you'd use the same path-finding algorithm as the backend
    path.push(suggestion.position)
    setWordPath(path)
    setShowSuggestions(false)
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
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-blue-100">
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
          <div className="flex flex-col items-center justify-center min-h-screen">
            <div className="bg-white rounded-lg shadow-2xl p-12 border-2 border-gray-300">
              <h1 className="text-7xl font-bold text-blue-600 mb-12 text-center tracking-wider">БАЛДА</h1>
              <div className="flex flex-col gap-4">
                <button
                  onClick={quickStart}
                  className="px-12 py-4 bg-green-500 hover:bg-green-600 border-2 border-green-700 rounded-lg text-xl font-bold text-white shadow-md hover:shadow-lg transition-all transform hover:scale-105"
                >
                  Быстрая игра 5x5
                </button>
                <button
                  onClick={() => setScreen('create')}
                  className="px-12 py-4 bg-blue-500 hover:bg-blue-600 border-2 border-blue-700 rounded-lg text-xl font-bold text-white shadow-md hover:shadow-lg transition-all transform hover:scale-105"
                >
                  Создать игру
                </button>
                <button
                  onClick={loadGames}
                  className="px-12 py-4 bg-purple-500 hover:bg-purple-600 border-2 border-purple-700 rounded-lg text-xl font-bold text-white shadow-md hover:shadow-lg transition-all transform hover:scale-105"
                >
                  Присоединиться
                </button>
              </div>
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
          <div className="h-screen flex flex-col bg-gradient-to-b from-blue-50 to-blue-100">
            {/* Header */}
            <div className="bg-white border-b-2 border-gray-300 px-6 py-3 flex justify-between items-center shadow-md">
              <button
                onClick={() => {
                  setScreen('menu')
                  setCurrentGame(null)
                  setPlayerName('')
                  setGameId('')
                  handleClearSelection()
                }}
                className="px-4 py-2 bg-gray-200 hover:bg-gray-300 border border-gray-400 rounded font-semibold transition"
              >
                ← Выход
              </button>
              <div className="flex items-center gap-6">
                <div>
                  <span className="text-gray-600">Игра: </span>
                  <span className="text-blue-600 font-mono font-bold text-lg">{gameId}</span>
                </div>
                <div className="text-2xl font-bold text-gray-700">
                  {Math.floor(currentGame.moves.length / 2)} ход
                </div>
              </div>
              {playerName && (
                <div className="px-4 py-2 bg-green-100 border border-green-300 rounded">
                  <span className="text-green-700 font-bold">{playerName}</span>
                </div>
              )}
            </div>

            {/* Main game area */}
            <div className="flex-1 flex p-6 gap-4 overflow-hidden">
              {/* Left player panel */}
              <div className="w-64 flex-shrink-0">
                <PlayerPanel
                  game={currentGame}
                  playerIndex={0}
                  currentPlayerName={playerName}
                  isLeft={true}
                />
              </div>

              {/* Center board area */}
              <div className="flex-1 flex flex-col items-center justify-center">
                <Board
                  game={currentGame}
                  selectedCell={selectedCell}
                  selectedLetter={selectedLetter}
                  wordPath={wordPath}
                  onCellClick={handleCellClick}
                  disabled={!isMyTurn()}
                />
              </div>

              {/* Right player panel */}
              <div className="w-64 flex-shrink-0">
                <PlayerPanel
                  game={currentGame}
                  playerIndex={1}
                  currentPlayerName={playerName}
                />
              </div>
            </div>

            {/* Bottom controls */}
            {playerName && (
              <div className="border-t-2 border-gray-300 bg-white p-4 shadow-lg">
                <BottomControls
                  game={currentGame}
                  playerName={playerName}
                  onMove={makeMove}
                  onGetSuggestions={loadSuggestions}
                  disabled={!isMyTurn()}
                  selectedCell={selectedCell}
                  selectedLetter={selectedLetter}
                  wordPath={wordPath}
                  onLetterSelect={handleLetterSelect}
                  onClearSelection={handleClearSelection}
                />
              </div>
            )}

            {/* Suggestions modal */}
            {showSuggestions && (
              <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                <div className="bg-white rounded-lg shadow-xl max-w-2xl max-h-[80vh] overflow-hidden">
                  <div className="p-4 border-b flex justify-between items-center">
                    <h3 className="text-xl font-bold">Подсказки AI</h3>
                    <button
                      onClick={() => setShowSuggestions(false)}
                      className="text-gray-500 hover:text-gray-700 text-2xl"
                    >
                      ×
                    </button>
                  </div>
                  <div className="p-4 overflow-y-auto max-h-[60vh]">
                    <Suggestions
                      suggestions={suggestions}
                      loading={loadingSuggestions}
                      onSelectSuggestion={handleSuggestionSelect}
                    />
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}