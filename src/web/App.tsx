import { CreateGame } from './components/CreateGame'
import { GameList } from './components/GameList'
import { GamePanel } from './components/GamePanel'
import { PlayerPanel } from './components/PlayerPanel'
import { useGameClient } from './hooks/useGameClient'
import { useGameInteraction } from './hooks/useGameInteraction'
import { useSuggestions } from './hooks/useSuggestions'

export function App() {
  // Core game client logic
  const {
    screen,
    gameId,
    games,
    currentGame,
    playerName,
    loading,
    error,
    setScreen,
    setError,
    loadGames,
    createGame,
    joinGame,
    makeMove: makeApiMove,
    quickStart,
    isMyTurn,
    apiClient,
  } = useGameClient()

  // Suggestions logic
  const {
    suggestions,
    loadingSuggestions,
    loadSuggestions,
    clearSuggestions,
  } = useSuggestions({
    apiClient,
    currentGame,
    playerName,
    screen,
  })

  // UI interaction logic
  const {
    selectedCell,
    selectedLetter,
    wordPath,
    handleCellClick,
    handleLetterSelect,
    handleClearSelection,
    handleSuggestionSelect,
    clearAll,
  } = useGameInteraction({
    currentGame,
    isMyTurn,
  })

  // Wrapper to clear selections after move
  const makeMove = async (move: Parameters<typeof makeApiMove>[0]) => {
    await makeApiMove(move)
    clearSuggestions()
    clearAll()
  }

  // Handle exit to menu
  const handleExitToMenu = () => {
    setScreen('menu')
    clearSuggestions()
    clearAll()
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
        <div className="fixed top-4 right-4 bg-blue-600 text-white px-4 py-2 rounded-lg shadow-lg z-50">
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
            <div className="bg-gray-800 border-b-2 border-gray-700 px-4 py-2.5 flex justify-between items-center shadow-depth-4 relative z-10">
              <button
                onClick={handleExitToMenu}
                className="px-4 py-1.5 bg-gray-700 hover:bg-gray-600 border border-gray-600 rounded-lg text-sm font-bold transition-all duration-200 hover:shadow-depth-2 hover:scale-105 text-gray-200"
              >
                ← Выход
              </button>
              <div className="flex items-center gap-6">
                <div>
                  <span className="text-gray-500 text-xs uppercase tracking-wider">
                    Игра:
                  </span>
                  <span className="text-cyan-400 font-mono font-bold text-sm">
                    {gameId.substring(0, 8)}
                  </span>
                </div>
                <div className="text-xl font-bold text-gray-200 bg-gray-700 px-3 py-1 rounded-lg shadow-depth-1">
                  Ход
                  {' '}
                  {Math.floor(currentGame.moves.length / 2) + 1}
                </div>
              </div>
              {playerName && (
                <div className="px-4 py-1.5 bg-green-900 bg-opacity-40 border-2 border-green-600 rounded-lg shadow-depth-1 glow-green">
                  <span className="text-green-300 font-bold text-sm">{playerName}</span>
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

              {/* Center game panel (board + controls) */}
              {playerName && (
                <GamePanel
                  game={currentGame}
                  playerName={playerName}
                  onMove={makeMove}
                  onGetSuggestions={loadSuggestions}
                  disabled={!isMyTurn()}
                  selectedCell={selectedCell}
                  selectedLetter={selectedLetter}
                  wordPath={wordPath}
                  onCellClick={handleCellClick}
                  onLetterSelect={handleLetterSelect}
                  onClearSelection={handleClearSelection}
                  suggestions={suggestions}
                  loadingSuggestions={loadingSuggestions}
                  onSelectSuggestion={handleSuggestionSelect}
                />
              )}

              {/* Right player panel */}
              <div className="w-48 flex-shrink-0">
                <PlayerPanel
                  game={currentGame}
                  playerIndex={1}
                  currentPlayerName={playerName}
                />
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
