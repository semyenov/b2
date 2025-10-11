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
    <div className="bg-gray-800 px-6 py-6 rounded-lg shadow-depth-3 border-2 border-gray-700">
      {/* Column headers */}
      <div className="flex mb-2">
        <div className="w-10 h-10" />
        {/* Empty corner */}
        {Array.from({ length: size }, (_, i) => (
          <div key={i} className="w-14 h-10 flex items-center justify-center text-cyan-400 font-bold text-base">
            {String.fromCharCode(1040 + i)}
            {/* Russian letters А-Я */}
          </div>
        ))}
      </div>

      {/* Board rows */}
      {board.map((row, rowIndex) => (
        <div key={rowIndex} className="flex">
          {/* Row number */}
          <div className="w-10 h-14 flex items-center justify-center text-cyan-400 font-bold text-base">
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
                  w-14 h-14 border-2 flex items-center justify-center text-xl font-bold
                  transition-all duration-200 relative rounded-lg
                  ${selected
                ? 'bg-blue-600 border-blue-400 text-white shadow-depth-2'
                : inPath
                  ? 'bg-green-600 border-green-400 text-white shadow-depth-2'
                  : cell
                    ? 'bg-gray-700 border-gray-600 text-green-400'
                    : 'bg-gray-900 border-gray-700 text-gray-600'
              }
                  ${canClick
                ? 'cursor-pointer hover:shadow-depth-3 hover:transform hover:scale-105 hover:bg-gray-700 hover:z-10'
                : 'cursor-default'
              }
                  ${isHovered && canClick
                ? selected
                  ? 'ring-2 ring-blue-300'
                  : 'ring-2 ring-yellow-400 bg-gray-600'
                : ''
              }
                `}
              >
                {displayContent}
                {inPath && pathIdx >= 0 && (
                  <div className="absolute top-0 right-0 w-5 h-5 bg-green-800 text-white text-[10px] rounded-bl flex items-center justify-center font-bold border border-green-600">
                    {pathIdx + 1}
                  </div>
                )}
              </div>
            )
          })}
        </div>
      ))}

      {/* Legend */}
      <div className="mt-4 flex gap-4 text-xs text-gray-400 justify-center">
        <div className="flex items-center gap-1.5">
          <div className="w-3 h-3 bg-blue-600 border-2 border-blue-400 rounded"></div>
          <span>Выбрана</span>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="w-3 h-3 bg-green-600 border-2 border-green-400 rounded"></div>
          <span>Путь</span>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="w-3 h-3 bg-gray-600 border-2 border-yellow-400 rounded"></div>
          <span>Доступно</span>
        </div>
      </div>
    </div>
  )
}
