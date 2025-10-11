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
  playerName: _playerName,
  disabled,
  selectedCell,
  selectedLetter,
  wordPath = [],
  onCellClick,
  onLetterSelect,
}: GamePanelProps) {
  const [hoveredLetter, setHoveredLetter] = useState<string>('')

  const wordFormed = formWordFromPath(wordPath, game.board, selectedCell, selectedLetter)

  // Determine current step
  const currentStep = !selectedCell ? 1 : !selectedLetter ? 2 : wordPath.length < 2 ? 3 : 4

  return (
    <div className="flex flex-col h-full min-h-0">
      {/* Board Section - Centered, with max size constraint */}
      <div className="flex items-center justify-center min-h-0 flex-grow overflow-visible" style={{ maxHeight: '60%' }}>
        <Board
          game={game}
          selectedCell={selectedCell}
          selectedLetter={selectedLetter}
          wordPath={wordPath}
          onCellClick={onCellClick}
          disabled={disabled}
        />
      </div>

      {/* Controls Section - Alphabet Only */}
      <div className="bg-gray-800 border-2 border-gray-700 shadow-depth-3 flex-shrink-0 mt-[clamp(0.25rem,0.5vh,0.5rem)]">
        {/* Word Display (if formed) - Compact */}
        {wordFormed && (
          <div className="border-b-2 border-gray-600 py-[clamp(0.5rem,1vh,0.75rem)] bg-gray-700">
            <div className="text-[clamp(2rem,4vw,3rem)] font-black font-mono tracking-widest text-center text-cyan-400">
              {wordFormed}
            </div>
          </div>
        )}

        {/* Alphabet Grid - Enhanced Visibility */}
        <div className="p-[clamp(0.25rem,0.5vw,0.5rem)]">
          <div className="grid grid-cols-11 gap-[clamp(0.375rem,0.75vw,0.5rem)] w-full max-w-[min(100%,1200px)] mx-auto">
            {RUSSIAN_ALPHABET.map(letter => (
              <button
                key={letter}
                onClick={() => onLetterSelect?.(letter)}
                onMouseEnter={() => setHoveredLetter(letter)}
                onMouseLeave={() => setHoveredLetter('')}
                disabled={disabled || !selectedCell || !!selectedLetter}
                className={`aspect-square font-black text-[clamp(1.5rem,3vw,2.5rem)] transition-all duration-200 ${selectedLetter === letter
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
