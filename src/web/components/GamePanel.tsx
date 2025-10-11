import type { GameState } from '../lib/client'
import { useState } from 'react'
import { formWordFromPath } from '../utils/moveValidation'
import { Board } from './Board'

interface GamePanelProps {
  game: GameState
  playerName: string
  disabled?: boolean
  selectedCell?: { row: number, col: number }
  selectedLetter?: string
  wordPath?: Array<{ row: number, col: number }>
  onCellClick?: (row: number, col: number) => void
  onLetterSelect?: (letter: string) => void
}

const RUSSIAN_ALPHABET = 'АБВГДЕЁЖЗИЙКЛМНОПРСТУФХЦЧШЩЪЫЬЭЮЯ'.split('')

export function GamePanel({
  game,
  disabled,
  selectedCell,
  selectedLetter,
  wordPath = [],
  onCellClick,
  onLetterSelect,
}: GamePanelProps) {
  const [hoveredLetter, setHoveredLetter] = useState<string>('')

  return (
    <div className="flex flex-col h-full min-h-0 justify-center gap-[var(--spacing-resp-md)]">
      {/* Board Section */}
      <div className="flex items-center justify-center min-h-0 overflow-hidden max-h-[65%]">
        <Board
          game={game}
          selectedCell={selectedCell}
          selectedLetter={selectedLetter}
          wordPath={wordPath}
          onCellClick={onCellClick}
          disabled={disabled}
        />
      </div>

      {/* Alphabet Section */}
      <div className="bg-gray-800 border-2 border-gray-700 shadow-depth-3 flex flex-col max-h-[32%] min-h-[180px]">
        {/* Alphabet Grid */}
        <div className="flex-1 min-h-0 flex items-center justify-center py-[var(--spacing-resp-sm)] px-[var(--spacing-resp-sm)]">
          <div className="grid grid-cols-11 gap-[var(--spacing-resp-xs)] w-full max-w-[min(100%,1200px)] h-full">
            {RUSSIAN_ALPHABET.map(letter => (
              <button
                key={letter}
                onClick={() => onLetterSelect?.(letter)}
                onMouseEnter={() => setHoveredLetter(letter)}
                onMouseLeave={() => setHoveredLetter('')}
                disabled={disabled || !selectedCell || !!selectedLetter}
                className={`aspect-square font-black text-[var(--text-resp-xl)] transition-all duration-200 ${selectedLetter === letter
                  ? 'bg-blue-600 text-white shadow-depth-3 ring-2 ring-blue-400 transform scale-105'
                  : hoveredLetter === letter && !disabled && selectedCell && !selectedLetter
                    ? 'bg-yellow-500 text-gray-900 transform scale-105 shadow-depth-3'
                    : 'bg-gray-650 text-gray-100 border-2 border-gray-600 hover:bg-gray-600 hover:border-gray-500'
                } ${(disabled || !selectedCell || !!selectedLetter) && selectedLetter !== letter
                  ? 'opacity-30 cursor-not-allowed'
                  : 'cursor-pointer hover:shadow-depth-2 hover:scale-105'
                }`}
              >
                {letter}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
