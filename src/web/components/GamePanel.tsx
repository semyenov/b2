import type { Suggestion } from '../lib/client'
import { useEffect, useState } from 'react'
import { useClickOutside } from '../hooks/useClickOutside'
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
  onClose?: () => void
  onHideSuggestions?: () => void
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
}: GamePanelProps) {
  const shouldShowPanel = shouldShowAlphabetPanel(showSuggestions, selectedCell, selectedLetter)
  const [isVisible, setIsVisible] = useState(false)
  const [isClosing, setIsClosing] = useState(false)

  // Handle panel visibility with animation
  useEffect(() => {
    if (shouldShowPanel) {
      setIsVisible(true)
      setIsClosing(false)
    }
    else if (isVisible) {
      // Start closing animation
      setIsClosing(true)
      // Wait for animation to complete before hiding
      const timer = setTimeout(() => {
        setIsVisible(false)
        setIsClosing(false)
      }, 300) // Match animation duration

      return () => clearTimeout(timer)
    }
  }, [shouldShowPanel, isVisible])

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
        'bg-slate-900 flex flex-col border-t-4 border-cyan-600',
        'shadow-[0_-8px_24px_rgba(0,0,0,0.7)]',
        isClosing ? 'animate-slide-down-panel' : 'animate-slide-up-panel',
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
              {onSuggestionSelect && (
                <SuggestionsPanel
                  suggestions={suggestions}
                  loadingSuggestions={loadingSuggestions}
                  onSuggestionSelect={onSuggestionSelect}
                />
              )}
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
