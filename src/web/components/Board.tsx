import type { GameState } from '../lib/client'
import { memo } from 'react'
import { useHover } from '../hooks/useHover'
import { useKeyboardNavigation } from '../hooks/useKeyboardNavigation'
import { canClickCell, getPositionPathIndex, isPositionInWordPath, isPositionSelected } from '../utils/boardValidation'
import { getCellClassName } from '../utils/cellStyling'
import { getCellAriaLabel } from '../utils/coordinateLabels'

export interface BoardProps {
  game: GameState
  selectedCell?: { row: number, col: number }
  selectedLetter?: string
  wordPath?: Array<{ row: number, col: number }>
  onCellClick?: (row: number, col: number) => void
  disabled?: boolean
}

/**
 * Board Component
 * Renders the game board grid with coordinate labels (Russian letters for columns, numbers for rows)
 * Displays cells with letters, handles selection, hover states, and word path visualization
 */
export const Board = memo(({
  game,
  selectedCell,
  selectedLetter,
  wordPath = [],
  onCellClick,
  disabled,
}: BoardProps) => {
  const { board } = game

  // Use extracted hooks
  const { hoveredItem: hoveredCell, handleMouseEnter, handleMouseLeave } = useHover<{ row: number, col: number }>()
  const { handleKeyDown } = useKeyboardNavigation()

  const gridSize = board.length

  return (
    <div className="h-full aspect-square mx-auto flex flex-col" style={{ maxHeight: '100%' }}>
      {/* Column headers (Russian letters: А, Б, В, Г, Д) */}
      <div className="flex items-center justify-center mb-1">
        <div className="w-8 shrink-0" />
        {' '}
        {/* Spacer for row numbers */}
        {Array.from({ length: gridSize }, (_, i) => (
          <div
            key={`col-${i}`}
            className="flex-1 flex items-center justify-center text-cyan-400 font-black text-lg tracking-wider"
          >
            {String.fromCharCode(1040 + i)}
            {' '}
            {/* А=1040 in Unicode */}
          </div>
        ))}
      </div>

      {/* Board container with row labels */}
      <div className="flex-1 flex items-center gap-1">
        {/* Row numbers */}
        <div className="flex flex-col justify-around h-full w-8 shrink-0">
          {Array.from({ length: gridSize }, (_, i) => (
            <div
              key={`row-${i}`}
              className="flex items-center justify-center text-cyan-400 font-black text-lg"
            >
              {i}
            </div>
          ))}
        </div>

        {/* Board grid - height-driven, maintains square aspect */}
        <div
          className="flex-1 h-full grid gap-0.5 bg-slate-950 p-1"
          style={{
            gridTemplateColumns: `repeat(${gridSize}, 1fr)`,
            gridTemplateRows: `repeat(${gridSize}, 1fr)`,
          }}
        >
          {board.map((row, rowIndex) =>
            row.map((cell, colIndex) => {
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
                  key={`${rowIndex}-${colIndex}`}
                  role="button"
                  tabIndex={canClick ? 0 : -1}
                  aria-label={getCellAriaLabel({
                    row: rowIndex,
                    col: colIndex,
                    cell,
                    selected,
                    inPath,
                    pathIdx,
                    selectedLetter,
                  })}
                  aria-pressed={selected}
                  aria-disabled={!canClick}
                  onClick={() => canClick && onCellClick?.(rowIndex, colIndex)}
                  onKeyDown={e => handleKeyDown(e, () => onCellClick?.(rowIndex, colIndex), !canClick)}
                  onMouseEnter={() => handleMouseEnter({ row: rowIndex, col: colIndex })}
                  onMouseLeave={handleMouseLeave}
                  className={getCellClassName({
                    selected,
                    inPath,
                    hasCell: !!cell,
                    canClick,
                    isHovered,
                  })}
                >
                  {displayContent}
                  {inPath && pathIdx >= 0 && (
                    <div className="absolute top-0 right-0 w-5 h-5 bg-green-800 text-white text-[10px] flex items-center justify-center font-bold border border-green-600">
                      {pathIdx + 1}
                    </div>
                  )}
                </div>
              )
            }),
          )}
        </div>
      </div>
    </div>
  )
})

Board.displayName = 'Board'
