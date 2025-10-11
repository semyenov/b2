import type { GameState } from '../lib/client'
import { useState } from 'react'
import { canClickCell, getPositionPathIndex, isPositionInWordPath, isPositionSelected } from '../utils/boardValidation'

interface BoardProps {
  game: GameState
  selectedCell?: { row: number, col: number }
  selectedLetter?: string
  wordPath?: Array<{ row: number, col: number }>
  onCellClick?: (row: number, col: number) => void
  disabled?: boolean
}

export function Board({
  game,
  selectedCell,
  selectedLetter,
  wordPath = [],
  onCellClick,
  disabled,
}: BoardProps) {
  const { board, size } = game
  const [hoveredCell, setHoveredCell] = useState<{ row: number, col: number } | null>(null)

  return (
    <div className="px-[clamp(0.5rem,1vw,1rem)] py-[clamp(0.25rem,0.5vw,0.75rem)] w-full max-w-[min(90vw,1200px)] mx-auto overflow-hidden">
      {/* Column headers */}
      <div className="flex mb-2">
        <div className="w-[clamp(3rem,4vw,4rem)] h-[clamp(3rem,4vw,4rem)]" />
        {/* Empty corner */}
        {Array.from({ length: size }, (_, i) => (
          <div key={i} className="w-[clamp(3rem,6vw,6rem)] h-[clamp(3rem,4vw,4rem)] flex items-center justify-center text-cyan-300 font-black text-[clamp(1rem,2vw,1.5rem)]">
            {String.fromCharCode(1040 + i)}
            {/* Russian letters А-Я */}
          </div>
        ))}
      </div>

      {/* Board rows */}
      {board.map((row, rowIndex) => (
        <div key={rowIndex} className="flex">
          {/* Row number */}
          <div className="w-[clamp(3rem,4vw,4rem)] h-[clamp(3rem,6vw,6rem)] flex items-center justify-center text-cyan-300 font-black text-[clamp(1rem,2vw,1.5rem)]">
            {rowIndex}
          </div>

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
                onClick={() => canClick && onCellClick?.(rowIndex, colIndex)}
                onMouseEnter={() => setHoveredCell({ row: rowIndex, col: colIndex })}
                onMouseLeave={() => setHoveredCell(null)}
                className={`
                  w-[clamp(3rem,6vw,6rem)] h-[clamp(3rem,6vw,6rem)] border-2 flex items-center justify-center text-[clamp(2rem,4vw,4rem)] font-black
                  transition-all duration-200 relative
                  ${selected
                ? 'bg-blue-600 border-blue-400 text-white shadow-depth-3'
                : inPath
                  ? 'bg-green-600 border-green-400 text-white shadow-depth-3'
                  : cell
                    ? 'bg-gray-650 border-gray-500 text-emerald-300 shadow-depth-1'
                    : 'bg-gray-800 border-gray-650 text-gray-500'
              }
                  ${canClick
                ? 'cursor-pointer hover:shadow-depth-3 hover:transform hover:scale-105 hover:bg-gray-650 hover:z-10 hover:border-cyan-500'
                : 'cursor-default'
              }
                  ${isHovered && canClick
                ? selected
                  ? 'ring-2 ring-blue-300'
                  : 'ring-2 ring-yellow-400 bg-gray-650'
                : ''
              }
                `}
              >
                {displayContent}
                {inPath && pathIdx >= 0 && (
                  <div className="absolute top-0 right-0 w-5 h-5 bg-green-800 text-white text-[10px] flex items-center justify-center font-bold border border-green-600">
                    {pathIdx + 1}
                  </div>
                )}
              </div>
            )
          })}
        </div>
      ))}
    </div>
  )
}
