import type { Suggestion } from '../lib/client'
import { memo, useMemo } from 'react'
import { GAME_CONFIG } from '../constants/game'
import { getScoreTier } from '../utils/suggestionHelpers'
import { SuggestionCard } from './SuggestionCard'
import { Spinner } from './ui'

interface SuggestionsPanelProps {
  suggestions: Suggestion[]
  loadingSuggestions: boolean
  onSuggestionSelect: (suggestion: Suggestion) => void
}

/**
 * Suggestions Panel Component
 * Displays AI move suggestions in a multi-column grid
 */
export const SuggestionsPanel = memo((({
  suggestions,
  loadingSuggestions,
  onSuggestionSelect,
}: SuggestionsPanelProps) => {
  // Limit suggestions to max display
  const limitedSuggestions = useMemo(
    () => suggestions.slice(0, GAME_CONFIG.MAX_SUGGESTIONS_DISPLAY),
    [suggestions],
  )

  if (loadingSuggestions) {
    return (
      <div className="flex items-center justify-center h-full">
        <Spinner size="lg" label="Загрузка подсказок..." />
      </div>
    )
  }

  if (suggestions.length === 0) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-center">
          <div className="text-5xl mb-3 opacity-50" aria-hidden="true">🤔</div>
          <p className="text-gray-400 text-sm">Нет доступных подсказок</p>
        </div>
      </div>
    )
  }

  return (
    <div className="h-full py-2 overflow-y-auto">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-1.5 px-[var(--spacing-resp-sm)]">
        {limitedSuggestions.map((suggestion, index) => (
          <SuggestionCard
            key={`${suggestion.word}-${index}`}
            suggestion={suggestion}
            rank={index + 1}
            tier={getScoreTier(suggestion.score)}
            onClick={onSuggestionSelect}
          />
        ))}
      </div>
    </div>
  )
}) as React.FC<SuggestionsPanelProps>)

SuggestionsPanel.displayName = 'SuggestionsPanel'
