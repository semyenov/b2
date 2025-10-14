import type { GameState } from '@lib/client'
import { useHover } from '@hooks/useHover'
import { useKeyboardNavigation } from '@hooks/useKeyboardNavigation'
import { canClickCell, getPositionPathIndex, isPositionInWordPath, isPositionSelected } from '@utils/boardValidation'
import { getCellClassName } from '@utils/cellStyling'
import { cn } from '@utils/classNames'
import { getCellAriaLabel, getCoordLabel } from '@utils/coordinateLabels'
import { memo } from 'react'

export interface BoardProps {
  game: GameState
  selectedCell?: { row: number, col: number }
  selectedLetter?: string
  wordPath?: Array<{ row: number, col: number }>
  hoveredWordPath?: Array<{ row: number, col: number }>
  recentOpponentPath?: Array<{ row: number, col: number }>
  newLetterPosition?: { row: number, col: number }
  opponentNewLetterPosition?: { row: number, col: number }
  hoveredNewLetterPosition?: { row: number, col: number }
  isHoveredWordFromUser?: boolean
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
  hoveredWordPath = [],
  recentOpponentPath = [],
  newLetterPosition,
  opponentNewLetterPosition,
  hoveredNewLetterPosition,
  isHoveredWordFromUser = false,
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
          className="grid w-full h-full bg-slate-800 ring-1 ring-slate-600"
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
              const isInHoveredPath = isPositionInWordPath(rowIndex, colIndex, hoveredWordPath)
              const isInRecentOpponentPath = isPositionInWordPath(rowIndex, colIndex, recentOpponentPath)
              const isNewLetterInPath = isPositionSelected(rowIndex, colIndex, newLetterPosition)
              const isNewLetterInOpponentPath = isPositionSelected(rowIndex, colIndex, opponentNewLetterPosition)
              const isNewLetterInHoveredPath = isPositionSelected(rowIndex, colIndex, hoveredNewLetterPosition)
              const pathIdx = getPositionPathIndex(rowIndex, colIndex, wordPath)
              const hoveredPathIdx = getPositionPathIndex(rowIndex, colIndex, hoveredWordPath)
              const recentOpponentPathIdx = getPositionPathIndex(rowIndex, colIndex, recentOpponentPath)
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
                    isInHoveredPath,
                    isInRecentOpponentPath,
                    isNewLetterInPath,
                    isNewLetterInOpponentPath,
                    isNewLetterInHoveredPath,
                    isHoveredWordFromUser,
                    hasCell: !!cell,
                    canClick,
                    isHovered,
                  })}
                >
                  {!cell && !selected
                    ? (
                        <div className="text-2xl text-slate-600 font-bold">
                          {displayContent}
                        </div>
                      )
                    : selected && !cell && selectedLetter
                      ? (
                          <div className="text-[length:calc(var(--text-resp-board)*0.85)] text-emerald-100 font-black">
                            {selectedLetter}
                          </div>
                        )
                      : selected && !cell
                        ? (
                            <div className="text-2xl text-emerald-100 font-bold">
                              {getCoordLabel(rowIndex, colIndex)}
                            </div>
                          )
                        : (
                            displayContent
                          )}
                  {inPath && pathIdx >= 0 && (
                    <div className="absolute top-0 right-0 w-[30%] h-[30%] text-white text-[length:calc(var(--text-resp-board)*0.4)] flex items-center justify-center font-black leading-none">
                      {pathIdx + 1}
                    </div>
                  )}
                  {!inPath && isInRecentOpponentPath && recentOpponentPathIdx >= 0 && (
                    <div className={cn(
                      'absolute top-0 right-0 w-[30%] h-[30%] text-[length:calc(var(--text-resp-board)*0.4)] flex items-center justify-center font-black leading-none',
                      isNewLetterInOpponentPath ? 'text-amber-100' : 'text-amber-200',
                    )}
                    >
                      {recentOpponentPathIdx + 1}
                    </div>
                  )}
                  {!inPath && !isInRecentOpponentPath && isInHoveredPath && hoveredPathIdx >= 0 && (
                    <div className={cn(
                      'absolute top-0 right-0 w-[30%] h-[30%] text-[length:calc(var(--text-resp-board)*0.4)] flex items-center justify-center font-black leading-none',
                      isHoveredWordFromUser
                        ? (isNewLetterInHoveredPath ? 'text-emerald-100' : 'text-emerald-200')
                        : (isNewLetterInHoveredPath ? 'text-amber-100' : 'text-amber-200'),
                    )}
                    >
                      {hoveredPathIdx + 1}
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
