import { useMemo } from 'react'
import { Banner } from './components/Banner'
import { Board } from './components/Board'
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
  const { aiError } = useAIPlayer({
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
    <div className="min-h-screen bg-slate-900">
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
            <div className="text-center mb-12">
              <h1 className="text-6xl md:text-7xl font-black text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 via-blue-400 to-purple-500 mb-4 tracking-tight">
                БАЛДА
              </h1>
              <p className="text-slate-400 text-base md:text-lg font-medium tracking-wide">
                Словесная игра для ума
              </p>
            </div>

            {/* Menu Card */}
            <div className="w-full max-w-md">
              <div className="bg-slate-800 p-[var(--spacing-resp-lg)] border-2 border-slate-700">
                <div className="space-y-3">
                  <MenuButton label="Быстрая игра 5×5" variant="success" size="large" onClick={quickStart} />
                  <MenuButton label="Играть с AI" variant="warning" size="large" onClick={quickStartVsAI} />

                  {/* Divider */}
                  <div className="flex items-center gap-3 py-2">
                    <div className="flex-1 h-px bg-slate-600"></div>
                    <span className="text-slate-500 text-sm font-medium">или</span>
                    <div className="flex-1 h-px bg-slate-600"></div>
                  </div>

                  <MenuButton label="Создать игру" variant="primary" onClick={() => setScreen('create')} />
                  <MenuButton label="Присоединиться" variant="secondary" onClick={loadGames} />
                </div>
              </div>

              {/* Version/Footer */}
              <div className="text-center mt-6 text-slate-600 text-sm">
                Версия 2.0
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
          <div className="relative h-screen flex flex-col bg-gradient-to-b from-slate-900 to-slate-800">
            {/* Main game area - Responsive layout: mobile stack, desktop three-column */}
            <div className="flex-1 flex flex-col lg:grid lg:grid-cols-[minmax(260px,var(--size-resp-panel))_1fr_minmax(260px,var(--size-resp-panel))] gap-0 p-0 overflow-hidden relative w-full">
              {/* Mobile: Players side-by-side, Desktop: Player 1 left sidebar */}
              <div className="flex lg:contents gap-0 min-h-0 lg:col-start-1 lg:col-end-2 h-full">
                <div className="flex-1 lg:flex-none min-h-0 h-full p-[var(--spacing-resp-md)]">
                  <PlayerPanel
                    game={currentGame}
                    playerIndex={0}
                    currentPlayerName={playerName}
                  />
                </div>
                <div className="flex-1 lg:hidden min-h-0 h-full p-[var(--spacing-resp-md)]">
                  <PlayerPanel
                    game={currentGame}
                    playerIndex={1}
                    currentPlayerName={playerName}
                  />
                </div>
              </div>

              {/* Center: Board Only */}
              <div className="h-full min-h-0 flex items-center justify-center relative lg:col-start-2 lg:col-end-3 p-[var(--spacing-resp-md)]">
                <div className="board-container max-w-full max-h-full w-full h-full flex items-center justify-center">
                  <div className="board-wrapper shadow-depth-3 overflow-hidden">
                    <Board
                      game={currentGame}
                      selectedCell={selectedCell}
                      selectedLetter={selectedLetter}
                      wordPath={wordPath}
                      onCellClick={handleCellClick}
                      disabled={!isMyTurn()}
                    />
                  </div>
                </div>
              </div>

              {/* Desktop only: Player 2 right sidebar */}
              <div className="hidden lg:block min-h-0 h-full lg:col-start-3 lg:col-end-4 p-[var(--spacing-resp-md)]">
                <PlayerPanel
                  game={currentGame}
                  playerIndex={1}
                  currentPlayerName={playerName}
                />
              </div>
            </div>

            {/* Alphabet / Suggestions Panel - absolutely positioned at bottom */}
            {playerName && currentGame && (
              <GamePanel
                game={currentGame}
                playerName={playerName}
                disabled={!isMyTurn()}
                selectedCell={selectedCell}
                selectedLetter={selectedLetter}
                wordPath={wordPath}
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

            {/* Bottom control panel - Enhanced symmetrical design */}
            <div className="shrink-0 shadow-depth-3 overflow-hidden relative z-control-bar">
              {/* Control Buttons Bar */}
              <div className="bg-slate-900 border-t-2 border-slate-700 px-[var(--spacing-resp-md)] sm:px-[var(--spacing-resp-lg)] py-[var(--spacing-resp-md)] w-full">
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
                    onExit={handleExitToMenu}
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
