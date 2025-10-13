import type { GameState } from '../../lib/client'
import { memo } from 'react'
import { useHover } from '../../hooks/useHover'
import { useKeyboardNavigation } from '../../hooks/useKeyboardNavigation'
import { canClickCell, getPositionPathIndex, isPositionInWordPath, isPositionSelected } from '../../utils/boardValidation'
import { getCellClassName } from '../../utils/cellStyling'
import { getCellAriaLabel, getCoordLabel } from '../../utils/coordinateLabels'

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
      {/* Board container with enhanced styling */}
      <div className="flex-1 flex items-center gap-1">
        {/* Board grid - height-driven, maintains square aspect with enhanced visual design */}
        <div
          className="grid w-full h-full border-2 border-slate-500 shadow-2xl bg-slate-800"
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
              if (!displayContent && !selected) {
                displayContent = getCoordLabel(rowIndex, colIndex)
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
                  {!cell && !selected
                    ? (
                      <div className="text-xs text-slate-500 font-medium">
                        {displayContent}
                      </div>
                    )
                    : (
                      displayContent
                    )}
                  {inPath && pathIdx >= 0 && (
                    <div className="absolute top-0 right-0 w-6 h-6 bg-emerald-800 text-white text-base flex items-center justify-center font-bold border-l border-b border-emerald-400">
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
