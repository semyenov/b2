import type { Suggestion } from '../lib/client'
import { A11Y_LABELS, RUSSIAN_ALPHABET } from '../constants/game'
import { useHover } from '../hooks/useHover'
import { useKeyboardNavigation } from '../hooks/useKeyboardNavigation'
import { cn } from '../utils/classNames'
import { isLetterButtonDisabled, shouldShowAlphabetPanel } from '../utils/uiHelpers'
import { SuggestionsPanel } from './SuggestionsPanel'

interface GamePanelProps {
  disabled?: boolean
  selectedCell?: { row: number, col: number }
  selectedLetter?: string
  onLetterSelect?: (letter: string) => void
  showSuggestions?: boolean
  suggestions?: Suggestion[]
  loadingSuggestions?: boolean
  onSuggestionSelect?: (suggestion: Suggestion) => void
}

export function GamePanel({
  disabled,
  selectedCell,
  selectedLetter,
  onLetterSelect,
  showSuggestions = false,
  suggestions = [],
  loadingSuggestions = false,
  onSuggestionSelect,
}: GamePanelProps) {
  // Use extracted hooks
  const { hoveredItem: hoveredLetter, handleMouseEnter, handleMouseLeave } = useHover<string>()
  const { handleKeyDown } = useKeyboardNavigation()

  const shouldShowPanel = shouldShowAlphabetPanel(showSuggestions, selectedCell, selectedLetter)

  // Only render the panel when it should be shown
  if (!shouldShowPanel) {
    return null
  }

  return (
    <div
      className={cn(
        'absolute bottom-0 left-0 right-0 z-40',
        'bg-slate-900 flex flex-col border-t-4 border-cyan-400/30',
        'shadow-[0_-8px_24px_rgba(0,0,0,0.7)]',
        'animate-slide-up-panel',
      )}
      style={{
        height: showSuggestions ? 'min(50vh, 400px)' : 'min(35vh, 280px)',
        paddingBottom: 'var(--height-control-panel)', // Match control panel height
      }}
    >
      {showSuggestions
        ? (
          /* Suggestions View */
            <div className="flex-1 min-h-0 overflow-y-auto scrollbar-custom relative">
              {/* Scroll indicator shadows */}
              <div className="sticky top-0 h-4 bg-gradient-to-b from-gray-800 to-transparent pointer-events-none z-20" />
              <SuggestionsPanel
                suggestions={suggestions}
                loadingSuggestions={loadingSuggestions}
                onSuggestionSelect={onSuggestionSelect!}
              />
              <div className="sticky bottom-0 h-4 bg-gradient-to-t from-gray-800 to-transparent pointer-events-none z-20" />
            </div>
          )
        : (
          /* Alphabet Grid */
            <div
              className="flex-1 min-h-0 flex items-stretch px-[var(--spacing-resp-sm)] py-2"
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
          )}
    </div>
  )
}
