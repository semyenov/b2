import type { Suggestion } from '../lib/client'

interface SuggestionsGridProps {
  suggestions: Suggestion[]
  onSelectSuggestion?: (suggestion: Suggestion) => void
  loading?: boolean
}

export function SuggestionsGrid({ suggestions, onSelectSuggestion, loading }: SuggestionsGridProps) {
  if (loading) {
    return (
      <div className="h-full flex items-center justify-center bg-gray-850 rounded-lg border-2 border-gray-700">
        <div className="text-center text-gray-400">
          <div className="animate-spin rounded-full h-12 w-12 border-b-4 border-yellow-400 mx-auto mb-3"></div>
          <div className="text-base font-semibold">Загрузка подсказок...</div>
        </div>
      </div>
    )
  }

  if (suggestions.length === 0) {
    return (
      <div className="h-full flex items-center justify-center bg-gray-850 rounded-lg border-2 border-gray-700">
        <div className="text-center text-gray-500">
          <div className="text-5xl mb-3">💡</div>
          <div className="text-base">Нажмите "AI" для получения подсказок</div>
        </div>
      </div>
    )
  }

  return (
    <div className="h-full bg-gray-850 rounded-lg border-2 border-gray-700 p-4 overflow-hidden flex flex-col">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-sm font-bold text-cyan-400 flex items-center gap-2">
          <span className="text-xl">💡</span>
          <span>AI ПОДСКАЗКИ</span>
        </h3>
        <span className="text-xs text-gray-500 bg-gray-700 px-2 py-1 rounded-full">
          {suggestions.length}
          {' '}
          слов
        </span>
      </div>

      <div className="flex-1 overflow-y-auto">
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-2">
          {suggestions.map((suggestion, index) => {
            const posStr = `${suggestion.position.row}${String.fromCharCode(1040 + suggestion.position.col)}`

            return (
              <button
                key={index}
                onClick={() => onSelectSuggestion?.(suggestion)}
                className="group relative bg-gray-800 hover:bg-gray-700 border-2 border-gray-600 hover:border-yellow-500 rounded-lg p-3 transition-all hover:shadow-lg hover:scale-105 cursor-pointer"
              >
                {/* Rank badge */}
                <div className="absolute top-1 left-1 w-6 h-6 bg-gray-900 text-gray-500 text-xs rounded-full flex items-center justify-center font-bold border border-gray-600">
                  {index + 1}
                </div>

                {/* Score badge */}
                <div className="absolute top-1 right-1 bg-yellow-900 bg-opacity-50 text-yellow-400 text-xs px-1.5 py-0.5 rounded font-bold border border-yellow-700">
                  {suggestion.score.toFixed(0)}
                </div>

                {/* Content */}
                <div className="mt-6 space-y-1.5">
                  {/* Position and letter */}
                  <div className="flex items-center justify-center gap-1 text-xs">
                    <span className="text-yellow-400 font-mono font-bold">{posStr}</span>
                    <span className="text-gray-600">+</span>
                    <span className="text-green-400 font-bold text-sm">{suggestion.letter}</span>
                  </div>

                  {/* Word */}
                  <div className="text-center">
                    <div className="text-base font-bold uppercase text-white group-hover:text-cyan-400 transition-colors truncate">
                      {suggestion.word}
                    </div>
                  </div>
                </div>

                {/* Hover effect */}
                <div className="absolute inset-0 rounded-lg bg-gradient-to-br from-yellow-500/0 to-yellow-500/0 group-hover:from-yellow-500/10 group-hover:to-orange-500/10 transition-all pointer-events-none" />
              </button>
            )
          })}
        </div>
      </div>
    </div>
  )
}
