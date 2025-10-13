import type { GameState, Suggestion } from '../../lib/client'
import type { Position } from '../../types/game'
import { memo, useMemo } from 'react'
import { buildMoveBody, canSubmitMove } from '../../utils/moveValidation'
import { getFormedWord } from '../../utils/wordUtils'
import { Board, ControlButtons, GamePanel, PlayerPanel } from '@components'

interface GameScreenProps {
  game: GameState
  playerName: string
  isMyTurn: boolean
  selectedCell?: Position
  selectedLetter?: string
  wordPath: Position[]
  showSuggestions: boolean
  suggestions: Suggestion[]
  loadingSuggestions: boolean
  onCellClick: (row: number, col: number) => void
  onLetterSelect: (letter: string) => void
  onSuggestionSelect: (suggestion: Suggestion) => void
  onSubmitMove: (move: any) => void
  onClearSelection: () => void
  onToggleSuggestions: () => void
  onHideSuggestions: () => void
  onExit: () => void
}

/**
 * GameScreen - Game play layout
 *
 * Extracted from App.tsx to separate game screen layout from routing logic
 * Contains the full game interface: board, players, controls, suggestions
 */
export const GameScreen = memo(({
  game,
  playerName,
  isMyTurn,
  selectedCell,
  selectedLetter,
  wordPath,
  showSuggestions,
  suggestions,
  loadingSuggestions,
  onCellClick,
  onLetterSelect,
  onSuggestionSelect,
  onSubmitMove,
  onClearSelection,
  onToggleSuggestions,
  onHideSuggestions,
  onExit,
}: GameScreenProps) => {
  // Memoize formed word for display
  const formedWord = useMemo(
    () => selectedLetter ? getFormedWord(game, selectedCell, selectedLetter, wordPath) : '',
    [game, selectedCell, selectedLetter, wordPath],
  )

  const handleSubmitMove = () => {
    if (canSubmitMove(selectedCell, selectedLetter, wordPath) && selectedCell && selectedLetter) {
      const moveBody = buildMoveBody(playerName, selectedCell, selectedLetter, formedWord)
      onSubmitMove(moveBody)
    }
  }

  const handleSuggestionSelect = (suggestion: Suggestion) => {
    onSuggestionSelect(suggestion)
    onHideSuggestions()
  }

  return (
    <div className="relative h-screen flex flex-col bg-gradient-to-b from-gray-900 to-gray-800">
      {/* Main game area - Responsive layout: mobile stack, desktop three-column */}
      <div className="flex-1 flex flex-col lg:grid lg:grid-cols-[var(--size-resp-panel)_1fr_var(--size-resp-panel)] gap-[var(--spacing-resp-lg)] p-[var(--spacing-resp-md)] pb-0 lg:p-[var(--spacing-resp-xl)] overflow-hidden relative">
        {/* Mobile: Players side-by-side, Desktop: Player 1 left sidebar */}
        <div className="flex lg:contents gap-[var(--spacing-resp-sm)] min-h-0">
          <div className="flex-1 lg:flex-none min-h-0">
            <PlayerPanel
              game={game}
              playerIndex={0}
              currentPlayerName={playerName}
            />
          </div>
          <div className="flex-1 lg:hidden min-h-0">
            <PlayerPanel
              game={game}
              playerIndex={1}
              currentPlayerName={playerName}
            />
          </div>
        </div>

        {/* Center: Board Only - centered vertically */}
        <div className="h-full min-h-0 flex items-center justify-center max-w-full overflow-hidden">
          <Board
            game={game}
            selectedCell={selectedCell}
            selectedLetter={selectedLetter}
            wordPath={wordPath}
            onCellClick={onCellClick}
            disabled={!isMyTurn}
          />
        </div>

        {/* Desktop only: Player 2 right sidebar */}
        <div className="hidden lg:block min-h-0">
          <PlayerPanel
            game={game}
            playerIndex={1}
            currentPlayerName={playerName}
          />
        </div>
      </div>

      {/* Alphabet / Suggestions Panel - absolutely positioned at bottom */}
      <GamePanel
        disabled={!isMyTurn}
        selectedCell={selectedCell}
        selectedLetter={selectedLetter}
        onLetterSelect={onLetterSelect}
        showSuggestions={showSuggestions}
        suggestions={suggestions}
        loadingSuggestions={loadingSuggestions}
        onSuggestionSelect={handleSuggestionSelect}
      />

      {/* Bottom control panel - fixed at bottom */}
      <div className="shrink-0 shadow-depth-3 overflow-hidden relative z-50">
        <div className="bg-slate-900 border-t-2 border-slate-700 px-[var(--spacing-resp-sm)] sm:px-[var(--spacing-resp-lg)] py-[var(--spacing-resp-sm)] sm:py-[var(--spacing-resp-md)]">
          <ControlButtons
            isMyTurn={isMyTurn}
            selectedCell={selectedCell}
            selectedLetter={selectedLetter}
            wordPath={wordPath}
            formedWord={formedWord}
            showSuggestions={showSuggestions}
            onSubmitMove={handleSubmitMove}
            onClearSelection={onClearSelection}
            onToggleSuggestions={onToggleSuggestions}
            onExit={onExit}
          />
        </div>
      </div>
    </div>
  )
})

GameScreen.displayName = 'GameScreen'
