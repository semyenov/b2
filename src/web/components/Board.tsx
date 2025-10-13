import type { GameState } from '../lib/client'
import { memo } from 'react'
import { useHover } from '../hooks/useHover'
import { useKeyboardNavigation } from '../hooks/useKeyboardNavigation'
import { canClickCell, getPositionPathIndex, isPositionInWordPath, isPositionSelected } from '../utils/boardValidation'
import { getCellClassName } from '../utils/cellStyling'
import { getCellAriaLabel } from '../utils/coordinateLabels'

interface BoardProps {
  game: GameState
  selectedCell?: { row: number, col: number }
  selectedLetter?: string
  wordPath?: Array<{ row: number, col: number }>
  onCellClick?: (row: number, col: number) => void
  disabled?: boolean
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

  // Use extracted hooks
  const { hoveredItem: hoveredCell, handleMouseEnter, handleMouseLeave } = useHover<{ row: number, col: number }>()
  const { handleKeyDown } = useKeyboardNavigation()

  const gridSize = board.length

  return (
    <div className="w-full h-full max-w-[90vh] max-h-[90vh] aspect-square mx-auto">
      {/* Board grid - no wrappers, maximum space */}
      <div
        className="w-full h-full grid gap-0.5 bg-slate-950 p-1"
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
  )
})

Board.displayName = 'Board'
