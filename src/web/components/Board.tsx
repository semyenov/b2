import type { GameState } from '../lib/client'
import { useState } from 'react'

interface BoardProps {
  game: GameState
  selectedCell?: { row: number; col: number }
  selectedLetter?: string
  wordPath?: Array<{ row: number; col: number }>
  onCellClick?: (row: number, col: number) => void
  disabled?: boolean
}

export function Board({
  game,
  selectedCell,
  selectedLetter,
  wordPath = [],
  onCellClick,
  disabled
}: BoardProps) {
  const { board, size } = game
  const [hoveredCell, setHoveredCell] = useState<{ row: number; col: number } | null>(null)

  const isInWordPath = (row: number, col: number) => {
    return wordPath.some(pos => pos.row === row && pos.col === col)
  }

  const getPathIndex = (row: number, col: number) => {
    return wordPath.findIndex(pos => pos.row === row && pos.col === col)
  }

  const isSelected = (row: number, col: number) => {
    return selectedCell?.row === row && selectedCell?.col === col
  }

  const canClickCell = (row: number, col: number) => {
    if (disabled) return false

    const cell = board[row][col]

    // If no cell selected yet, can only click empty cells
    if (!selectedCell) {
      return !cell
    }

    // If cell selected but no letter, can't click anything
    if (!selectedLetter) {
      return false
    }

    // If we have selected cell and letter, can click letters to form word
    // Must be adjacent to last cell in path (or the selected cell if path is empty)
    const lastPos = wordPath.length > 0 ? wordPath[wordPath.length - 1] : selectedCell
    const isAdjacent = Math.abs(row - lastPos.row) <= 1 && Math.abs(col - lastPos.col) <= 1

    // Can click the selected cell (with new letter) or existing letters
    return isAdjacent && (isSelected(row, col) || !!cell) && !isInWordPath(row, col)
  }

  return (
    <div className="bg-white p-6 rounded-lg shadow-xl border-2 border-gray-400">
      {/* Column headers */}
      <div className="flex mb-1">
        <div className="w-14 h-8" /> {/* Empty corner */}
        {Array.from({ length: size }, (_, i) => (
          <div key={i} className="w-14 h-8 flex items-center justify-center text-gray-700 font-bold text-sm">
            {String.fromCharCode(1040 + i)} {/* Russian letters А-Я */}
          </div>
        ))}
      </div>

      {/* Board rows */}
      {board.map((row, rowIndex) => (
        <div key={rowIndex} className="flex">
          {/* Row number */}
          <div className="w-14 h-14 flex items-center justify-center text-gray-700 font-bold text-sm">
            {rowIndex}
          </div>

          {/* Cells */}
          {row.map((cell, colIndex) => {
            const canClick = canClickCell(rowIndex, colIndex)
            const isHovered = hoveredCell?.row === rowIndex && hoveredCell?.col === colIndex
            const inPath = isInWordPath(rowIndex, colIndex)
            const pathIdx = getPathIndex(rowIndex, colIndex)
            const selected = isSelected(rowIndex, colIndex)

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
                  w-14 h-14 border-2 flex items-center justify-center text-2xl font-bold
                  transition-all relative
                  ${selected
                    ? 'bg-blue-200 border-blue-500 text-blue-700 shadow-inner'
                    : inPath
                    ? 'bg-green-200 border-green-500 text-green-700'
                    : cell
                    ? 'bg-gray-50 border-gray-400 text-gray-800'
                    : 'bg-white border-gray-300 text-gray-400'
                  }
                  ${canClick
                    ? 'cursor-pointer hover:shadow-md hover:transform hover:scale-105'
                    : 'cursor-default'
                  }
                  ${isHovered && canClick
                    ? selected
                      ? 'ring-2 ring-blue-400'
                      : 'ring-2 ring-yellow-400 bg-yellow-50'
                    : ''
                  }
                `}
              >
                {displayContent}
                {inPath && pathIdx >= 0 && (
                  <div className="absolute top-0 right-0 w-5 h-5 bg-green-600 text-white text-xs rounded-bl-lg flex items-center justify-center">
                    {pathIdx + 1}
                  </div>
                )}
              </div>
            )
          })}
        </div>
      ))}

      {/* Legend */}
      <div className="mt-4 flex gap-4 text-xs text-gray-600">
        <div className="flex items-center gap-1">
          <div className="w-4 h-4 bg-blue-200 border border-blue-500 rounded"></div>
          <span>Выбранная клетка</span>
        </div>
        <div className="flex items-center gap-1">
          <div className="w-4 h-4 bg-green-200 border border-green-500 rounded"></div>
          <span>Путь слова</span>
        </div>
        <div className="flex items-center gap-1">
          <div className="w-4 h-4 bg-yellow-50 border border-yellow-400 rounded"></div>
          <span>Доступно для клика</span>
        </div>
      </div>
    </div>
  )
}