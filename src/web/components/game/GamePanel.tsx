import type { Suggestion } from '@lib/client'
import { useAnimatedPanel } from '@hooks/useAnimatedPanel'
import { useClickOutside } from '@hooks/useClickOutside'
import { cn } from '@utils/classNames'
import { shouldShowAlphabetPanel } from '@utils/uiHelpers'
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
  onClose?: () => void
  onHideSuggestions?: () => void
  excludeRefs?: React.RefObject<HTMLElement | null>[]
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
  onClose,
  onHideSuggestions,
  excludeRefs = [],
}: GamePanelProps) {
  const shouldShowPanel = shouldShowAlphabetPanel(showSuggestions, selectedCell, selectedLetter)

  // Use extracted animation hook
  const { isVisible, isClosing } = useAnimatedPanel(shouldShowPanel)

  // Click outside handler - only active when panel is shown
  const panelRef = useClickOutside<HTMLDivElement>(
    () => {
      // If showing suggestions, hide them; otherwise clear selection
      if (showSuggestions && onHideSuggestions) {
        onHideSuggestions()
      }
      else if (onClose) {
        onClose()
      }
    },
    shouldShowPanel && !isClosing,
    excludeRefs,
  )

  // Don't render if not visible
  if (!isVisible) {
    return null
  }

  return (
    <div
      ref={panelRef}
      className={cn(
        'absolute bottom-0 left-0 right-0 z-40',
        'bg-surface-800 border-t-2 border-info-800',
        'shadow-[0_-8px_24px_rgba(0,0,0,0.7)]',
        'overflow-y-auto scrollbar-custom',
        isClosing ? 'animate-slide-down-panel' : 'animate-slide-up-panel',
      )}
      style={{
        height: 'min(45vh, 380px)',
        paddingBottom: 'var(--height-control-panel)', // Match control panel height
      }}
    >
      {showSuggestions && onSuggestionSelect
        ? (
            <SuggestionsPanel
              suggestions={suggestions}
              loadingSuggestions={loadingSuggestions}
              onSuggestionSelect={onSuggestionSelect}
            />
          )
        : (
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
