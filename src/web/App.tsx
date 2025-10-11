import { useCallback, useEffect, useRef, useState } from 'react'
import { Banner } from './components/Banner'
import { CreateGame } from './components/CreateGame'
import { GameList } from './components/GameList'
import { GamePanel } from './components/GamePanel'
import { MenuButton } from './components/MenuButton'
import { PlayerPanel } from './components/PlayerPanel'
import { StatusMessage } from './components/StatusMessage'
import { A11Y_LABELS, GAME_CONFIG } from './constants/game'
import { useAIPlayer } from './hooks/useAIPlayer'
import { useGameClient } from './hooks/useGameClient'
import { useGameInteraction } from './hooks/useGameInteraction'
import { useSuggestions } from './hooks/useSuggestions'
import { cn } from './utils/classNames'
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

  // Suggestions visibility toggle
  const [showSuggestions, setShowSuggestions] = useState(false)

  // Live region announcements for screen readers
  const [liveRegionMessage, setLiveRegionMessage] = useState<string>('')
  const previousTurnRef = useRef<number | null>(null)

  // Announce turn changes to screen readers
  useEffect(() => {
    if (!currentGame || screen !== 'play') {
      return
    }

    const currentTurn = currentGame.currentPlayerIndex
    if (previousTurnRef.current !== currentTurn) {
      previousTurnRef.current = currentTurn
      const currentPlayer = currentGame.players[currentTurn]

      if (isMyTurn()) {
        setLiveRegionMessage(A11Y_LABELS.YOUR_TURN)
      }
      else {
        setLiveRegionMessage(A11Y_LABELS.WAITING_FOR_OPPONENT(currentPlayer))
      }
    }
  }, [currentGame, screen, isMyTurn])

  // Toggle suggestions and load if not already loaded
  const toggleSuggestions = useCallback(() => {
    if (!showSuggestions && suggestions.length === 0 && !loadingSuggestions) {
      loadSuggestions()
    }
    setShowSuggestions(prev => !prev)
  }, [showSuggestions, suggestions.length, loadingSuggestions, loadSuggestions])

  // Wrapper to clear selections after move
  const makeMove = useCallback(async (move: Parameters<typeof makeApiMove>[0]) => {
    await makeApiMove(move)
    clearSuggestions()
    clearAll()
    setShowSuggestions(false) // Hide suggestions after move
  }, [makeApiMove, clearSuggestions, clearAll])

  // Handle exit to menu
  const handleExitToMenu = useCallback(() => {
    setScreen('menu')
    clearSuggestions()
    clearAll()
    setShowSuggestions(false)
  }, [setScreen, clearSuggestions, clearAll])

  // Calculate formed word for display
  const getFormedWord = useCallback(() => {
    if (!currentGame || !selectedCell || !selectedLetter || wordPath.length < 2) {
      return ''
    }
    return formWordFromPath(wordPath, currentGame.board, selectedCell, selectedLetter)
  }, [currentGame, selectedCell, selectedLetter, wordPath])

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
      {loading && <Banner variant="loading" message="Loading..." />}
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
            {/* Main game area - Three column layout - fills available space */}
            <div className="flex-1 grid grid-cols-[var(--size-resp-panel)_1fr_var(--size-resp-panel)] gap-[var(--spacing-resp-md)] px-[var(--spacing-resp-lg)] overflow-hidden">
              {/* Left: Player 1 */}
              <PlayerPanel
                game={currentGame}
                playerIndex={0}
                currentPlayerName={playerName}
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
                />
              )}

              {/* Right: Player 2 */}
              <PlayerPanel
                game={currentGame}
                playerIndex={1}
                currentPlayerName={playerName}
              />
            </div>

            {/* Control buttons bar - fixed at bottom */}
            <div className="shrink-0 bg-gray-800 border-t-2 border-gray-700 shadow-depth-3 overflow-hidden">
              {/* Buttons Bar */}
              <div className="px-[var(--spacing-resp-lg)] py-[var(--spacing-resp-md)]">
                <div className="flex items-center justify-between gap-[var(--spacing-resp-md)] min-w-0">
                  {/* Left: Exit Button */}
                  <button
                    onClick={handleExitToMenu}
                    className="px-[var(--spacing-resp-md)] py-[var(--spacing-resp-xs)] bg-gray-700 hover:bg-gray-600 border-2 border-gray-600 text-[var(--text-resp-sm)] font-bold transition-all duration-200 hover:shadow-depth-2 hover:scale-105 text-gray-200 flex-shrink-0"
                  >
                    ← Выход
                  </button>

                  {/* Center: Control Buttons or Status Messages */}
                  {playerName && currentGame && (
                    <div className="flex items-center gap-[var(--spacing-resp-sm)] flex-1 justify-center min-w-0">
                      {/* Conditional rendering: Status messages */}
                      {!isMyTurn()
                        ? <StatusMessage step="waiting" />
                        : !selectedCell
                            ? <StatusMessage step="select-cell" />
                            : !selectedLetter
                                ? <StatusMessage step="select-letter" />
                                : wordPath.length < 2
                                  ? <StatusMessage step="build-word" />
                                  : (
                                      <button
                                        onClick={() => {
                                          if (canSubmitMove(selectedCell, selectedLetter, wordPath)) {
                                            const wordFormed = getFormedWord()
                                            const moveBody = buildMoveBody(playerName, selectedCell!, selectedLetter!, wordFormed)
                                            makeMove(moveBody)
                                          }
                                        }}
                                        className="px-[var(--spacing-resp-lg)] py-[var(--spacing-resp-xs)] bg-green-900 bg-opacity-30 hover:bg-green-900 hover:bg-opacity-50 border-2 border-green-700 text-green-300 font-bold text-[var(--text-resp-sm)] transition-all duration-200 shadow-depth-2 hover:shadow-depth-3 hover:scale-105 flex items-center gap-2"
                                      >
                                        <span>📤 send:</span>
                                        <span className="text-[var(--text-resp-base)] font-black tracking-wider">{getFormedWord()}</span>
                                      </button>
                                    )}

                      <button
                        onClick={handleClearSelection}
                        disabled={!isMyTurn() || (!selectedCell && !selectedLetter && wordPath.length === 0)}
                        className="px-[var(--spacing-resp-md)] py-[var(--spacing-resp-xs)] bg-gray-600 hover:bg-gray-500 text-white font-bold text-[var(--text-resp-sm)] transition-all duration-200 hover:shadow-depth-2 hover:scale-105 disabled:opacity-40 disabled:cursor-not-allowed flex-shrink-0"
                      >
                        ✕ Отмена
                      </button>

                      <button
                        onClick={toggleSuggestions}
                        disabled={!isMyTurn()}
                        className={`px-[var(--spacing-resp-md)] py-[var(--spacing-resp-xs)] font-bold text-[var(--text-resp-sm)] transition-all duration-200 hover:shadow-depth-2 hover:scale-105 flex items-center justify-center gap-2 disabled:opacity-40 disabled:cursor-not-allowed relative flex-shrink-0 ${showSuggestions
                          ? 'bg-yellow-700 hover:bg-yellow-600 text-white shadow-depth-3'
                          : 'bg-yellow-600 hover:bg-yellow-700 text-white'
                        }`}
                      >
                        💡
                        {' '}
                        {showSuggestions ? 'Скрыть' : 'AI'}
                        {!showSuggestions && suggestions.length > 0 && (
                          <span className="absolute -top-1 -right-1 bg-red-600 text-white text-sm px-2 py-1 font-bold shadow-depth-2">
                            {suggestions.length}
                          </span>
                        )}
                      </button>
                    </div>
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

            {/* Suggestions Panel - Expands when visible */}
            {showSuggestions && playerName && currentGame && (
              <div className={cn('shrink-0 min-h-0 overflow-y-auto border-t-2 border-gray-700 bg-gray-750 px-[var(--spacing-resp-lg)] py-[var(--spacing-resp-md)] shadow-[0_-8px_24px_rgba(0,0,0,0.5)]')} style={{ maxHeight: GAME_CONFIG.SUGGESTIONS_PANEL_MAX_HEIGHT }}>
                {loadingSuggestions
                  ? (
                      <div className="flex items-center justify-center py-2">
                        <div className="animate-spin h-8 w-8 border-b-4 border-yellow-400 mr-3"></div>
                        <div className="text-gray-400 font-semibold">Загрузка подсказок...</div>
                      </div>
                    )
                  : suggestions.length === 0
                    ? (
                        <div className="text-center py-2 text-gray-500">
                          Нет доступных подсказок
                        </div>
                      )
                    : (
                        <div className="flex flex-col">
                          <div className="text-sm text-gray-300 mb-4 font-bold uppercase tracking-wide flex items-center justify-between shrink-0">
                            <span className="flex items-center gap-2">
                              💡 Подсказки AI
                            </span>
                            <span className="text-yellow-400 text-lg">
                              {suggestions.length}
                              {' '}
                              доступно
                            </span>
                          </div>
                          <div className="grid grid-cols-1 lg:grid-cols-2 gap-3 pb-2">
                            {suggestions.slice(0, GAME_CONFIG.MAX_SUGGESTIONS_DISPLAY).map((suggestion, index) => {
                              const posStr = `${suggestion.position.row}${String.fromCharCode(1040 + suggestion.position.col)}`
                              const scoreColor = suggestion.score >= GAME_CONFIG.SCORE_THRESHOLDS.HIGH
                                ? 'text-green-400'
                                : suggestion.score >= GAME_CONFIG.SCORE_THRESHOLDS.MEDIUM
                                  ? 'text-yellow-400'
                                  : 'text-gray-400'

                              return (
                                <button
                                  key={index}
                                  onClick={() => {
                                    handleSuggestionSelect(suggestion)
                                    setShowSuggestions(false)
                                  }}
                                  className="group bg-gray-750 hover:bg-gray-700 border border-gray-600 hover:border-yellow-500 transition-all duration-200 hover:shadow-depth-3 px-3 py-2.5 flex items-center gap-3"
                                >
                                  {/* Rank Badge */}
                                  <div className="bg-gray-800 text-gray-500 font-black text-xs px-2 py-1 shrink-0">
                                    #
                                    {index + 1}
                                  </div>

                                  {/* Word - Hero Element */}
                                  <div className="flex-1 text-white font-black uppercase text-lg tracking-wider text-left truncate">
                                    {suggestion.word}
                                  </div>

                                  {/* Position + Letter */}
                                  <div className="flex items-center gap-1.5 shrink-0">
                                    <span className="text-cyan-400 font-mono font-bold text-xs bg-gray-800 bg-opacity-50 px-1.5 py-0.5">
                                      {posStr}
                                    </span>
                                    <span className="text-green-400 font-black text-2xl leading-none">
                                      {suggestion.letter}
                                    </span>
                                  </div>

                                  {/* Score */}
                                  <div className={`${scoreColor} font-black text-xl shrink-0 min-w-[32px] text-right`}>
                                    {suggestion.score.toFixed(0)}
                                  </div>
                                </button>
                              )
                            })}
                          </div>
                        </div>
                      )}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
