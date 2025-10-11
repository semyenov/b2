import type { GameState } from '../lib/client'
import { useCallback, useState } from 'react'
import { A11Y_LABELS, GAME_CONFIG, RUSSIAN_ALPHABET } from '../constants/game'
import { cn } from '../utils/classNames'
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

  // Keyboard handler for letter buttons
  const handleLetterKeyDown = useCallback((
    event: React.KeyboardEvent,
    letter: string,
    isDisabled: boolean,
  ) => {
    if (isDisabled)
      return

    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault()
      onLetterSelect?.(letter)
    }
  }, [onLetterSelect])

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
        <div
          className="flex-1 min-h-0 flex items-center justify-center py-[var(--spacing-resp-sm)] px-[var(--spacing-resp-sm)]"
          role="group"
          aria-label="Выбор буквы для размещения на доске"
        >
          <div className="grid gap-[var(--spacing-resp-xs)] w-full max-w-[min(100%,1200px)] h-full" style={{ gridTemplateColumns: `repeat(${GAME_CONFIG.ALPHABET_GRID_COLUMNS}, minmax(0, 1fr))` }}>
            {RUSSIAN_ALPHABET.map((letter) => {
              const isDisabled = disabled || !selectedCell || !!selectedLetter
              const isSelected = selectedLetter === letter
              const isHovered = hoveredLetter === letter && !disabled && selectedCell && !selectedLetter

              return (
                <button
                  key={letter}
                  type="button"
                  onClick={() => onLetterSelect?.(letter)}
                  onKeyDown={e => handleLetterKeyDown(e, letter, isDisabled && !isSelected)}
                  onMouseEnter={() => setHoveredLetter(letter)}
                  onMouseLeave={() => setHoveredLetter('')}
                  disabled={isDisabled && !isSelected}
                  aria-label={isSelected ? A11Y_LABELS.LETTER_BUTTON_SELECTED(letter) : A11Y_LABELS.LETTER_BUTTON(letter)}
                  aria-pressed={isSelected}
                  className={cn(
                    'aspect-square font-black text-[var(--text-resp-xl)] transition-all duration-200',
                    {
                      'bg-blue-600 text-white shadow-depth-3 ring-2 ring-blue-400 transform scale-105': isSelected,
                      'bg-yellow-500 text-gray-900 transform scale-105 shadow-depth-3': isHovered,
                      'bg-gray-650 text-gray-100 border-2 border-gray-600 hover:bg-gray-600 hover:border-gray-500': !isSelected && !isHovered,
                      'opacity-30 cursor-not-allowed': isDisabled && !isSelected,
                      'cursor-pointer hover:shadow-depth-2 hover:scale-105': !isDisabled || isSelected,
                    },
                  )}
                >
                  {letter}
                </button>
              )
            })}
          </div>
        </div>
      </div>
    </div>
  )
}
