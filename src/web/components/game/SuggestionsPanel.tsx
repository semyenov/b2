import type { Suggestion } from '../../lib/client'
import { memo, useMemo } from 'react'
import { GAME_CONFIG } from '../../constants/game'
import { getScoreTier } from '../../utils/suggestionHelpers'
import { SuggestionCard } from './SuggestionCard'
import { Spinner } from '../ui'
import { cn } from '../../utils/classNames'

export interface SuggestionsPanelProps {
  suggestions: Suggestion[]
  loadingSuggestions: boolean
  onSuggestionSelect: (suggestion: Suggestion) => void
}

/**
 * Suggestions Panel Component
 * Modern AI suggestions display with enhanced visual design,
 * better typography, improved animations, and consistent styling
 * that matches the sidebar and other game elements
 */
export const SuggestionsPanel = memo<SuggestionsPanelProps>(({
  suggestions,
  loadingSuggestions,
  onSuggestionSelect,
}) => {
  // Limit suggestions to max display
  const limitedSuggestions = useMemo(
    () => suggestions.slice(0, GAME_CONFIG.MAX_SUGGESTIONS_DISPLAY),
    [suggestions],
  )

  if (loadingSuggestions) {
    return (
      <div className="flex items-center justify-center h-full min-h-[200px]">
        <div className="flex flex-col items-center gap-4">
          <Spinner size="lg" />
          <div className="text-slate-400 text-sm font-medium">
            Загрузка подсказок...
          </div>
        </div>
      </div>
    )
  }

  if (suggestions.length === 0) {
    return (
      <div className="flex items-center justify-center h-full min-h-[200px]">
        <div className="flex flex-col items-center gap-4 text-center">
          <div className="w-16 h-16 bg-slate-800 flex items-center justify-center rounded-lg border border-slate-700">
            <span className="text-2xl">🤔</span>
          </div>
          <div className="text-slate-400 text-sm font-medium">
            Нет доступных подсказок
          </div>
          <div className="text-slate-500 text-xs">
            AI не может найти подходящие ходы
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="flex flex-col h-full w-full min-h-0">
      {/* Header Panel */}
      <div className="px-4 py-4 border-b shrink-0 transition-all duration-300 bg-slate-900 border-slate-700">
        <div className="flex items-center justify-center">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-cyan-400 rounded-full" />
            <div className="text-sm font-bold text-slate-300">
              AI Подсказки
            </div>
          </div>
        </div>
      </div>

      {/* Suggestions List */}
      <div className="flex-1 overflow-y-auto px-4 py-4 min-h-0 relative">
        <div className="space-y-2">
          {limitedSuggestions.map((suggestion, index) => (
            <div
              key={`${suggestion.word}-${index}`}
              className="animate-fade-slide-in"
              style={{ animationDelay: `${index * 50}ms` }}
            >
              <SuggestionCard
                suggestion={suggestion}
                rank={index + 1}
                tier={getScoreTier(suggestion.score)}
                onClick={onSuggestionSelect}
              />
            </div>
          ))}
        </div>
      </div>
    </div>
  )
})

SuggestionsPanel.displayName = 'SuggestionsPanel'
