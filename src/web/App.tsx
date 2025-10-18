import { Banner } from '@components'
import { lazy, Suspense } from 'react'
import { Spinner } from './components/ui'
import { LOADING_MESSAGES } from './constants/messages'
import { useGameClient } from './hooks/useGameClient'
import { useGameControls } from './hooks/useGameControls'
import { useGameInteraction } from './hooks/useGameInteraction'
import { useLiveRegion } from './hooks/useLiveRegion'
import { useSuggestions } from './hooks/useSuggestions'

// Lazy-load screen components for code splitting
// This reduces initial bundle size by ~40 kB
const MenuScreen = lazy(() => import('./components/screens/MenuScreen').then(m => ({ default: m.MenuScreen })))
const CreateGame = lazy(() => import('./components/forms/CreateGame').then(m => ({ default: m.CreateGame })))
const GameList = lazy(() => import('./components/forms/GameList').then(m => ({ default: m.GameList })))
const GameScreen = lazy(() => import('./components/screens/GameScreen').then(m => ({ default: m.GameScreen })))

export function App() {
  // Core game client logic (now includes AI automation)
  const {
    screen,
    games,
    currentGame,
    playerName,
    loading,
    error,
    aiError,
    setScreen,
    setError,
    loadGames,
    createGame,
    joinGame,
    makeMove: makeApiMove,
    quickStart,
    quickStartVsAI,
    restartWithNewWord,
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

  return (
    <div className="min-h-screen bg-surface-900">
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
      {loading && <Banner variant="loading" message={LOADING_MESSAGES.DEFAULT} />}
      {aiError && (
        <div className="fixed top-16 right-4">
          <Banner variant="warning" message={aiError} />
        </div>
      )}

      {/* Main content with lazy-loaded screens */}
      <div className="mx-auto">
        <Suspense fallback={(
          <div className="flex items-center justify-center min-h-screen">
            <Spinner size="lg" label={LOADING_MESSAGES.DEFAULT} />
          </div>
        )}
        >
          {screen === 'menu' && (
            <MenuScreen
              onQuickStart={quickStart}
              onQuickStartVsAI={quickStartVsAI}
              onCreateGame={() => setScreen('create')}
              onJoinGame={loadGames}
            />
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

          {screen === 'play' && currentGame && playerName && (
            <GameScreen
              game={currentGame}
              playerName={playerName}
              isMyTurn={isMyTurn()}
              selectedCell={selectedCell}
              selectedLetter={selectedLetter}
              wordPath={wordPath}
              showSuggestions={showSuggestions}
              suggestions={suggestions}
              loadingSuggestions={loadingSuggestions}
              onCellClick={handleCellClick}
              onLetterSelect={handleLetterSelect}
              onSuggestionSelect={handleSuggestionSelect}
              onSubmitMove={makeMove}
              onClearSelection={handleClearSelection}
              onToggleSuggestions={toggleSuggestions}
              onHideSuggestions={hideSuggestions}
              onExit={handleExitToMenu}
              onRestartWithNewWord={restartWithNewWord}
            />
          )}
        </Suspense>
      </div>
    </div>
  )
}
