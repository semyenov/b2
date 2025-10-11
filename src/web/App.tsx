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

      // First letter: can be any letter on board (no adjacency requirement)
      if (wordPath.length === 0) {
        // Check if cell has a letter (existing or the selected cell with new letter)
        const hasLetter = currentGame.board[row][col] || (row === selectedCell.row && col === selectedCell.col)
        if (hasLetter) {
          setWordPath([{ row, col }])
        }
      } else {
        // Subsequent letters: must be orthogonally adjacent to last letter in path
        const lastPos = wordPath[wordPath.length - 1]
        const isAdjacent = (Math.abs(row - lastPos.row) === 1 && col === lastPos.col) ||
                           (Math.abs(col - lastPos.col) === 1 && row === lastPos.row)

        const hasLetter = currentGame.board[row][col] || (row === selectedCell.row && col === selectedCell.col)
        if (isAdjacent && hasLetter) {
          setWordPath([...wordPath, { row, col }])
        }
      }
    }
  }

  const handleLetterSelect = (letter: string) => {
    if (selectedCell && !selectedLetter) {
      setSelectedLetter(letter)
      // DO NOT auto-add to path - user must explicitly click cells to build word
      setWordPath([])
    }
  }

  const handleClearSelection = () => {
    setSelectedCell(undefined)
    setSelectedLetter('')
    setWordPath([])
  }

  const handleSuggestionSelect = (suggestion: Suggestion) => {
    if (!currentGame) return

    setSelectedCell(suggestion.position)
    setSelectedLetter(suggestion.letter)

    // Build word path from suggestion using path-finding
    const path = findWordPath(
      currentGame.board,
      suggestion.position,
      suggestion.letter,
      suggestion.word.toUpperCase()
    )

    if (path) {
      setWordPath(path)
    }
    setShowSuggestions(false)
  }

  // Find path for a word on the board (with new letter placed)
  const findWordPath = (
    board: (string | null)[][],
    newLetterPos: { row: number; col: number },
    newLetter: string,
    word: string
  ): Array<{ row: number; col: number }> | null => {
    const rows = board.length
    const cols = board[0].length

    // Create a copy of board with the new letter
    const tempBoard = board.map(row => [...row])
    tempBoard[newLetterPos.row][newLetterPos.col] = newLetter

    // Try to find the word starting from each cell
    for (let startRow = 0; startRow < rows; startRow++) {
      for (let startCol = 0; startCol < cols; startCol++) {
        if (tempBoard[startRow][startCol] === word[0]) {
          const path = dfsWordSearch(
            tempBoard,
            word,
            startRow,
            startCol,
            new Set<string>(),
            [{ row: startRow, col: startCol }]
          )
          if (path) return path
        }
      }
    }

    return null
  }

  // DFS to search for word path
  const dfsWordSearch = (
    board: (string | null)[][],
    word: string,
    row: number,
    col: number,
    visited: Set<string>,
    path: Array<{ row: number; col: number }>
  ): Array<{ row: number; col: number }> | null => {
    if (path.length === word.length) {
      return path
    }

    const key = `${row},${col}`
    visited.add(key)

    const nextChar = word[path.length]
    const directions = [[-1, 0], [1, 0], [0, -1], [0, 1]] // orthogonal only

    for (const [dr, dc] of directions) {
      const newRow = row + dr
      const newCol = col + dc
      const newKey = `${newRow},${newCol}`

      if (
        newRow >= 0 && newRow < board.length &&
        newCol >= 0 && newCol < board[0].length &&
        !visited.has(newKey) &&
        board[newRow][newCol] === nextChar
      ) {
        const result = dfsWordSearch(
          board,
          word,
          newRow,
          newCol,
          new Set(visited),
          [...path, { row: newRow, col: newCol }]
        )
        if (result) return result
      }
    }

    return null
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
    <div className="min-h-screen bg-gradient-to-b from-gray-900 to-gray-800">
      {/* Error banner */}
      {error && (
        <div className="fixed top-4 right-4 bg-red-700 text-white px-4 py-2 rounded-lg shadow-lg z-50">
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
            <div className="bg-gray-800 rounded-lg shadow-2xl p-12 border-2 border-gray-600">
              <h1 className="text-7xl font-bold text-cyan-400 mb-12 text-center tracking-wider">БАЛДА</h1>
              <div className="flex flex-col gap-4">
                <button
                  onClick={quickStart}
                  className="px-12 py-4 bg-green-600 hover:bg-green-700 border-2 border-green-500 rounded-lg text-xl font-bold text-white shadow-md hover:shadow-lg transition-all transform hover:scale-105"
                >
                  Быстрая игра 5x5
                </button>
                <button
                  onClick={() => setScreen('create')}
                  className="px-12 py-4 bg-blue-600 hover:bg-blue-700 border-2 border-blue-500 rounded-lg text-xl font-bold text-white shadow-md hover:shadow-lg transition-all transform hover:scale-105"
                >
                  Создать игру
                </button>
                <button
                  onClick={loadGames}
                  className="px-12 py-4 bg-purple-600 hover:bg-purple-700 border-2 border-purple-500 rounded-lg text-xl font-bold text-white shadow-md hover:shadow-lg transition-all transform hover:scale-105"
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
          <div className="h-screen flex flex-col bg-gradient-to-b from-gray-900 to-gray-800">
            {/* Header */}
            <div className="bg-gray-800 border-b border-gray-700 px-4 py-2 flex justify-between items-center">
              <button
                onClick={() => {
                  setScreen('menu')
                  setCurrentGame(null)
                  setPlayerName('')
                  setGameId('')
                  handleClearSelection()
                }}
                className="px-3 py-1.5 bg-gray-700 hover:bg-gray-600 border border-gray-600 rounded text-sm font-semibold transition text-gray-200"
              >
                ← Выход
              </button>
              <div className="flex items-center gap-4">
                <div>
                  <span className="text-gray-500 text-sm">Игра: </span>
                  <span className="text-cyan-400 font-mono font-bold">{gameId}</span>
                </div>
                <div className="text-lg font-bold text-gray-300">
                  {Math.floor(currentGame.moves.length / 2)} ход
                </div>
              </div>
              {playerName && (
                <div className="px-3 py-1 bg-green-900 bg-opacity-30 border border-green-700 rounded">
                  <span className="text-green-400 font-semibold text-sm">{playerName}</span>
                </div>
              )}
            </div>

            {/* Main game area */}
            <div className="flex-1 flex p-3 gap-3 overflow-hidden">
              {/* Left player panel */}
              <div className="w-48 flex-shrink-0">
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
              <div className="w-48 flex-shrink-0">
                <PlayerPanel
                  game={currentGame}
                  playerIndex={1}
                  currentPlayerName={playerName}
                />
              </div>
            </div>

            {/* Bottom controls */}
            {playerName && (
              <div className="border-t-2 border-gray-700 bg-gray-900 p-2 shadow-lg">
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
              <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4">
                <div className="bg-gray-800 rounded-lg shadow-xl w-full max-w-lg max-h-[70vh] overflow-hidden border border-gray-600">
                  <div className="px-3 py-2 border-b border-gray-700 flex justify-between items-center bg-gray-750">
                    <h3 className="text-sm font-bold text-cyan-400">💡 Подсказки AI ({suggestions.length})</h3>
                    <button
                      onClick={() => setShowSuggestions(false)}
                      className="text-gray-400 hover:text-gray-200 text-xl w-6 h-6 flex items-center justify-center"
                    >
                      ×
                    </button>
                  </div>
                  <div className="p-3">
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