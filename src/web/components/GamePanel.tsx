import type { GameState, Suggestion } from '../lib/client'
import { useCallback, useState } from 'react'
import { A11Y_LABELS, RUSSIAN_ALPHABET } from '../constants/game'
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
      className="absolute bottom-0 left-0 right-0 z-game-panel bg-slate-800 flex flex-col border-t-2 border-slate-700 shadow-depth-3"
      style={{
        height: showSuggestions ? 'min(45vh, 400px)' : 'min(32vh, 260px)',
        paddingBottom: 'calc(var(--spacing-resp-md) * 2 + 48px)', // Exact control bar space
        marginLeft: '0',
        marginRight: '0',
        paddingLeft: 'var(--spacing-resp-xs)',
        paddingRight: 'var(--spacing-resp-xs)',
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
              className="flex-1 min-h-0 flex items-stretch px-[var(--spacing-resp-xs)] py-[var(--spacing-resp-xs)]"
              role="group"
              aria-label="Выбор буквы для размещения на доске"
            >
              <div className="alphabet-grid grid w-full h-full">
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
                        'h-full w-full font-black text-[var(--text-resp-2xl)] transition-all duration-200 border-2',
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
