import type { Suggestion } from '../lib/client'

interface SuggestionsProps {
  suggestions: Suggestion[]
  onSelectSuggestion?: (suggestion: Suggestion) => void
  loading?: boolean
}

export function Suggestions({ suggestions, onSelectSuggestion, loading }: SuggestionsProps) {
  if (loading) {
    return (
      <div className="bg-gray-800 rounded-lg p-4">
        <h3 className="text-xl font-bold mb-4 text-yellow-400">AI Suggestions</h3>
        <div className="text-center text-gray-400 py-4">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-yellow-400 mx-auto mb-2"></div>
          Loading suggestions...
        </div>
      </div>
    )
  }

  if (suggestions.length === 0) {
    return (
      <div className="bg-gray-800 rounded-lg p-4">
        <h3 className="text-xl font-bold mb-4 text-yellow-400">AI Suggestions</h3>
        <div className="text-center text-gray-400 py-4">
          No suggestions available
        </div>
      </div>
    )
  }

  return (
    <div className="bg-gray-800 rounded-lg p-4">
      <h3 className="text-xl font-bold mb-4 text-yellow-400">
        AI Suggestions ({suggestions.length})
      </h3>
      <div className="space-y-2 max-h-96 overflow-y-auto">
        {suggestions.map((suggestion, index) => {
          const posStr = `${suggestion.position.row}${String.fromCharCode(1040 + suggestion.position.col)}`

          return (
            <div
              key={index}
              onClick={() => onSelectSuggestion?.(suggestion)}
              className={`
                p-3 bg-gray-700 rounded transition
                ${onSelectSuggestion ? 'hover:bg-gray-600 cursor-pointer' : ''}
              `}
            >
              <div className="flex justify-between items-start">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-cyan-400 font-mono text-sm">
                      #{index + 1}
                    </span>
                    <span className="text-yellow-400 font-bold">
                      {posStr}
                    </span>
                    <span className="text-green-400 font-bold text-lg">
                      +{suggestion.letter}
                    </span>
                    <span className="text-gray-400">→</span>
                    <span className="text-white font-bold uppercase">
                      {suggestion.word}
                    </span>
                  </div>
                  <div className="text-xs text-gray-400">
                    Score: {suggestion.score.toFixed(1)} | Length: {suggestion.word.length}
                  </div>
                </div>
                {onSelectSuggestion && (
                  <button className="text-green-400 hover:text-green-300 text-sm">
                    Use →
                  </button>
                )}
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}