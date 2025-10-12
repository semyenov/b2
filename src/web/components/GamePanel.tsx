import type { GameState, Suggestion } from '../lib/client'
import { useCallback, useState } from 'react'
import { A11Y_LABELS, GAME_CONFIG, RUSSIAN_ALPHABET } from '../constants/game'
import { cn } from '../utils/classNames'
import { isLetterButtonDisabled, shouldShowAlphabetPanel } from '../utils/uiHelpers'
import { SuggestionsPanel } from './SuggestionsPanel'

interface GamePanelProps {
  game: GameState
  playerName: string
  disabled?: boolean
  selectedCell?: { row: number, col: number }
  selectedLetter?: string
  wordPath?: Array<{ row: number, col: number }>
  onLetterSelect?: (letter: string) => void
  showSuggestions?: boolean
  suggestions?: Suggestion[]
  loadingSuggestions?: boolean
  onSuggestionSelect?: (suggestion: Suggestion) => void
}

export function GamePanel({
  game,
  disabled,
  selectedCell,
  selectedLetter,
  onLetterSelect,
  showSuggestions = false,
  suggestions = [],
  loadingSuggestions = false,
  onSuggestionSelect,
}: GamePanelProps) {
  const [hoveredLetter, setHoveredLetter] = useState<string>('')

  const shouldShowPanel = shouldShowAlphabetPanel(showSuggestions, selectedCell, selectedLetter)

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

  // Only render the panel when it should be shown
  if (!shouldShowPanel) {
    return null
  }

  return (
    <div
      className={cn(
        'absolute bottom-0 left-0 right-0 z-40',
        'bg-gray-800 flex flex-col',
        'shadow-[0_-8px_24px_rgba(0,0,0,0.5)]',
      )}
      style={{
        height: showSuggestions ? 'min(50vh, 400px)' : 'min(35vh, 280px)',
        paddingBottom: '88px', // Reserve space for control bar (~88px measured)
      }}
    >
      {showSuggestions
        ? (
          /* Suggestions View */
          <div className="flex-1 min-h-0 overflow-y-auto">
            <SuggestionsPanel
              suggestions={suggestions}
              loadingSuggestions={loadingSuggestions}
              onSuggestionSelect={onSuggestionSelect!}
              currentGame={game}
            />
          </div>
        )
        : (
          /* Alphabet Grid */
          <div
            className="flex-1 min-h-0 flex items-stretch px-[var(--spacing-resp-sm)] py-2"
            role="group"
            aria-label="Выбор буквы для размещения на доске"
          >
            <div className="grid gap-1.5 w-full h-full" style={{ gridTemplateColumns: `repeat(${GAME_CONFIG.ALPHABET_GRID_COLUMNS}, minmax(0, 1fr))`, gridTemplateRows: 'repeat(3, minmax(0, 1fr))' }}>
              {RUSSIAN_ALPHABET.map((letter) => {
                const isSelected = selectedLetter === letter
                const buttonDisabled = isLetterButtonDisabled(!!disabled, selectedCell, selectedLetter, letter)
                const isHovered = hoveredLetter === letter && !disabled && selectedCell && !selectedLetter

                return (
                  <button
                    key={letter}
                    type="button"
                    onClick={() => onLetterSelect?.(letter)}
                    onKeyDown={e => handleLetterKeyDown(e, letter, buttonDisabled)}
                    onMouseEnter={() => setHoveredLetter(letter)}
                    onMouseLeave={() => setHoveredLetter('')}
                    disabled={buttonDisabled}
                    aria-label={isSelected ? A11Y_LABELS.LETTER_BUTTON_SELECTED(letter) : A11Y_LABELS.LETTER_BUTTON(letter)}
                    aria-pressed={isSelected}
                    className={cn(
                      'h-full w-full font-black text-xl sm:text-2xl transition-all duration-200',
                      {
                        'bg-blue-600 text-white shadow-depth-3 ring-2 ring-blue-400 transform scale-105': isSelected,
                        'bg-yellow-500 text-gray-900 transform scale-105 shadow-depth-3': isHovered,
                        'bg-gray-650 text-gray-100 border-2 border-gray-600 hover:bg-gray-600 hover:border-gray-500': !isSelected && !isHovered,
                        'opacity-30 cursor-not-allowed': buttonDisabled,
                        'cursor-pointer hover:shadow-depth-2 hover:scale-105': !buttonDisabled,
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
