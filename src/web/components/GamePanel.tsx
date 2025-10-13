import type { Suggestion } from '../lib/client'
import { cn } from '../utils/classNames'
import { shouldShowAlphabetPanel } from '../utils/uiHelpers'
import { AlphabetPanel } from './AlphabetPanel'
import { SuggestionsPanel } from './SuggestionsPanel'

export interface GamePanelProps {
  disabled?: boolean
  selectedCell?: { row: number, col: number }
  selectedLetter?: string
  onLetterSelect?: (letter: string) => void
  showSuggestions?: boolean
  suggestions?: Suggestion[]
  loadingSuggestions?: boolean
  onSuggestionSelect?: (suggestion: Suggestion) => void
}

/**
 * Game Panel Component
 * Container that switches between alphabet grid and AI suggestions panel
 * Positioned at bottom of screen with slide-up animation
 */
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
        height: showSuggestions ? 'min(50vh, 400px)' : 'min(40vh, 320px)',
        paddingBottom: 'var(--height-control-panel)', // Match control panel height
      }}
    >
      {showSuggestions
        ? (
          /* Suggestions View */
            <div className="flex-1 min-h-0 overflow-y-auto scrollbar-custom relative">
              {/* Scroll indicator shadows */}
              <div className="sticky top-0 h-4 bg-gradient-to-b from-gray-800 to-transparent pointer-events-none z-20" />
              {onSuggestionSelect && (
                <SuggestionsPanel
                  suggestions={suggestions}
                  loadingSuggestions={loadingSuggestions}
                  onSuggestionSelect={onSuggestionSelect}
                />
              )}
              <div className="sticky bottom-0 h-4 bg-gradient-to-t from-gray-800 to-transparent pointer-events-none z-20" />
            </div>
          )
        : (
          /* Alphabet Grid */
            <AlphabetPanel
              selectedLetter={selectedLetter}
              disabled={disabled}
              selectedCell={selectedCell}
              onLetterSelect={onLetterSelect}
            />
          )}
    </div>
  )
}
