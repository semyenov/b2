import type { Suggestion } from '@lib/client'
import { GAME_CONFIG } from '@constants/game'
import { getScoreTier } from '@utils/suggestionHelpers'
import { memo, useMemo } from 'react'
import { Spinner } from '../ui'
import { PanelContainer } from './PanelContainer'
import { SuggestionCard } from './SuggestionCard'

export interface SuggestionsPanelProps {
  suggestions: Suggestion[]
  loadingSuggestions: boolean
  onSuggestionSelect: (suggestion: Suggestion) => void
}

/**
 * Suggestions Panel Component
 * Displays AI-generated move suggestions with loading and empty states
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

  // Loading state
  if (loadingSuggestions) {
    return (
      <PanelContainer>
        <div className="flex items-center justify-center h-full min-h-[200px]">
          <div className="flex flex-col items-center gap-4">
            <Spinner size="lg" />
            <div className="text-surface-400 text-sm font-medium">
              Загрузка подсказок...
            </div>
          </div>
        </div>
      </PanelContainer>
    )
  }

  // Empty state
  if (suggestions.length === 0) {
    return (
      <PanelContainer>
        <div className="flex flex-col items-center justify-center h-full text-center px-6 py-12">
          <div className="text-surface-500 text-2xl font-bold tracking-wide uppercase">
            ПУСТО
          </div>
          <div className="text-surface-600 text-sm mt-2">
            AI не может найти подходящие ходы
          </div>
        </div>
      </PanelContainer>
    )
  }

  // Content state
  return (
    <PanelContainer>
      {/* Suggestions List */}
      <div className="flex-1 overflow-y-auto px-4 py-4 min-h-0">
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
    </PanelContainer>
  )
})

SuggestionsPanel.displayName = 'SuggestionsPanel'
