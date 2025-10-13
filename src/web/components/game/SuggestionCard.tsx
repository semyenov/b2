import type { Suggestion } from '../../lib/client'
import type { ScoreTier } from '../../utils/suggestionHelpers'
import { memo } from 'react'
import { cn } from '../../utils/classNames'
import { getScoreColor, getSuggestionCoordLabel } from '../../utils/suggestionHelpers'
import { Badge } from '../ui'

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
  const scoreVariant = getScoreColor(suggestion.score)

  return (
    <button
      type="button"
      onClick={() => onClick(suggestion)}
      aria-label={`Подсказка ${rank}: ${suggestion.word}, буква ${suggestion.letter} на позиции ${posStr}, ${suggestion.score} очков`}
      className={cn(
        // Base styles - matching sidebar word list style
        'group relative w-full transition-all duration-300',
        'bg-slate-800 border border-slate-700 hover:border-cyan-400',
        'hover:shadow-lg hover:shadow-cyan-400/10 hover:scale-[1.005]',
        'hover:bg-slate-700',
        'px-4 py-3',
        'flex items-center justify-between',
        // Keyboard focus
        isKeyboardFocused && 'ring-2 ring-cyan-400',
      )}
    >
      <div className="flex items-center gap-3">
        {/* Score Badge */}
        <div className="w-8 h-8 bg-cyan-500/20 flex items-center justify-center text-xs font-bold text-cyan-300">
          {Math.round(suggestion.score)}
        </div>

        {/* Word - Hero Element */}
        <span className="font-bold text-xl text-slate-300 group-hover:text-slate-300 transition-colors duration-200">
          {suggestion.word}
        </span>
      </div>

      <div className="flex items-center gap-4">
        {/* Position Badge */}
        <div className="flex items-center gap-3">
          <span className="text-cyan-300 font-mono font-bold text-lg">
            {posStr}
          </span>
          <div className="bg-yellow-500/20 border border-yellow-500/30 px-2 py-1">
            <span className="text-yellow-300 font-black text-lg">
              {suggestion.letter}
            </span>
          </div>
        </div>

      </div>

      {/* Hover effect overlay */}
      <div className="absolute inset-0 bg-cyan-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
    </button>
  )
})

SuggestionCard.displayName = 'SuggestionCard'
