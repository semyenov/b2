import { Banner } from './components/Banner'
import { CreateGame } from './components/CreateGame'
import { GameList } from './components/GameList'
import { GameScreen, MenuScreen } from './components/screens'
import { useAIPlayer } from './hooks/useAIPlayer'
import { useGameClient } from './hooks/useGameClient'
import { useGameControls } from './hooks/useGameControls'
import { useGameInteraction } from './hooks/useGameInteraction'
import { useLiveRegion } from './hooks/useLiveRegion'
import { useSuggestions } from './hooks/useSuggestions'

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
          />
        )}
      </div>
    </div>
  )
}
