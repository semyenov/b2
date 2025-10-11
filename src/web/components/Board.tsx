import type { GameState } from '../lib/client'

interface BoardProps {
  game: GameState
}

export function Board({ game }: BoardProps) {
  const { board, size } = game

  return (
    <div className="flex flex-col items-center bg-gray-800 rounded-lg p-4">
      {/* Column headers */}
      <div className="flex mb-1">
        <div className="w-12 h-8" /> {/* Empty corner */}
        {Array.from({ length: size }, (_, i) => (
          <div key={i} className="w-12 h-8 flex items-center justify-center text-cyan-400 font-bold">
            {String.fromCharCode(1040 + i)} {/* Russian letters А-Я */}
          </div>
        ))}
      </div>

      {/* Board rows */}
      {board.map((row, rowIndex) => (
        <div key={rowIndex} className="flex">
          {/* Row number (0-based) */}
          <div className="w-12 h-12 flex items-center justify-center text-gray-400 font-bold">
            {rowIndex}
          </div>

          {/* Cells */}
          {row.map((cell, colIndex) => (
            <div
              key={colIndex}
              className={`
                w-12 h-12 border flex items-center justify-center text-2xl font-bold
                ${cell
                  ? 'bg-gray-700 text-green-400 border-gray-600'
                  : 'bg-gray-900 text-gray-600 border-gray-700'
                }
              `}
            >
              {cell || '·'}
            </div>
          ))}
        </div>
      ))}
    </div>
  )
}