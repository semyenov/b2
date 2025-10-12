import type { GameState } from '../lib/client'
import { memo, useCallback, useState } from 'react'
import { A11Y_LABELS } from '../constants/game'
import { canClickCell, getPositionPathIndex, isPositionInWordPath, isPositionSelected } from '../utils/boardValidation'
import { cn } from '../utils/classNames'

interface BoardProps {
  game: GameState
  selectedCell?: { row: number, col: number }
  selectedLetter?: string
  wordPath?: Array<{ row: number, col: number }>
  onCellClick?: (row: number, col: number) => void
  disabled?: boolean
}

// Helper function to determine cell styling (memoized for performance)
function getCellClassName(selected: boolean, inPath: boolean, hasCell: boolean, canClick: boolean, isHovered: boolean): string {
  return cn(
    // Base classes
    'w-[var(--size-resp-cell)] h-[var(--size-resp-cell)] border flex items-center justify-center text-[var(--text-resp-board)] text-3xl font-black transition-colors duration-150 relative leading-none',

    // State-based styling
    {
      'bg-blue-600 border-blue-500 text-white': selected,
      'bg-emerald-600 border-emerald-500 text-white': !selected && inPath,
      'bg-gray-700 border-gray-600 text-cyan-300': !selected && !inPath && hasCell,
      'bg-gray-900 border-gray-800 text-gray-700': !selected && !inPath && !hasCell,
    },

    // Interactive styling
    {
      'cursor-pointer hover:bg-gray-600 hover:border-cyan-400': canClick,
      'cursor-default': !canClick,
    },

    // Hover
    {
      'border-blue-400': isHovered && canClick && selected,
      'bg-gray-600 border-yellow-500': isHovered && canClick && !selected,
    },
  )
}

export const Board = memo(({
  game,
  selectedCell,
  selectedLetter,
  wordPath = [],
  onCellClick,
  disabled,
}: BoardProps) => {
  const { board } = game
  const [hoveredCell, setHoveredCell] = useState<{ row: number, col: number } | null>(null)

  // Keyboard navigation handler
  const handleCellKeyDown = useCallback((
    event: React.KeyboardEvent,
    row: number,
    col: number,
    canClick: boolean,
  ) => {
    if (!canClick)
      return

    // Handle Enter or Space to click cell
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault()
      onCellClick?.(row, col)
    }
  }, [onCellClick])

  // Get coordinate label (e.g., "0А", "1Б")
  const getCoordLabel = useCallback((row: number, col: number) => {
    return `${row}${String.fromCharCode(1040 + col)}`
  }, [])

  // Get ARIA label for cell
  const getCellAriaLabel = useCallback((
    row: number,
    col: number,
    cell: string | null,
    selected: boolean,
    inPath: boolean,
    pathIdx: number,
  ) => {
    const coord = getCoordLabel(row, col)

    if (selected && selectedLetter) {
      return A11Y_LABELS.BOARD_CELL_SELECTED(coord, selectedLetter)
    }

    if (inPath && pathIdx >= 0) {
      const letter = cell || selectedLetter || ''
      return A11Y_LABELS.BOARD_CELL_IN_PATH(coord, letter, pathIdx + 1)
    }

    if (cell) {
      return A11Y_LABELS.BOARD_CELL_FILLED(coord, cell)
    }

    return A11Y_LABELS.BOARD_CELL_EMPTY(coord)
  }, [selectedLetter, getCoordLabel])

  return (
    <div className="flex flex-col items-center justify-center h-full w-full" style={{ maxWidth: 'fit-content' }}>
      {/* Board */}
      <div className="bg-gray-800 border border-gray-700">
        {/* Board rows */}
        {board.map((row, rowIndex) => (
          <div key={rowIndex} className="flex">
            {/* Cells */}
            {row.map((cell, colIndex) => {
              const canClick = canClickCell({
                row: rowIndex,
                col: colIndex,
                board,
                disabled: !!disabled,
                selectedCell,
                selectedLetter,
                wordPath,
              })
              const isHovered = hoveredCell?.row === rowIndex && hoveredCell?.col === colIndex
              const inPath = isPositionInWordPath(rowIndex, colIndex, wordPath)
              const pathIdx = getPositionPathIndex(rowIndex, colIndex, wordPath)
              const selected = isPositionSelected(rowIndex, colIndex, selectedCell)

              // Display content
              let displayContent = cell
              if (selected && !cell && selectedLetter) {
                displayContent = selectedLetter
              }
              if (!displayContent) {
                displayContent = '·'
              }

              return (
                <div
                  key={colIndex}
                  role="button"
                  tabIndex={canClick ? 0 : -1}
                  aria-label={getCellAriaLabel(rowIndex, colIndex, cell, selected, inPath, pathIdx)}
                  aria-pressed={selected}
                  aria-disabled={!canClick}
                  onClick={() => canClick && onCellClick?.(rowIndex, colIndex)}
                  onKeyDown={e => handleCellKeyDown(e, rowIndex, colIndex, canClick)}
                  onMouseEnter={() => setHoveredCell({ row: rowIndex, col: colIndex })}
                  onMouseLeave={() => setHoveredCell(null)}
                  className={getCellClassName(selected, inPath, !!cell, canClick, isHovered)}
                >
                  {displayContent}
                  {inPath && pathIdx >= 0 && (
                    <div className="absolute top-0 right-0 w-5 h-5 bg-emerald-700 text-white text-[10px] flex items-center justify-center font-bold">
                      {pathIdx + 1}
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        ))}
      </div>
    </div>
  )
})

Board.displayName = 'Board'
