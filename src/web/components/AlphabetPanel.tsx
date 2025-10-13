import { A11Y_LABELS, RUSSIAN_ALPHABET } from '../constants/game'
import { memo } from 'react'
import { useHover } from '../hooks/useHover'
import { useKeyboardNavigation } from '../hooks/useKeyboardNavigation'
import { cn } from '../utils/classNames'
import { isLetterButtonDisabled } from '../utils/uiHelpers'

interface AlphabetPanelProps {
  selectedLetter?: string
  disabled?: boolean
  selectedCell?: { row: number, col: number }
  onLetterSelect?: (letter: string) => void
}

/**
 * Alphabet Panel Component
 * Displays Russian alphabet grid for letter selection
 * Used in game play when player selects an empty cell
 */
export const AlphabetPanel = memo((({
  selectedLetter,
  disabled,
  selectedCell,
  onLetterSelect,
}: AlphabetPanelProps) => {
  const { hoveredItem: hoveredLetter, handleMouseEnter, handleMouseLeave } = useHover<string>()
  const { handleKeyDown } = useKeyboardNavigation()

  return (
    <div
      className="flex-1 min-h-0 flex items-stretch px-[var(--spacing-resp-sm)] py-3 pb-4"
      role="group"
      aria-label="Выбор буквы для размещения на доске"
    >
      <div className="alphabet-grid grid gap-1.5 w-full h-full">
        {RUSSIAN_ALPHABET.map((letter) => {
          const isSelected = selectedLetter === letter
          const buttonDisabled = isLetterButtonDisabled(!!disabled, selectedCell, selectedLetter, letter)
          const isHovered = hoveredLetter === letter && !disabled && selectedCell && !selectedLetter

          return (
            <button
              key={letter}
              type="button"
              onClick={() => onLetterSelect?.(letter)}
              onKeyDown={e => handleKeyDown(e, () => onLetterSelect?.(letter), buttonDisabled)}
              onMouseEnter={() => handleMouseEnter(letter)}
              onMouseLeave={handleMouseLeave}
              disabled={buttonDisabled}
              aria-label={isSelected ? A11Y_LABELS.LETTER_BUTTON_SELECTED(letter) : A11Y_LABELS.LETTER_BUTTON(letter)}
              aria-pressed={isSelected}
              className={cn(
                'h-full w-full font-black text-xl sm:text-2xl transition-all duration-200 border-2',
                {
                  'bg-blue-600 border-blue-300 text-white shadow-depth-3 ring-4 ring-blue-400/70 transform scale-105': isSelected,
                  'bg-yellow-400 border-yellow-300 text-gray-900 transform scale-105 shadow-depth-3 ring-4 ring-yellow-400/70': isHovered,
                  'bg-slate-700 text-gray-100 border-slate-600 hover:bg-slate-600 hover:border-cyan-400 hover:ring-2 hover:ring-cyan-400/50': !isSelected && !isHovered,
                  'opacity-30 cursor-not-allowed': buttonDisabled,
                  'cursor-pointer hover:shadow-depth-2 hover:scale-105 active:scale-95': !buttonDisabled,
                },
              )}
            >
              {letter}
            </button>
          )
        })}
      </div>
    </div>
  )
}) as React.FC<AlphabetPanelProps>)

AlphabetPanel.displayName = 'AlphabetPanel'
