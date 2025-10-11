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
    <div className="bg-gray-800 p-3 rounded-lg shadow-2xl border-2 border-gray-600">
      {/* Column headers */}
      <div className="flex mb-0.5">
        <div className="w-12 h-6" />
        {' '}
        {/* Empty corner */}
        {Array.from({ length: size }, (_, i) => (
          <div key={i} className="w-12 h-6 flex items-center justify-center text-cyan-400 font-bold text-xs">
            {String.fromCharCode(1040 + i)}
            {' '}
            {/* Russian letters А-Я */}
          </div>
        ))}
      </div>

      {/* Board rows */}
      {board.map((row, rowIndex) => (
        <div key={rowIndex} className="flex">
          {/* Row number */}
          <div className="w-12 h-12 flex items-center justify-center text-cyan-400 font-bold text-xs">
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
                  w-12 h-12 border-2 flex items-center justify-center text-lg font-bold
                  transition-all relative rounded
                  ${selected
                ? 'bg-blue-600 border-blue-400 text-white shadow-lg'
                : inPath
                  ? 'bg-green-600 border-green-400 text-white shadow-md'
                  : cell
                    ? 'bg-gray-700 border-gray-500 text-green-400'
                    : 'bg-gray-900 border-gray-700 text-gray-600'
              }
                  ${canClick
                ? 'cursor-pointer hover:shadow-lg hover:transform hover:scale-110 hover:bg-gray-800 hover:z-10'
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
                  <div className="absolute top-0 right-0 w-4 h-4 bg-green-800 text-white text-[9px] rounded-bl flex items-center justify-center font-bold border border-green-600">
                    {pathIdx + 1}
                  </div>
                )}
              </div>
            )
          })}
        </div>
      ))}

      {/* Legend */}
      <div className="mt-2 flex gap-2 text-[9px] text-gray-500 justify-center">
        <div className="flex items-center gap-1">
          <div className="w-2.5 h-2.5 bg-blue-600 border border-blue-400 rounded"></div>
          <span>Выбрана</span>
        </div>
        <div className="flex items-center gap-1">
          <div className="w-2.5 h-2.5 bg-green-600 border border-green-400 rounded"></div>
          <span>Путь</span>
        </div>
        <div className="flex items-center gap-1">
          <div className="w-2.5 h-2.5 bg-gray-600 border border-yellow-400 rounded"></div>
          <span>Доступно</span>
        </div>
      </div>
    </div>
  )
}
