import { CreateGame } from './components/CreateGame'
import { GameList } from './components/GameList'
import { GamePanel } from './components/GamePanel'
import { PlayerScoreBar } from './components/PlayerScoreBar'
import { useAIPlayer } from './hooks/useAIPlayer'
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
    quickStartVsAI,
    isMyTurn,
    apiClient,
  } = useGameClient()

  // AI player automation
  const { aiThinking, aiError } = useAIPlayer({
    currentGame,
    apiClient,
  })

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
        <div className="fixed top-4 right-4 bg-red-700 text-white px-4 py-3 rounded-lg shadow-depth-3 z-50 border-2 border-red-600">
          <div className="flex items-center gap-2">
            <span className="text-base">{error}</span>
            <button onClick={() => setError('')} className="ml-4 hover:bg-red-800 px-2 py-1 rounded transition-all duration-200">
              ✕
            </button>
          </div>
        </div>
      )}

      {/* Loading indicator */}
      {loading && (
        <div className="fixed top-4 right-4 bg-blue-600 text-white px-4 py-3 rounded-lg shadow-depth-3 z-50 border-2 border-blue-500">
          <div className="flex items-center gap-2">
            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
            <span className="text-base">Loading...</span>
          </div>
        </div>
      )}

      {/* AI Error banner */}
      {aiError && (
        <div className="fixed top-16 right-4 bg-yellow-700 text-white px-4 py-3 rounded-lg shadow-depth-3 z-50 border-2 border-yellow-600">
          <div className="flex items-center gap-2">
            <span className="text-base">
              🤖
              {aiError}
            </span>
          </div>
        </div>
      )}

      {/* Main content */}
      <div className="max-w-7xl mx-auto">
        {screen === 'menu' && (
          <div className="flex flex-col items-center justify-center min-h-screen px-4">
            {/* Hero Section */}
            <div className="text-center mb-12 animate-fade-in">
              <h1 className="text-6xl md:text-7xl font-black text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 via-blue-400 to-purple-500 mb-4 tracking-tight drop-shadow-2xl">
                БАЛДА
              </h1>
              <p className="text-gray-400 text-base md:text-lg font-medium tracking-wide">
                Словесная игра для ума
              </p>
            </div>

            {/* Menu Card */}
            <div className="w-full max-w-md">
              <div className="bg-gradient-to-br from-gray-800 to-gray-900 rounded-lg shadow-depth-4 p-8 border-2 border-gray-700 backdrop-blur-sm">
                <div className="space-y-3">
                  {/* Quick Start */}
                  <button
                    onClick={quickStart}
                    className="w-full group relative px-8 py-4 bg-gradient-to-r from-green-600 to-green-700 hover:from-green-500 hover:to-green-600 rounded-lg text-lg font-bold text-white shadow-depth-2 hover:shadow-depth-3 transition-all duration-200 transform hover:scale-105 overflow-hidden"
                  >
                    <div className="absolute inset-0 bg-white opacity-0 group-hover:opacity-20 transition-opacity duration-200"></div>
                    <div className="relative flex items-center justify-center gap-3">
                      <span className="text-xl">⚡</span>
                      <span>Быстрая игра 5×5</span>
                    </div>
                  </button>

                  {/* AI Game */}
                  <button
                    onClick={quickStartVsAI}
                    className="w-full group relative px-8 py-4 bg-gradient-to-r from-yellow-600 to-amber-600 hover:from-yellow-500 hover:to-amber-500 rounded-lg text-lg font-bold text-white shadow-depth-2 hover:shadow-depth-3 transition-all duration-200 transform hover:scale-105 overflow-hidden"
                  >
                    <div className="absolute inset-0 bg-white opacity-0 group-hover:opacity-20 transition-opacity duration-200"></div>
                    <div className="relative flex items-center justify-center gap-3">
                      <span className="text-xl">🤖</span>
                      <span>Играть с AI</span>
                    </div>
                  </button>

                  {/* Divider */}
                  <div className="flex items-center gap-3 py-2">
                    <div className="flex-1 h-px bg-gradient-to-r from-transparent via-gray-600 to-transparent"></div>
                    <span className="text-gray-500 text-sm font-medium">или</span>
                    <div className="flex-1 h-px bg-gradient-to-r from-transparent via-gray-600 to-transparent"></div>
                  </div>

                  {/* Create Game */}
                  <button
                    onClick={() => setScreen('create')}
                    className="w-full group relative px-8 py-4 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-500 hover:to-blue-600 rounded-lg text-base font-bold text-white shadow-depth-2 hover:shadow-depth-3 transition-all duration-200 transform hover:scale-105 overflow-hidden"
                  >
                    <div className="absolute inset-0 bg-white opacity-0 group-hover:opacity-20 transition-opacity duration-200"></div>
                    <div className="relative flex items-center justify-center gap-3">
                      <span className="text-lg">➕</span>
                      <span>Создать игру</span>
                    </div>
                  </button>

                  {/* Join Game */}
                  <button
                    onClick={loadGames}
                    className="w-full group relative px-8 py-4 bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-500 hover:to-purple-600 rounded-lg text-base font-bold text-white shadow-depth-2 hover:shadow-depth-3 transition-all duration-200 transform hover:scale-105 overflow-hidden"
                  >
                    <div className="absolute inset-0 bg-white opacity-0 group-hover:opacity-20 transition-opacity duration-200"></div>
                    <div className="relative flex items-center justify-center gap-3">
                      <span className="text-lg">🎮</span>
                      <span>Присоединиться</span>
                    </div>
                  </button>
                </div>
              </div>

              {/* Version/Footer */}
              <div className="text-center mt-6 text-gray-600 text-sm">
                Версия 2.0 • Сделано с ❤️
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
            {/* Compact Header */}
            <div className="bg-gray-800 border-b-2 border-gray-700 px-6 py-3 flex justify-between items-center shadow-depth-3 relative z-10">
              <button
                onClick={handleExitToMenu}
                className="px-4 py-2 bg-gray-700 hover:bg-gray-600 border-2 border-gray-600 rounded-lg text-base font-bold transition-all duration-200 hover:shadow-depth-2 hover:scale-105 text-gray-200"
              >
                ← Выход
              </button>

              <div className="flex items-center gap-4">
                <div className="text-base font-bold text-gray-200 bg-gray-700 px-4 py-2 rounded-lg shadow-depth-1 border-2 border-gray-600">
                  Ход
                  {' '}
                  {Math.floor(currentGame.moves.length / 2) + 1}
                </div>
                {aiThinking && (
                  <div className="px-3 py-2 bg-yellow-900 bg-opacity-40 border-2 border-yellow-600 rounded-lg shadow-depth-2 glow-warning animate-pulse">
                    <span className="text-yellow-300 font-bold text-base">🤖 AI думает...</span>
                  </div>
                )}
              </div>

              {playerName && (
                <div className="px-4 py-2 bg-green-900 bg-opacity-40 border-2 border-green-600 rounded-lg shadow-depth-1 glow-success">
                  <span className="text-green-300 font-bold text-base">{playerName}</span>
                </div>
              )}
            </div>

            {/* Main game area - Centered single column */}
            <div className="flex-1 overflow-auto py-6">
              <div className="max-w-6xl mx-auto px-6 space-y-4">
                {/* Player Score Bar */}
                <PlayerScoreBar
                  game={currentGame}
                  currentPlayerName={playerName}
                />

                {/* Game Panel */}
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
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
