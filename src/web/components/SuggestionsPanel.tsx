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
  currentGame: _currentGame,
}: SuggestionsPanelProps) => {
  if (loadingSuggestions) {
    return (
      <div className="flex items-center justify-center py-6">
        <div className="animate-spin h-8 w-8 border-b-2 border-yellow-500 mr-3"></div>
        <div className="text-slate-400 font-semibold text-base">Загрузка подсказок...</div>
      </div>
    )
  }

  if (suggestions.length === 0) {
    return (
      <div className="text-center py-6 text-slate-500 text-base">
        Нет доступных подсказок
      </div>
    )
  }

  return (
    <div className="flex flex-col pt-3">
      <div className="sticky top-0 z-10 bg-slate-800 border-b-2 border-slate-700 text-sm text-slate-300 mb-3 font-bold uppercase tracking-wide flex items-center justify-between shrink-0 py-2 px-3 -mt-3">
        <span className="flex items-center gap-2">
          Подсказки AI
        </span>
        <span className="text-yellow-500 text-base font-black">
          {suggestions.length}
          {' '}
          доступно
        </span>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-2 px-3 pb-3">
        {suggestions.slice(0, GAME_CONFIG.MAX_SUGGESTIONS_DISPLAY).map((suggestion, index) => {
          const posStr = `${suggestion.position.row}${String.fromCharCode(1040 + suggestion.position.col)}`
          const scoreColor = suggestion.score >= GAME_CONFIG.SCORE_THRESHOLDS.HIGH
            ? 'text-green-400'
            : suggestion.score >= GAME_CONFIG.SCORE_THRESHOLDS.MEDIUM
              ? 'text-yellow-400'
              : 'text-slate-400'

          return (
            <button
              key={`${suggestion.word}-${index}`}
              type="button"
              onClick={() => onSuggestionSelect(suggestion)}
              aria-label={`Подсказка ${index + 1}: ${suggestion.word}, буква ${suggestion.letter} на позиции ${posStr}, ${suggestion.score} очков`}
              className="group bg-slate-700 hover:bg-slate-600 border-2 border-slate-600 hover:border-yellow-500 transition-colors duration-150 px-3 py-2 flex items-center gap-2"
            >
              {/* Rank Badge */}
              <div className="bg-slate-800 text-slate-500 font-bold text-xs px-1.5 py-0.5 shrink-0 leading-none" aria-hidden="true">
                {index + 1}
              </div>

              {/* Word - Hero Element */}
              <div className="flex-1 text-white font-black uppercase text-sm tracking-wide text-left truncate">
                {suggestion.word}
              </div>

              {/* Position + Letter */}
              <div className="flex items-center gap-1.5 shrink-0">
                <span className="text-cyan-400 font-mono font-bold text-xs bg-slate-800 bg-opacity-50 px-1.5 py-0.5 leading-none">
                  {posStr}
                </span>
                <span className="text-green-400 font-black text-lg leading-none">
                  {suggestion.letter}
                </span>
              </div>

              {/* Score */}
              <div className={cn(scoreColor, 'font-black text-base shrink-0 min-w-[28px] text-right')}>
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
