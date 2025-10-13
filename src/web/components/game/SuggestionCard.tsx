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
        // Base styles - matching alphabet button style
        'group relative w-full',
        'bg-slate-700 hover:bg-slate-600',
        'border-2 border-slate-600 hover:border-cyan-400',
        'transition-all duration-200',
        'hover:ring-2 hover:ring-cyan-400',
        'hover:shadow-depth-2',
        'px-3 py-2.5',
        'flex items-center gap-2.5',
        // Keyboard focus
        isKeyboardFocused && 'ring-2 ring-cyan-400',
      )}
    >
      {/* Rank Badge */}
      <div
        className="text-slate-400 font-bold text-xs shrink-0 leading-none min-w-[20px] text-center"
        aria-hidden="true"
      >
        {rank}
      </div>

      {/* Word - Hero Element */}
      <div className="flex-1 text-slate-100 font-black uppercase text-base tracking-wide text-left truncate">
        {suggestion.word}
      </div>

      {/* Position + Letter */}
      <div className="flex items-center gap-1.5 shrink-0">
        <span className="text-cyan-400 font-mono font-bold text-xs px-1.5 py-0.5 leading-none">
          {posStr}
        </span>
        <span className="text-yellow-400 font-black text-lg leading-none">
          {suggestion.letter}
        </span>
      </div>

      {/* Score Badge */}
      <Badge variant={scoreVariant} size="md" className="min-w-[40px] text-center font-black text-base">
        {Math.round(suggestion.score)}
      </Badge>
    </button>
  )
})

SuggestionCard.displayName = 'SuggestionCard'
