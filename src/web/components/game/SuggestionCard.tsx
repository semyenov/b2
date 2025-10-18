import type { Suggestion } from '@lib/client'
import type { ScoreTier } from '@utils/suggestionHelpers'
import { UI_MESSAGES } from '@constants/messages'
import { cn } from '@utils/classNames'
import { getSuggestionCoordLabel } from '@utils/suggestionHelpers'
import { memo } from 'react'

export interface SuggestionCardProps {
  /**
   * Suggestion data
   */
  suggestion: Suggestion

  /**
   * Display rank (1-indexed)
   */
  rank: number

  /**
   * Score tier for visual styling
   */
  tier: ScoreTier

  /**
   * Click handler
   */
  onClick: (suggestion: Suggestion) => void

  /**
   * Whether keyboard navigation is active
   */
  isKeyboardFocused?: boolean
}

/**
 * SuggestionCard - Individual suggestion display component
 *
 * Displays a single AI move suggestion with:
 * - Rank badge
 * - Word (prominent display)
 * - Position coordinate
 * - Letter to place
 * - Score with color-coding
 *
 * Uses Button-like interaction patterns but with custom layout
 *
 * @example
 * ```tsx
 * <SuggestionCard
 *   suggestion={{ word: "БАЛДА", letter: "Л", position: {row: 2, col: 3}, score: 12 }}
 *   rank={1}
 *   tier="high"
 *   onClick={handleClick}
 * />
 * ```
 */
export const SuggestionCard = memo(({
  suggestion,
  rank,
  tier: _tier,
  onClick,
  isKeyboardFocused = false,
}: SuggestionCardProps) => {
  const posStr = getSuggestionCoordLabel(suggestion)

  return (
    <button
      type="button"
      onClick={() => onClick(suggestion)}
      aria-label={UI_MESSAGES.SUGGESTION_ARIA(rank, suggestion.word, suggestion.letter, posStr, suggestion.score)}
      className={cn(
        // Base styles
        'group relative w-full transition-all duration-300',
        'bg-surface-800 border border-surface-700 hover:border-info-400',
        'hover:shadow-lg hover:shadow-info-400/10 hover:scale-[1.005]',
        'hover:bg-surface-700',
        'px-4 py-3',
        'flex items-center gap-3',
        // Keyboard focus
        isKeyboardFocused && 'ring-2 ring-info-400',
      )}
    >
      {/* Score Badge */}
      <div className="bg-info-500/20 flex items-center justify-center px-2 py-1 text-xs font-bold text-info-300 flex-shrink-0">
        {Math.round(suggestion.score)}
      </div>

      {/* Word - Hero Element */}
      <span className="font-bold text-xl text-surface-300 group-hover:text-surface-300 transition-colors duration-200 flex-shrink-0">
        {suggestion.word}
      </span>

      {/* Spacer */}
      <div className="flex-1" />

      {/* Position Label */}
      <span className="text-info-200 font-mono font-black text-xl flex-shrink-0">
        {posStr}
      </span>

      {/* Letter Badge */}
      <div className="bg-info-500/20 border border-info-500/30 px-2 py-1 flex items-center justify-center flex-shrink-0">
        <span className="text-info-300 font-black text-lg">
          {suggestion.letter}
        </span>
      </div>

      {/* Hover effect overlay */}
      <div className="absolute inset-0 bg-info-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
    </button>
  )
})

SuggestionCard.displayName = 'SuggestionCard'
