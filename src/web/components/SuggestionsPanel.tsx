import type { GameState, Suggestion } from '../lib/client'
import { memo } from 'react'
import { GAME_CONFIG } from '../constants/game'
import { cn } from '../utils/classNames'

interface SuggestionsPanelProps {
  suggestions: Suggestion[]
  loadingSuggestions: boolean
  onSuggestionSelect: (suggestion: Suggestion) => void
  currentGame: GameState
}

/**
 * Suggestions Panel Component
 * Displays AI move suggestions in an expandable panel
 */
export const SuggestionsPanel = memo(({
  suggestions,
  loadingSuggestions,
  onSuggestionSelect,
  currentGame,
}: SuggestionsPanelProps) => {
  if (loadingSuggestions) {
    return (
      <div className="flex items-center justify-center py-[var(--spacing-resp-sm)]">
        <div className="animate-spin h-8 w-8 border-b-4 border-yellow-400 mr-[var(--spacing-resp-sm)]"></div>
        <div className="text-gray-400 font-semibold">Загрузка подсказок...</div>
      </div>
    )
  }

  if (suggestions.length === 0) {
    return (
      <div className="text-center py-[var(--spacing-resp-sm)] text-gray-500">
        Нет доступных подсказок
      </div>
    )
  }

  return (
    <div className="flex flex-col">
      <div className="text-sm text-gray-300 mb-[var(--spacing-resp-md)] font-bold uppercase tracking-wide flex items-center justify-between shrink-0">
        <span className="flex items-center gap-[var(--spacing-resp-sm)]">
          💡 Подсказки AI
        </span>
        <span className="text-yellow-400 text-lg">
          {suggestions.length}
          {' '}
          доступно
        </span>
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-[var(--spacing-resp-sm)] pb-[var(--spacing-resp-sm)]">
        {suggestions.slice(0, GAME_CONFIG.MAX_SUGGESTIONS_DISPLAY).map((suggestion, index) => {
          const posStr = `${suggestion.position.row}${String.fromCharCode(1040 + suggestion.position.col)}`
          const scoreColor = suggestion.score >= GAME_CONFIG.SCORE_THRESHOLDS.HIGH
            ? 'text-green-400'
            : suggestion.score >= GAME_CONFIG.SCORE_THRESHOLDS.MEDIUM
              ? 'text-yellow-400'
              : 'text-gray-400'

          return (
            <button
              key={`${suggestion.word}-${index}`}
              type="button"
              onClick={() => onSuggestionSelect(suggestion)}
              aria-label={`Подсказка ${index + 1}: ${suggestion.word}, буква ${suggestion.letter} на позиции ${posStr}, ${suggestion.score} очков`}
              className="group bg-gray-750 hover:bg-gray-700 border border-gray-600 hover:border-yellow-500 transition-all duration-200 hover:shadow-depth-3 px-[var(--spacing-resp-sm)] py-[var(--spacing-resp-sm)] flex items-center gap-[var(--spacing-resp-sm)]"
            >
              {/* Rank Badge */}
              <div className="bg-gray-800 text-gray-500 font-black text-xs px-[var(--spacing-resp-sm)] py-[var(--spacing-resp-xs)] shrink-0" aria-hidden="true">
                #
                {index + 1}
              </div>

              {/* Word - Hero Element */}
              <div className="flex-1 text-white font-black uppercase text-lg tracking-wider text-left truncate">
                {suggestion.word}
              </div>

              {/* Position + Letter */}
              <div className="flex items-center gap-[var(--spacing-resp-xs)] shrink-0">
                <span className="text-cyan-400 font-mono font-bold text-xs bg-gray-800 bg-opacity-50 px-[var(--spacing-resp-xs)] py-[var(--spacing-resp-xs)]">
                  {posStr}
                </span>
                <span className="text-green-400 font-black text-2xl leading-none">
                  {suggestion.letter}
                </span>
              </div>

              {/* Score */}
              <div className={cn(scoreColor, 'font-black text-xl shrink-0 min-w-[32px] text-right')}>
                {suggestion.score.toFixed(0)}
              </div>
            </button>
          )
        })}
      </div>
    </div>
  )
})

SuggestionsPanel.displayName = 'SuggestionsPanel'
