import type { GameState, Suggestion } from '../lib/client'
import { useEffect, useRef, useState } from 'react'
import { formWordFromPath } from '../utils/moveValidation'
import { Board } from './Board'

interface GamePanelProps {
  game: GameState
  playerName: string
  disabled?: boolean
  selectedCell?: { row: number, col: number }
  selectedLetter?: string
  wordPath?: Array<{ row: number, col: number }>
  onCellClick?: (row: number, col: number) => void
  onLetterSelect?: (letter: string) => void
  suggestions?: Suggestion[]
  loadingSuggestions?: boolean
  onSelectSuggestion?: (suggestion: Suggestion) => void
}

const RUSSIAN_ALPHABET = 'АБВГДЕЁЖЗИЙКЛМНОПРСТУФХЦЧШЩЪЫЬЭЮЯ'.split('')

export function GamePanel({
  game,
  playerName: _playerName,
  disabled,
  selectedCell,
  selectedLetter,
  wordPath = [],
  onCellClick,
  onLetterSelect,
  suggestions = [],
  loadingSuggestions = false,
  onSelectSuggestion,
}: GamePanelProps) {
  const [hoveredLetter, setHoveredLetter] = useState<string>('')
  const [showSuggestions, setShowSuggestions] = useState(false)
  const prevSuggestionsLengthRef = useRef(0)

  const wordFormed = formWordFromPath(wordPath, game.board, selectedCell, selectedLetter)

  // Determine current step
  const currentStep = !selectedCell ? 1 : !selectedLetter ? 2 : wordPath.length < 2 ? 3 : 4

  // Auto-show suggestions modal when new suggestions arrive
  useEffect(() => {
    if (
      suggestions.length > 0
      && suggestions.length !== prevSuggestionsLengthRef.current
      && !loadingSuggestions
    ) {
      setShowSuggestions(true)
    }
    prevSuggestionsLengthRef.current = suggestions.length
  }, [suggestions.length, loadingSuggestions])

  return (
    <div className="flex flex-col h-full">
      {/* Board Section - Centered */}
      <div className="flex justify-center mb-6">
        <Board
          game={game}
          selectedCell={selectedCell}
          selectedLetter={selectedLetter}
          wordPath={wordPath}
          onCellClick={onCellClick}
          disabled={disabled}
        />
      </div>

      {/* Controls Section - Full width */}
      <div className="bg-gray-800 border-2 border-gray-700 shadow-depth-3 flex-shrink-0">
        {/* Unified Status & Word Display - Fixed Height */}
        <div className="border-b-2 border-gray-600 min-h-[60px] flex items-center justify-center">
          {wordFormed
            ? (
              /* Word Display - Hero Element */
                <div className="flex flex-col items-center justify-center gap-2 w-full py-3 bg-gray-700">
                  <div className="text-5xl font-black font-mono tracking-widest text-center text-cyan-400">
                    {wordFormed}
                  </div>
                  <div className="text-center text-sm">
                    {disabled
                      ? (
                          <div className="text-orange-300 font-semibold">⏳ Ждите хода</div>
                        )
                      : currentStep === 4
                        ? (
                            <div className="text-green-300 font-bold">✓ Готово к отправке!</div>
                          )
                        : (
                            <div className="text-purple-200 font-semibold">✍️ Составьте слово</div>
                          )}
                  </div>
                </div>
              )
            : (
              /* Status Message - No Margins */
                <div className="w-full h-full flex items-center justify-center">
                  {disabled
                    ? (
                        <div className="text-orange-300 font-bold text-2xl w-full text-center py-5 bg-orange-900 bg-opacity-40">⏳ Ждите хода...</div>
                      )
                    : (
                        <>
                          {currentStep === 1 && (
                            <div className="text-cyan-200 text-2xl font-semibold w-full text-center py-5 bg-cyan-900 bg-opacity-20">
                              👆
                              {' '}
                              <span className="font-black">Шаг 1:</span>
                              {' '}
                              Выберите пустую клетку
                            </div>
                          )}
                          {currentStep === 2 && (
                            <div className="text-blue-200 text-2xl font-semibold w-full text-center py-5 bg-blue-900 bg-opacity-20">
                              🔤
                              {' '}
                              <span className="font-black">Шаг 2:</span>
                              {' '}
                              Выберите букву
                            </div>
                          )}
                          {currentStep === 3 && (
                            <div className="text-purple-200 text-2xl font-semibold w-full text-center py-5 bg-purple-900 bg-opacity-20">
                              ✍️
                              {' '}
                              <span className="font-black">Шаг 3:</span>
                              {' '}
                              Составьте слово из букв
                            </div>
                          )}
                        </>
                      )}
                </div>
              )}
        </div>

        {/* Alphabet Grid - Enhanced Visibility */}
        <div className="p-5">
          <div className="grid grid-cols-11 gap-2 max-w-4xl mx-auto">
            {RUSSIAN_ALPHABET.map(letter => (
              <button
                key={letter}
                onClick={() => onLetterSelect?.(letter)}
                onMouseEnter={() => setHoveredLetter(letter)}
                onMouseLeave={() => setHoveredLetter('')}
                disabled={disabled || !selectedCell || !!selectedLetter}
                className={`aspect-square font-black text-2xl transition-all duration-200 ${selectedLetter === letter
                  ? 'bg-blue-600 text-white shadow-depth-3 ring-2 ring-blue-400 transform scale-105'
                  : hoveredLetter === letter && !disabled && selectedCell && !selectedLetter
                    ? 'bg-yellow-500 text-gray-900 transform scale-105 shadow-depth-3'
                    : 'bg-gray-650 text-gray-100 border-2 border-gray-600 hover:bg-gray-600 hover:border-gray-500'
                } ${(disabled || !selectedCell || !!selectedLetter) && selectedLetter !== letter
                  ? 'opacity-30 cursor-not-allowed'
                  : 'cursor-pointer hover:shadow-depth-2 hover:scale-105'
                }`}
              >
                {letter}
              </button>
            ))}
          </div>
        </div>

      </div>

      {/* AI Suggestions Modal - Unified Styling */}
      {showSuggestions && (
        <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4 backdrop-blur-sm" onClick={() => setShowSuggestions(false)}>
          <div className="bg-gray-800 shadow-depth-4 max-w-2xl w-full max-h-[80vh] overflow-hidden border-2 border-yellow-500" onClick={e => e.stopPropagation()}>
            {/* Modal Header */}
            <div className="bg-yellow-900 bg-opacity-40 border-b-2 border-yellow-600 px-6 py-4 flex justify-between items-center">
              <h3 className="text-2xl font-bold text-yellow-300 flex items-center gap-2">
                💡 AI Подсказки
                {suggestions.length > 0 && (
                  <span className="text-lg text-yellow-400">
                    (
                    {suggestions.length}
                    )
                  </span>
                )}
              </h3>
              <button
                onClick={() => setShowSuggestions(false)}
                className="text-gray-400 hover:text-white text-2xl font-bold hover:bg-gray-700 w-10 h-10 transition-all duration-200 hover:scale-105"
              >
                ✕
              </button>
            </div>

            {/* Modal Content */}
            <div className="p-4 overflow-y-auto max-h-[calc(80vh-100px)]">
              {loadingSuggestions
                ? (
                    <div className="flex flex-col items-center justify-center py-12">
                      <div className="animate-spin h-16 w-16 border-b-4 border-yellow-400 mb-4"></div>
                      <div className="text-gray-400 font-semibold text-lg">Загрузка подсказок...</div>
                    </div>
                  )
                : suggestions.length === 0
                  ? (
                      <div className="flex flex-col items-center justify-center py-12">
                        <div className="text-6xl mb-4">🤷</div>
                        <div className="text-gray-400 text-lg">Нет доступных подсказок</div>
                      </div>
                    )
                  : (
                      <div className="space-y-2">
                        {suggestions.map((suggestion, index) => {
                          const posStr = `${suggestion.position.row}${String.fromCharCode(1040 + suggestion.position.col)}`
                          const scoreColor = suggestion.score >= 10 ? 'text-green-400' : suggestion.score >= 5 ? 'text-yellow-400' : 'text-gray-400'

                          return (
                            <button
                              key={index}
                              onClick={() => {
                                onSelectSuggestion?.(suggestion)
                                setShowSuggestions(false)
                              }}
                              className={`
                                w-full group relative bg-gradient-to-br from-gray-750 to-gray-800 hover:from-gray-700 hover:to-gray-750
                                border-2 ${index === 0 ? 'border-yellow-500' : 'border-gray-600'} hover:border-yellow-400
                                p-4 transition-all duration-200
                                hover:shadow-depth-3 hover:scale-105 cursor-pointer text-left
                                ${index === 0 ? 'shadow-depth-2 ring-2 ring-yellow-500 ring-opacity-50' : 'shadow-depth-1'}
                              `}
                            >
                              <div className="flex items-center justify-between">
                                {/* Left: Rank + Move Info */}
                                <div className="flex items-center gap-3">
                                  <div className={`
                                    w-10 h-10 flex items-center justify-center text-sm font-bold border-2
                                    ${index === 0 ? 'bg-yellow-600 text-white border-yellow-500' : index === 1 ? 'bg-gray-600 text-gray-200 border-gray-500' : index === 2 ? 'bg-amber-700 text-amber-100 border-amber-600' : 'bg-gray-700 text-gray-400 border-gray-600'}
                                  `}
                                  >
                                    #
                                    {index + 1}
                                  </div>
                                  <div>
                                    <div className="flex items-baseline gap-2 mb-1">
                                      <span className="text-yellow-400 font-mono font-bold text-lg">{posStr}</span>
                                      <span className="text-green-400 font-bold text-xl">
                                        +
                                        {suggestion.letter}
                                      </span>
                                    </div>
                                    <div className="bg-gray-900 px-3 py-1 inline-block border border-gray-700">
                                      <span className="text-white font-bold uppercase tracking-wide text-base">
                                        {suggestion.word}
                                      </span>
                                    </div>
                                  </div>
                                </div>

                                {/* Right: Score */}
                                <div className="text-right">
                                  <div className="text-xs text-gray-500 mb-1">Очки</div>
                                  <div className={`${scoreColor} font-bold text-2xl`}>
                                    {suggestion.score.toFixed(0)}
                                  </div>
                                </div>
                              </div>

                              {/* Hover Arrow */}
                              <div className="absolute right-4 top-1/2 -translate-y-1/2 text-yellow-400 text-xl opacity-0 group-hover:opacity-100 transition-opacity">
                                →
                              </div>
                            </button>
                          )
                        })}
                      </div>
                    )}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
