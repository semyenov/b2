import { CreateGame } from './components/CreateGame'
import { GameList } from './components/GameList'
import { GamePanel } from './components/GamePanel'
import { PlayerPanel } from './components/PlayerPanel'
import { useAIPlayer } from './hooks/useAIPlayer'
import { useGameClient } from './hooks/useGameClient'
import { useGameInteraction } from './hooks/useGameInteraction'
import { useSuggestions } from './hooks/useSuggestions'
import { buildMoveBody, canSubmitMove, formWordFromPath } from './utils/moveValidation'

export function App() {
  // Core game client logic
  const {
    screen,
    // gameId,
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
        <div className="fixed top-4 right-4 bg-red-700 text-white px-4 py-3 shadow-depth-3 z-50 border-2 border-red-600">
          <div className="flex items-center gap-2">
            <span className="text-base">{error}</span>
            <button onClick={() => setError('')} className="ml-4 hover:bg-red-800 px-2 py-1 transition-all duration-200">
              ✕
            </button>
          </div>
        </div>
      )}

      {/* Loading indicator */}
      {loading && (
        <div className="fixed top-4 right-4 bg-blue-600 text-white px-4 py-3 shadow-depth-3 z-50 border-2 border-blue-500">
          <div className="flex items-center gap-2">
            <div className="animate-spin h-4 w-4 border-b-2 border-white"></div>
            <span className="text-base">Loading...</span>
          </div>
        </div>
      )}

      {/* AI Error banner */}
      {aiError && (
        <div className="fixed top-16 right-4 bg-yellow-700 text-white px-4 py-3 shadow-depth-3 z-50 border-2 border-yellow-600">
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
              <div className="bg-gradient-to-br from-gray-800 to-gray-900 shadow-depth-4 p-8 border-2 border-gray-700 backdrop-blur-sm">
                <div className="space-y-3">
                  {/* Quick Start */}
                  <button
                    onClick={quickStart}
                    className="w-full group relative px-8 py-4 bg-gradient-to-r from-green-600 to-green-700 hover:from-green-500 hover:to-green-600 text-lg font-bold text-white shadow-depth-2 hover:shadow-depth-3 transition-all duration-200 transform hover:scale-105 overflow-hidden"
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
                    className="w-full group relative px-8 py-4 bg-gradient-to-r from-yellow-600 to-amber-600 hover:from-yellow-500 hover:to-amber-500 text-lg font-bold text-white shadow-depth-2 hover:shadow-depth-3 transition-all duration-200 transform hover:scale-105 overflow-hidden"
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
                    className="w-full group relative px-8 py-4 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-500 hover:to-blue-600 text-base font-bold text-white shadow-depth-2 hover:shadow-depth-3 transition-all duration-200 transform hover:scale-105 overflow-hidden"
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
                    className="w-full group relative px-8 py-4 bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-500 hover:to-purple-600 text-base font-bold text-white shadow-depth-2 hover:shadow-depth-3 transition-all duration-200 transform hover:scale-105 overflow-hidden"
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
            {/* Header with Controls */}
            <div className="bg-gray-800 border-b-2 border-gray-700 px-6 py-4 shadow-depth-3 relative z-10">
              <div className="flex items-center justify-between gap-6">
                {/* Left: Exit Button */}
                <button
                  onClick={handleExitToMenu}
                  className="px-5 py-2 bg-gray-700 hover:bg-gray-600 border-2 border-gray-600 text-lg font-bold transition-all duration-200 hover:shadow-depth-2 hover:scale-105 text-gray-200"
                >
                  ← Выход
                </button>

                {/* Center: Control Buttons */}
                {playerName && currentGame && (
                  <div className="flex items-center gap-3 flex-1 justify-center">
                    <button
                      onClick={() => {
                        if (canSubmitMove(selectedCell, selectedLetter, wordPath)) {
                          const wordFormed = formWordFromPath(wordPath, currentGame.board, selectedCell, selectedLetter)
                          const moveBody = buildMoveBody(playerName, selectedCell!, selectedLetter!, wordFormed)
                          makeMove(moveBody)
                        }
                      }}
                      disabled={!canSubmitMove(selectedCell, selectedLetter, wordPath) || !isMyTurn()}
                      className={`px-8 py-2 font-bold text-lg transition-all duration-200 ${canSubmitMove(selectedCell, selectedLetter, wordPath) && isMyTurn()
                        ? 'bg-green-600 hover:bg-green-700 text-white shadow-depth-2 hover:shadow-depth-3 hover:scale-105'
                        : 'bg-gray-700 text-gray-500 cursor-not-allowed shadow-depth-1'
                      }`}
                    >
                      ✓ Подтвердить ход
                    </button>

                    <button
                      onClick={handleClearSelection}
                      disabled={!isMyTurn() || (!selectedCell && !selectedLetter && wordPath.length === 0)}
                      className="px-6 py-2 bg-gray-600 hover:bg-gray-500 text-white font-bold text-lg transition-all duration-200 hover:shadow-depth-2 hover:scale-105 disabled:opacity-40 disabled:cursor-not-allowed"
                    >
                      ✕ Отмена
                    </button>

                    <button
                      onClick={loadSuggestions}
                      disabled={!isMyTurn()}
                      className="px-6 py-2 bg-yellow-600 hover:bg-yellow-700 text-white font-bold text-lg transition-all duration-200 hover:shadow-depth-2 hover:scale-105 flex items-center justify-center gap-2 disabled:opacity-40 disabled:cursor-not-allowed relative"
                    >
                      💡 AI
                      {suggestions.length > 0 && (
                        <span className="absolute -top-1 -right-1 bg-red-600 text-white text-sm px-2 py-1 font-bold shadow-depth-2">
                          {suggestions.length}
                        </span>
                      )}
                    </button>
                  </div>
                )}

                {/* Right: Info Badges */}
                <div className="flex items-center gap-4">
                  <div className="text-lg font-bold text-gray-200 bg-gray-700 px-5 py-2 shadow-depth-1 border-2 border-gray-600">
                    Ход
                    {' '}
                    {Math.floor(currentGame.moves.length / 2) + 1}
                  </div>
                  {aiThinking && (
                    <div className="px-4 py-2 bg-yellow-900 bg-opacity-40 border-2 border-yellow-600 shadow-depth-2 glow-warning animate-pulse">
                      <span className="text-yellow-300 font-bold text-lg">🤖 AI</span>
                    </div>
                  )}
                  {playerName && (
                    <div className="px-5 py-2 bg-gray-700 border-2 border-cyan-600 border-opacity-50 shadow-depth-1">
                      <span className="text-cyan-300 font-bold text-lg">{playerName}</span>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Main game area - Three column layout */}
            <div className="flex-1 grid grid-cols-[300px_1fr_300px] gap-6 px-6 py-6 overflow-hidden">
              {/* Left: Player 1 */}
              <PlayerPanel
                game={currentGame}
                playerIndex={0}
                currentPlayerName={playerName}
                isLeft
              />

              {/* Center: Game Panel */}
              {playerName && (
                <GamePanel
                  game={currentGame}
                  playerName={playerName}
                  disabled={!isMyTurn()}
                  selectedCell={selectedCell}
                  selectedLetter={selectedLetter}
                  wordPath={wordPath}
                  onCellClick={handleCellClick}
                  onLetterSelect={handleLetterSelect}
                  suggestions={suggestions}
                  loadingSuggestions={loadingSuggestions}
                  onSelectSuggestion={handleSuggestionSelect}
                />
              )}

              {/* Right: Player 2 */}
              <PlayerPanel
                game={currentGame}
                playerIndex={1}
                currentPlayerName={playerName}
              />
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
