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
    const hasLetter = cell || isSelected(row, col)

    // First letter: can be any letter on board (no adjacency requirement)
    if (wordPath.length === 0) {
      return hasLetter
    }

    // Subsequent letters: must be orthogonally adjacent to last letter in path
    const lastPos = wordPath[wordPath.length - 1]
    const isAdjacent = (Math.abs(row - lastPos.row) === 1 && col === lastPos.col) ||
                       (Math.abs(col - lastPos.col) === 1 && row === lastPos.row)

    return isAdjacent && hasLetter && !isInWordPath(row, col)
  }

  return (
    <div className="bg-gray-800 p-4 rounded-lg shadow-xl border border-gray-600">
      {/* Column headers */}
      <div className="flex mb-0.5">
        <div className="w-12 h-6" /> {/* Empty corner */}
        {Array.from({ length: size }, (_, i) => (
          <div key={i} className="w-12 h-6 flex items-center justify-center text-cyan-400 font-bold text-xs">
            {String.fromCharCode(1040 + i)} {/* Russian letters А-Я */}
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
                  w-12 h-12 border-2 flex items-center justify-center text-xl font-bold
                  transition-all relative
                  ${selected
                    ? 'bg-blue-600 border-blue-400 text-white shadow-inner'
                    : inPath
                    ? 'bg-green-600 border-green-400 text-white'
                    : cell
                    ? 'bg-gray-700 border-gray-500 text-green-400'
                    : 'bg-gray-900 border-gray-700 text-gray-600'
                  }
                  ${canClick
                    ? 'cursor-pointer hover:shadow-md hover:transform hover:scale-105'
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
                  <div className="absolute top-0 right-0 w-4 h-4 bg-green-700 text-white text-[10px] rounded-bl flex items-center justify-center font-bold">
                    {pathIdx + 1}
                  </div>
                )}
              </div>
            )
          })}
        </div>
      ))}

      {/* Legend */}
      <div className="mt-2 flex gap-3 text-[10px] text-gray-500">
        <div className="flex items-center gap-1">
          <div className="w-3 h-3 bg-blue-600 border border-blue-400 rounded"></div>
          <span>Выбрана</span>
        </div>
        <div className="flex items-center gap-1">
          <div className="w-3 h-3 bg-green-600 border border-green-400 rounded"></div>
          <span>Путь</span>
        </div>
        <div className="flex items-center gap-1">
          <div className="w-3 h-3 bg-gray-600 border border-yellow-400 rounded"></div>
          <span>Доступно</span>
        </div>
      </div>
    </div>
  )
}