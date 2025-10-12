import { useMemo } from 'react'
import { Banner } from './components/Banner'
import { ControlButtons } from './components/ControlButtons'
import { CreateGame } from './components/CreateGame'
import { GameList } from './components/GameList'
import { GamePanel } from './components/GamePanel'
import { MenuButton } from './components/MenuButton'
import { PlayerPanel } from './components/PlayerPanel'
import { useAIPlayer } from './hooks/useAIPlayer'
import { useGameClient } from './hooks/useGameClient'
import { useGameControls } from './hooks/useGameControls'
import { useGameInteraction } from './hooks/useGameInteraction'
import { useLiveRegion } from './hooks/useLiveRegion'
import { useSuggestions } from './hooks/useSuggestions'
import { buildMoveBody, canSubmitMove } from './utils/moveValidation'
import { getFormedWord } from './utils/wordUtils'

export function App() {
  // Core game client logic
  const {
    screen,
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

  // Game controls (extracted to hook)
  const { showSuggestions, toggleSuggestions, hideSuggestions, makeMove, handleExitToMenu } = useGameControls({
    makeApiMove,
    clearSuggestions,
    clearInteraction: clearAll,
    setScreen,
    loadSuggestions,
    suggestions,
    loadingSuggestions,
  })

  // Live region for accessibility (extracted to hook)
  const liveRegionMessage = useLiveRegion({
    currentGame,
    screen,
    isMyTurn,
  })

  // Memoize formed word for display
  const formedWord = useMemo(
    () => getFormedWord(currentGame, selectedCell, selectedLetter, wordPath),
    [currentGame, selectedCell, selectedLetter, wordPath],
  )

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-900 to-gray-800">
      {/* Screen reader live region for game announcements */}
      <div
        className="sr-only"
        role="status"
        aria-live="polite"
        aria-atomic="true"
      >
        {liveRegionMessage}
      </div>

      {/* Banners */}
      {error && <Banner variant="error" message={error} onClose={() => setError('')} />}
      {loading && <Banner variant="loading" message="Загрузка..." />}
      {aiError && (
        <div className="fixed top-16 right-4">
          <Banner variant="warning" message={aiError} />
        </div>
      )}

      {/* Main content */}
      <div className="mx-auto">
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
                  <MenuButton icon="⚡" label="Быстрая игра 5×5" variant="success" size="large" onClick={quickStart} />
                  <MenuButton icon="🤖" label="Играть с AI" variant="warning" size="large" onClick={quickStartVsAI} />

                  {/* Divider */}
                  <div className="flex items-center gap-3 py-2">
                    <div className="flex-1 h-px bg-gradient-to-r from-transparent via-gray-600 to-transparent"></div>
                    <span className="text-gray-500 text-sm font-medium">или</span>
                    <div className="flex-1 h-px bg-gradient-to-r from-transparent via-gray-600 to-transparent"></div>
                  </div>

                  <MenuButton icon="➕" label="Создать игру" variant="primary" onClick={() => setScreen('create')} />
                  <MenuButton icon="🎮" label="Присоединиться" variant="secondary" onClick={loadGames} />
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
            {/* Main game area - Responsive layout: mobile stack, desktop three-column */}
            <div className="flex-1 flex flex-col lg:grid lg:grid-cols-[var(--size-resp-panel)_1fr_var(--size-resp-panel)] gap-[var(--spacing-resp-lg)] p-[var(--spacing-resp-md)] lg:p-[var(--spacing-resp-xl)] overflow-hidden">
              {/* Mobile: Players side-by-side, Desktop: Player 1 left sidebar */}
              <div className="flex lg:contents gap-[var(--spacing-resp-sm)] min-h-0">
                <div className="flex-1 lg:flex-none min-h-0">
                  <PlayerPanel
                    game={currentGame}
                    playerIndex={0}
                    currentPlayerName={playerName}
                  />
                </div>
                <div className="flex-1 lg:hidden min-h-0">
                  <PlayerPanel
                    game={currentGame}
                    playerIndex={1}
                    currentPlayerName={playerName}
                  />
                </div>
              </div>

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
                  showSuggestions={showSuggestions}
                  suggestions={suggestions}
                  loadingSuggestions={loadingSuggestions}
                  onSuggestionSelect={(suggestion) => {
                    handleSuggestionSelect(suggestion)
                    hideSuggestions()
                  }}
                />
              )}

              {/* Desktop only: Player 2 right sidebar */}
              <div className="hidden lg:block min-h-0">
                <PlayerPanel
                  game={currentGame}
                  playerIndex={1}
                  currentPlayerName={playerName}
                />
              </div>
            </div>

            {/* Control buttons bar - fixed at bottom */}
            <div className="shrink-0 bg-gray-800 border-t-2 border-gray-700 shadow-depth-3 overflow-hidden">
              {/* Buttons Bar */}
              <div className="px-[var(--spacing-resp-sm)] sm:px-[var(--spacing-resp-lg)] py-[var(--spacing-resp-sm)] sm:py-[var(--spacing-resp-md)]">
                <div className="flex items-center justify-between gap-[var(--spacing-resp-sm)] sm:gap-[var(--spacing-resp-md)] min-w-0 flex-col sm:flex-row">
                  {/* Left: Exit Button */}
                  <button
                    type="button"
                    onClick={handleExitToMenu}
                    aria-label="Выйти в главное меню"
                    className="px-[var(--spacing-resp-sm)] sm:px-[var(--spacing-resp-md)] py-[var(--spacing-resp-xs)] bg-gray-700 hover:bg-gray-600 border-2 border-gray-600 text-[var(--text-resp-xs)] sm:text-[var(--text-resp-sm)] font-bold transition-all duration-200 hover:shadow-depth-2 hover:scale-105 text-gray-200 flex-shrink-0 w-full sm:w-auto"
                  >
                    ← Выход
                  </button>

                  {/* Center: Control Buttons or Status Messages */}
                  {playerName && currentGame && (
                    <ControlButtons
                      isMyTurn={isMyTurn()}
                      selectedCell={selectedCell}
                      selectedLetter={selectedLetter}
                      wordPath={wordPath}
                      formedWord={formedWord}
                      showSuggestions={showSuggestions}
                      suggestions={suggestions}
                      onSubmitMove={() => {
                        if (canSubmitMove(selectedCell, selectedLetter, wordPath)) {
                          const moveBody = buildMoveBody(playerName, selectedCell!, selectedLetter!, formedWord)
                          makeMove(moveBody)
                        }
                      }}
                      onClearSelection={handleClearSelection}
                      onToggleSuggestions={toggleSuggestions}
                    />
                  )}

                  {/* Right: Info Badges */}
                  <div className="flex items-center gap-[var(--spacing-resp-sm)] min-w-0 flex-shrink-0">
                    <div className="text-[var(--text-resp-xs)] font-bold text-gray-200 bg-gray-700 px-[var(--spacing-resp-md)] py-[var(--spacing-resp-xs)] shadow-depth-1 border-2 border-gray-600 flex-shrink-0">
                      Ход
                      {' '}
                      {Math.floor(currentGame.moves.length / 2) + 1}
                    </div>
                    {aiThinking && (
                      <div className="px-[var(--spacing-resp-md)] py-[var(--spacing-resp-xs)] bg-yellow-900 bg-opacity-40 border-2 border-yellow-600 shadow-depth-2 glow-warning animate-pulse flex-shrink-0">
                        <span className="text-yellow-300 font-bold text-[var(--text-resp-sm)]">🤖 AI</span>
                      </div>
                    )}
                    {playerName && (
                      <div className="px-[var(--spacing-resp-md)] py-[var(--spacing-resp-xs)] bg-gray-700 border-2 border-cyan-600 border-opacity-50 shadow-depth-1 max-w-[clamp(150px,20vw,200px)] flex-shrink-0 min-w-0">
                        <span className="text-cyan-300 font-bold text-[var(--text-resp-xs)] truncate block" title={playerName}>
                          {playerName}
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>

          </div>
        )}
      </div>
    </div>
  )
}
