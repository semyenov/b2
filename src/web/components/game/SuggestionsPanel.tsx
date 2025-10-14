import type { Suggestion } from '@lib/client'
import { GAME_CONFIG } from '@constants/game'
import { getScoreTier } from '@utils/suggestionHelpers'
import { memo, useMemo } from 'react'
import { Spinner } from '../ui'
import { SuggestionCard } from './SuggestionCard'

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
          <div className="text-surface-400 text-sm font-medium">
            Загрузка подсказок...
          </div>
        </div>
      </div>
    )
  }

  if (suggestions.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-full text-center px-6">
        <div className="space-y-6">
          <div className="space-y-0.5">
            <div className="text-surface-500 text-2xl font-bold tracking-wide uppercase leading-tight">
              ПУСТО
            </div>
            <div className="text-surface-600 text-sm leading-tight max-w-[200px]">
              AI не может найти подходящие ходы
            </div>
          </div>
          <div className="flex flex-col gap-3 opacity-30">
            <div className="h-px w-24 bg-gradient-to-r from-transparent via-surface-700 to-transparent mx-auto" />
            <div className="h-px w-16 bg-gradient-to-r from-transparent via-surface-700 to-transparent mx-auto" />
            <div className="h-px w-20 bg-gradient-to-r from-transparent via-surface-700 to-transparent mx-auto" />
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="flex flex-col h-full w-full min-h-0">
      {/* Header Panel */}
      <div className="px-4 py-4 border-b shrink-0 transition-all duration-300 bg-surface-900 border-surface-700">
        <div className="flex items-center justify-center">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-info-400 rounded-full" />
            <div className="text-sm font-bold text-surface-300 uppercase">
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
