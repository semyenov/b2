import type { GameState, Suggestion } from '@lib/client'
import type { Position } from '@types'
import { Board, ControlButtons, GamePanel, Sidebar } from '@components'
import { memo, useRef } from 'react'
import { useGameActions } from '@hooks/useGameActions'

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
  // Use extracted game actions hook
  const { formedWord, handleSubmitMove, handleSuggestionSelect } = useGameActions({
    game,
    playerName,
    selectedCell,
    selectedLetter,
    wordPath,
    onSubmitMove,
    onSuggestionSelect,
    onHideSuggestions,
  })

  // Ref to bottom control panel container to exclude from click-outside
  const bottomPanelRef = useRef<HTMLDivElement | null>(null)

  return (
    <div className="relative h-screen flex flex-col bg-slate-900 overflow-hidden">
      {/* Main game area - Responsive layout: mobile stack, desktop three-column */}
      <div className="flex-1 flex flex-col lg:grid lg:grid-cols-[1fr_auto_1fr] gap-4 lg:gap-6 p-3 lg:p-6 pb-0 overflow-hidden relative">
        {/* Mobile: Players side-by-side, Desktop: Player 1 left sidebar */}
        <div className="flex lg:contents gap-2 min-h-0">
          <div className="flex-1 lg:flex-1 min-h-0">
            <Sidebar
              game={game}
              playerIndex={0}
            />
          </div>
          <div className="flex-1 lg:hidden min-h-0">
            <Sidebar
              game={game}
              playerIndex={1}
            />
          </div>
        </div>

        {/* Center: Board Only - centered vertically */}
        <div className="h-full min-h-0 flex items-center justify-center max-w-full">
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
        <div className="hidden lg:flex lg:flex-1 min-h-0">
          <Sidebar
            game={game}
            playerIndex={1}
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
        onClose={onClearSelection}
        onHideSuggestions={onHideSuggestions}
        excludeRefs={[bottomPanelRef]}
      />

      {/* Bottom control panel - fixed at bottom */}
      <div ref={bottomPanelRef} className="shrink-0 shadow-depth-3 overflow-hidden relative z-50">
        <div className="bg-slate-800 border-t border-slate-600 px-6 py-6">
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
            onHideSuggestions={onHideSuggestions}
            onExit={onExit}
          />
        </div>
      </div>
    </div>
  )
})

GameScreen.displayName = 'GameScreen'
