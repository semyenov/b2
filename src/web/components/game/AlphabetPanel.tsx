import { A11Y_LABELS, RUSSIAN_ALPHABET } from '@constants/game'
import { useHover } from '@hooks/useHover'
import { useKeyboardNavigation } from '@hooks/useKeyboardNavigation'
import { cn } from '@utils/classNames'
import { isLetterButtonDisabled } from '@utils/uiHelpers'
import { memo } from 'react'

export interface AlphabetPanelProps {
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
    <div className="flex flex-col h-full w-full min-h-0">
      {/* Header Panel */}
      <div className="px-4 py-4 border-b shrink-0 transition-all duration-300 bg-surface-900 border-surface-700">
        <div className="flex items-center justify-center">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-info-400 rounded-full" />
            <div className="text-sm font-bold text-surface-300 uppercase">
              Выбор буквы
            </div>
          </div>
        </div>
      </div>

      {/* Alphabet Grid */}
      <div
        className="flex-1 min-h-0 flex items-stretch px-4 py-6"
        role="group"
        aria-label="Выбор буквы для размещения на доске"
      >
        <div className="alphabet-grid grid gap-3 w-full h-full">
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
                  'h-full w-full font-black text-xl sm:text-2xl transition-all duration-300 border-2',
                  'group relative',
                  {
                    'bg-user-600 border-user-300 text-white shadow-lg ring-2 ring-user-400': isSelected,
                    'bg-user-400 border-user-300 text-surface-900 shadow-lg ring-2 ring-user-400': isHovered,
                    'bg-surface-800 text-surface-300 border-surface-700 hover:bg-surface-700 hover:border-user-400 hover:ring-2 hover:ring-user-400 hover:shadow-lg hover:shadow-user-400/10 hover:scale-[1.02]': !isSelected && !isHovered && !buttonDisabled,
                    'bg-surface-800 text-surface-500 cursor-not-allowed border-surface-700': buttonDisabled,
                    'cursor-pointer': !buttonDisabled,
                  },
                )}
              >
                {letter}
                {/* Hover effect overlay */}
                {!buttonDisabled && (
                  <div className="absolute inset-0 bg-user-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                )}
              </button>
            )
          })}
        </div>
      </div>
    </div>
  )
}) as React.FC<AlphabetPanelProps>)

AlphabetPanel.displayName = 'AlphabetPanel'
