import type { GameState, Suggestion } from '@lib/client'
import type { Position } from '@types'
import { Board, ControlButtons, GamePanel, Sidebar } from '@components'
import { useGameActions } from '@hooks/useGameActions'
import { findWordPath } from '@utils/gamePathFinder'
import { memo, useCallback, useEffect, useRef, useState } from 'react'

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

  // Calculate current move number (total moves + 1 for next move)
  const currentMoveNumber = game.moves.length + 1

  // Ref to bottom control panel container to exclude from click-outside
  const bottomPanelRef = useRef<HTMLDivElement | null>(null)

  // Word hover highlighting state
  const [hoveredWordPath, setHoveredWordPath] = useState<Position[] | null>(null)
  const [hoveredNewLetterPosition, setHoveredNewLetterPosition] = useState<Position | null>(null)
  const [isHoveredWordFromUser, setIsHoveredWordFromUser] = useState<boolean>(false)

  // Recent opponent move highlighting (2 seconds)
  const [recentOpponentPath, setRecentOpponentPath] = useState<Position[] | null>(null)
  const [opponentNewLetterPosition, setOpponentNewLetterPosition] = useState<Position | null>(null)
  const previousMoveCountRef = useRef<number>(0)

  // Detect opponent moves and highlight for 2 seconds
  useEffect(() => {
    const currentMoveCount = game.moves.length

    // Only proceed if a new move was added
    if (currentMoveCount <= previousMoveCountRef.current) {
      previousMoveCountRef.current = currentMoveCount
      return
    }

    previousMoveCountRef.current = currentMoveCount

    // Get the most recent move
    const lastMove = game.moves[game.moves.length - 1]
    if (!lastMove) {
      return
    }

    // Check if it's an opponent's move (not the current player)
    if (lastMove.playerId === playerName) {
      // Player's own move, don't highlight
      setRecentOpponentPath(null)
      return
    }

    // Compute the path for opponent's move
    const path = findWordPath(
      game.board,
      lastMove.position,
      lastMove.letter,
      lastMove.word,
    )

    setRecentOpponentPath(path)
    setOpponentNewLetterPosition(lastMove.position)

    // Clear after 2 seconds
    const timer = setTimeout(() => {
      setRecentOpponentPath(null)
      setOpponentNewLetterPosition(null)
    }, 2000)

    return () => clearTimeout(timer)
  }, [game.moves, game.board, playerName])

  // Handle word hover in sidebar - compute path for highlighted word
  const handleWordHover = useCallback((playerIndex: number, wordIndex: number) => {
    // Find all moves for this player
    const player = game.players[playerIndex]
    const playerMoves = game.moves.filter(move => move.playerId === player)

    // Get the specific move being hovered
    const move = playerMoves[wordIndex]
    if (!move) {
      setHoveredWordPath(null)
      setHoveredNewLetterPosition(null)
      setIsHoveredWordFromUser(false)
      return
    }

    // Reconstruct the path using current board state + move data
    const path = findWordPath(
      game.board,
      move.position,
      move.letter,
      move.word,
    )

    setHoveredWordPath(path)
    setHoveredNewLetterPosition(move.position)
    setIsHoveredWordFromUser(player === playerName)
  }, [game.board, game.moves, game.players, playerName])

  // Clear hovered word path
  const handleWordLeave = useCallback(() => {
    setHoveredWordPath(null)
    setHoveredNewLetterPosition(null)
    setIsHoveredWordFromUser(false)
  }, [])

  return (
    <div className="relative h-screen flex flex-col bg-surface-900 overflow-hidden">
      {/* Main game area - Responsive layout: mobile stack, desktop three-column */}
      <div className="flex-1 flex flex-col lg:grid lg:grid-cols-[1fr_auto_1fr] gap-4 lg:gap-6 p-3 lg:p-6 pb-0 overflow-hidden relative">
        {/* Mobile: Players side-by-side, Desktop: Player 1 left sidebar */}
        <div className="flex lg:contents gap-2 min-h-0">
          <div className="flex-1 lg:flex-1 min-h-0">
            <Sidebar
              game={game}
              playerIndex={0}
              onWordHover={handleWordHover}
              onWordLeave={handleWordLeave}
            />
          </div>
          <div className="flex-1 lg:hidden min-h-0">
            <Sidebar
              game={game}
              playerIndex={1}
              onWordHover={handleWordHover}
              onWordLeave={handleWordLeave}
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
            hoveredWordPath={hoveredWordPath || []}
            recentOpponentPath={recentOpponentPath || []}
            newLetterPosition={selectedCell}
            opponentNewLetterPosition={opponentNewLetterPosition || undefined}
            hoveredNewLetterPosition={hoveredNewLetterPosition || undefined}
            isHoveredWordFromUser={isHoveredWordFromUser}
            onCellClick={onCellClick}
            disabled={!isMyTurn}
          />
        </div>

        {/* Desktop only: Player 2 right sidebar */}
        <div className="hidden lg:flex lg:flex-1 min-h-0">
          <Sidebar
            game={game}
            playerIndex={1}
            onWordHover={handleWordHover}
            onWordLeave={handleWordLeave}
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
        <div className="bg-surface-800 border-t border-surface-600 px-6 py-6">
          <ControlButtons
            isMyTurn={isMyTurn}
            selectedCell={selectedCell}
            selectedLetter={selectedLetter}
            wordPath={wordPath}
            formedWord={formedWord}
            showSuggestions={showSuggestions}
            moveNumber={currentMoveNumber}
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
