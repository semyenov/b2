import type { Suggestion } from '../lib/client'

interface SuggestionsProps {
  suggestions: Suggestion[]
  onSelectSuggestion?: (suggestion: Suggestion) => void
  loading?: boolean
}

export function Suggestions({ suggestions, onSelectSuggestion, loading }: SuggestionsProps) {
  if (loading) {
    return (
      <div className="text-center text-gray-400 py-4">
        <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-yellow-400 mx-auto mb-2"></div>
        <div className="text-sm">Загрузка...</div>
      </div>
    )
  }

  if (suggestions.length === 0) {
    return (
      <div className="text-center text-gray-500 py-4 text-sm">
        Нет подсказок
      </div>
    )
  }

  return (
    <div className="space-y-1 max-h-[60vh] overflow-y-auto">
      {suggestions.map((suggestion, index) => {
        const posStr = `${suggestion.position.row}${String.fromCharCode(1040 + suggestion.position.col)}`

        return (
          <div
            key={index}
            onClick={() => onSelectSuggestion?.(suggestion)}
            className={`
              px-3 py-2 bg-gray-750 rounded transition flex items-center justify-between
              ${onSelectSuggestion ? 'hover:bg-gray-600 cursor-pointer border border-transparent hover:border-yellow-500' : ''}
            `}
          >
            <div className="flex items-center gap-2 flex-1 min-w-0">
              <span className="text-gray-500 text-xs font-mono w-6">
                #{index + 1}
              </span>
              <span className="text-yellow-400 text-xs font-mono">
                {posStr}
              </span>
              <span className="text-green-400 font-bold text-sm">
                +{suggestion.letter}
              </span>
              <span className="text-gray-600">→</span>
              <span className="text-white font-bold uppercase text-sm truncate">
                {suggestion.word}
              </span>
            </div>
            <div className="flex items-center gap-3 ml-2">
              <span className="text-gray-500 text-xs">
                {suggestion.score.toFixed(0)}
              </span>
              {onSelectSuggestion && (
                <span className="text-green-400 text-xs">
                  →
                </span>
              )}
            </div>
          </div>
        )
      })}
    </div>
  )
}