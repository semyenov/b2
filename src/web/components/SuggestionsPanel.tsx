import type { GameState, Suggestion } from '../lib/client'
import { memo, useState, useMemo } from 'react'
import { GAME_CONFIG } from '../constants/game'
import { cn } from '../utils/classNames'

interface SuggestionsPanelProps {
  suggestions: Suggestion[]
  loadingSuggestions: boolean
  onSuggestionSelect: (suggestion: Suggestion) => void
  currentGame: GameState
}

type SortOption = 'score' | 'length' | 'alphabetical'
type FilterOption = 'all' | 'high-score' | 'long-words' | 'rare-letters'

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
  const [sortBy, setSortBy] = useState<SortOption>('score')
  const [filterBy, setFilterBy] = useState<FilterOption>('all')

  // Process suggestions with filtering and sorting
  const processedSuggestions = useMemo(() => {
    let filtered = suggestions

    // Apply filters
    switch (filterBy) {
      case 'high-score':
        filtered = suggestions.filter(s => s.score >= GAME_CONFIG.SCORE_THRESHOLDS.HIGH)
        break
      case 'long-words':
        filtered = suggestions.filter(s => s.word.length >= 4)
        break
      case 'rare-letters':
        const rareLetters = ['Ф', 'Х', 'Ц', 'Ч', 'Ш', 'Щ', 'Ъ', 'Ы', 'Ь', 'Э', 'Ю', 'Я']
        filtered = suggestions.filter(s => rareLetters.includes(s.letter))
        break
      default:
        filtered = suggestions
    }

    // Apply sorting
    const sorted = [...filtered].sort((a, b) => {
      switch (sortBy) {
        case 'score':
          return b.score - a.score
        case 'length':
          return b.word.length - a.word.length
        case 'alphabetical':
          return a.word.localeCompare(b.word, 'ru')
        default:
          return 0
      }
    })

    return sorted
  }, [suggestions, sortBy, filterBy])

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
    <>
      {/* Title Panel with Filters - Outside padding zone */}
      <div className="sticky top-0 z-10 bg-slate-800 border-b-2 border-slate-700 shrink-0">
        <div className="flex items-center justify-between gap-4 py-3 px-4">
          {/* Left: Title */}
          <span className="text-slate-300 font-bold uppercase tracking-wide text-sm shrink-0">
            Подсказки AI
          </span>

          {/* Center: Filter buttons */}
          <div className="flex gap-2 flex-1 justify-center">
            <button
              onClick={() => setFilterBy('all')}
              className={cn(
                'px-2 py-1 text-xs font-semibold rounded transition-colors',
                filterBy === 'all'
                  ? 'bg-yellow-600 text-white'
                  : 'bg-slate-700 text-slate-300 hover:bg-slate-600'
              )}
            >
              Все
            </button>
            <button
              onClick={() => setFilterBy('high-score')}
              className={cn(
                'px-2 py-1 text-xs font-semibold rounded transition-colors',
                filterBy === 'high-score'
                  ? 'bg-green-600 text-white'
                  : 'bg-slate-700 text-slate-300 hover:bg-slate-600'
              )}
            >
              Высокие
            </button>
            <button
              onClick={() => setFilterBy('long-words')}
              className={cn(
                'px-2 py-1 text-xs font-semibold rounded transition-colors',
                filterBy === 'long-words'
                  ? 'bg-blue-600 text-white'
                  : 'bg-slate-700 text-slate-300 hover:bg-slate-600'
              )}
            >
              Длинные
            </button>
            <button
              onClick={() => setFilterBy('rare-letters')}
              className={cn(
                'px-2 py-1 text-xs font-semibold rounded transition-colors',
                filterBy === 'rare-letters'
                  ? 'bg-purple-600 text-white'
                  : 'bg-slate-700 text-slate-300 hover:bg-slate-600'
              )}
            >
              Редкие
            </button>
          </div>

          {/* Right: Sort and Count */}
          <div className="flex items-center gap-3 shrink-0">
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as SortOption)}
              className="bg-slate-700 text-slate-300 text-xs font-semibold rounded px-2 py-1 border border-slate-600 focus:border-yellow-500 focus:outline-none"
            >
              <option value="score">По очкам</option>
              <option value="length">По длине</option>
              <option value="alphabetical">По алфавиту</option>
            </select>
            <span className="text-yellow-500 text-sm font-black">
              {processedSuggestions.length} из {suggestions.length}
            </span>
          </div>
        </div>
      </div>

      {/* Suggestions Grid - Inside padding zone */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 p-4">
        {processedSuggestions.slice(0, GAME_CONFIG.MAX_SUGGESTIONS_DISPLAY).map((suggestion, index) => {
          const posStr = `${suggestion.position.row}${String.fromCharCode(1040 + suggestion.position.col)}`
          const scoreColor = suggestion.score >= GAME_CONFIG.SCORE_THRESHOLDS.HIGH
            ? 'text-green-400'
            : suggestion.score >= GAME_CONFIG.SCORE_THRESHOLDS.MEDIUM
              ? 'text-yellow-400'
              : 'text-slate-400'

          // Enhanced visual indicators
          const isHighScore = suggestion.score >= GAME_CONFIG.SCORE_THRESHOLDS.HIGH
          const isLongWord = suggestion.word.length >= 4
          const isRareLetter = ['Ф', 'Х', 'Ц', 'Ч', 'Ш', 'Щ', 'Ъ', 'Ы', 'Ь', 'Э', 'Ю', 'Я'].includes(suggestion.letter)

          return (
            <button
              key={`${suggestion.word}-${suggestion.position.row}-${suggestion.position.col}-${suggestion.letter}`}
              type="button"
              onClick={() => onSuggestionSelect(suggestion)}
              aria-label={`Подсказка ${index + 1}: ${suggestion.word}, буква ${suggestion.letter} на позиции ${posStr}, ${suggestion.score.toFixed(1)} очков`}
              className={cn(
                'group border-2 transition-all duration-150 px-3 py-2 flex items-center gap-2',
                isHighScore
                  ? 'bg-green-900/30 border-green-600 hover:bg-green-800/40 hover:border-green-500'
                  : 'bg-slate-700 hover:bg-slate-600 border-slate-600 hover:border-yellow-500'
              )}
            >
              {/* Enhanced Rank Badge */}
              <div className={cn(
                'font-bold text-xs px-1.5 py-0.5 shrink-0 leading-none rounded',
                isHighScore
                  ? 'bg-green-800 text-green-200'
                  : 'bg-slate-800 text-slate-500'
              )} aria-hidden="true">
                {index + 1}
              </div>

              {/* Word with indicators */}
              <div className="flex-1 text-left">
                <div className="text-white font-black uppercase text-sm tracking-wide truncate">
                  {suggestion.word}
                </div>
                <div className="flex items-center gap-1 mt-0.5">
                  {isLongWord && (
                    <span className="text-blue-400 text-xs font-semibold">Длин.</span>
                  )}
                  {isRareLetter && (
                    <span className="text-purple-400 text-xs font-semibold">Редк.</span>
                  )}
                  <span className="text-slate-500 text-xs">
                    {suggestion.word.length}б
                  </span>
                </div>
              </div>

              {/* Position + Letter */}
              <div className="flex items-center gap-1.5 shrink-0">
                <span className="text-cyan-400 font-mono font-bold text-xs bg-slate-800 bg-opacity-50 px-1.5 py-0.5 leading-none rounded">
                  {posStr}
                </span>
                <span className={cn(
                  'font-black text-lg leading-none',
                  isRareLetter ? 'text-purple-400' : 'text-green-400'
                )}>
                  {suggestion.letter}
                </span>
              </div>

              {/* Enhanced Score */}
              <div className={cn(
                'font-black text-base shrink-0 min-w-[32px] text-right',
                scoreColor
              )}>
                {suggestion.score.toFixed(1)}
              </div>
            </button>
          )
        })}
      </div>
    </>
  )
})

SuggestionsPanel.displayName = 'SuggestionsPanel'
