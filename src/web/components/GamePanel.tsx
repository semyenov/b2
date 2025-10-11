import type { GameState, MoveBody, Suggestion } from '../lib/client'
import { useState } from 'react'
import { Board } from './Board'
import { buildMoveBody, canSubmitMove, formWordFromPath } from '../utils/moveValidation'

interface GamePanelProps {
  game: GameState
  playerName: string
  onMove: (move: MoveBody) => void
  onGetSuggestions: () => void
  disabled?: boolean
  selectedCell?: { row: number, col: number }
  selectedLetter?: string
  wordPath?: Array<{ row: number, col: number }>
  onCellClick?: (row: number, col: number) => void
  onLetterSelect?: (letter: string) => void
  onClearSelection?: () => void
  suggestions?: Suggestion[]
  loadingSuggestions?: boolean
  onSelectSuggestion?: (suggestion: Suggestion) => void
}

const RUSSIAN_ALPHABET = 'АБВГДЕЁЖЗИЙКЛМНОПРСТУФХЦЧШЩЪЫЬЭЮЯ'.split('')

export function GamePanel({
  game,
  playerName,
  onMove,
  onGetSuggestions,
  disabled,
  selectedCell,
  selectedLetter,
  wordPath = [],
  onCellClick,
  onLetterSelect,
  onClearSelection,
  suggestions = [],
  loadingSuggestions = false,
  onSelectSuggestion,
}: GamePanelProps) {
  const [hoveredLetter, setHoveredLetter] = useState<string>('')
  const [showSuggestions, setShowSuggestions] = useState(false)

  const wordFormed = formWordFromPath(wordPath, game.board, selectedCell, selectedLetter)
  const canSubmit = canSubmitMove(selectedCell, selectedLetter, wordPath)

  // Determine current step
  const currentStep = !selectedCell ? 1 : !selectedLetter ? 2 : wordPath.length < 2 ? 3 : 4

  const handleSubmit = () => {
    if (!canSubmit || !selectedCell || !selectedLetter) {
      return
    }

    const moveBody = buildMoveBody(playerName, selectedCell, selectedLetter, wordFormed)
    onMove(moveBody)
    onClearSelection?.()
  }

  return (
    <div className="space-y-6">
      {/* Board Section - Centered */}
      <div className="flex justify-center">
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
      <div className="bg-gray-800 border-2 border-gray-700 rounded-lg shadow-depth-3 overflow-hidden">
        {/* Progress & Word Display */}
        <div className="p-5 bg-gray-700 border-b-2 border-gray-600">
          {/* Status Message - Enhanced Prominence */}
          <div className="text-center mb-4">
            {disabled
              ? (
                  <div className="text-orange-300 font-bold text-xl py-2 px-4 bg-orange-900 bg-opacity-30 rounded-lg border-2 border-orange-600 inline-block">⏳ Ждите хода...</div>
                )
              : (
                  <>
                    {currentStep === 1 && <div className="text-cyan-200 text-xl font-semibold py-2 px-4 bg-gray-800 bg-opacity-60 rounded-lg border-2 border-cyan-600 border-opacity-40 inline-block">👆 <span className="font-black">Шаг 1:</span> Выберите пустую клетку</div>}
                    {currentStep === 2 && <div className="text-blue-200 text-xl font-semibold py-2 px-4 bg-gray-800 bg-opacity-60 rounded-lg border-2 border-blue-500 border-opacity-40 inline-block">🔤 <span className="font-black">Шаг 2:</span> Выберите букву</div>}
                    {currentStep === 3 && <div className="text-purple-200 text-xl font-semibold py-2 px-4 bg-gray-800 bg-opacity-60 rounded-lg border-2 border-purple-500 border-opacity-40 inline-block">✍️ <span className="font-black">Шаг 3:</span> Составьте слово из букв</div>}
                    {currentStep === 4 && <div className="text-green-200 font-black text-2xl py-2 px-4 bg-green-900 bg-opacity-40 rounded-lg border-2 border-green-500 inline-block shadow-depth-2">✓ Готово к отправке!</div>}
                  </>
                )}
          </div>

          {/* Word Display - Balanced and Prominent */}
          {wordFormed && (
            <div className="bg-gray-900 rounded-lg border-2 border-gray-600 p-4 shadow-depth-2">
              <div className="text-xs text-gray-500 mb-2 text-center uppercase tracking-wider">Сформированное слово:</div>
              <div className="text-3xl font-bold font-mono tracking-widest text-center text-cyan-400">
                {wordFormed}
              </div>
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
                className={`aspect-square rounded-lg font-black text-xl transition-all duration-200 ${selectedLetter === letter
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

        {/* Action Buttons - Unified Styling */}
        <div className="p-4 bg-gray-750 border-t-2 border-gray-700">
          <div className="flex gap-3 max-w-2xl mx-auto">
            <button
              onClick={handleSubmit}
              disabled={!canSubmit || disabled}
              className={`flex-1 py-4 px-6 rounded-lg font-bold text-lg transition-all duration-200 ${canSubmit && !disabled
                ? 'bg-green-600 hover:bg-green-700 text-white shadow-depth-2 hover:shadow-depth-3 hover:scale-105 glow-success'
                : 'bg-gray-700 text-gray-500 cursor-not-allowed shadow-depth-1'
              }`}
            >
              ✓ Подтвердить ход
            </button>

            <button
              onClick={onClearSelection}
              disabled={disabled || (!selectedCell && !selectedLetter && wordPath.length === 0)}
              className="px-6 py-4 bg-gray-600 hover:bg-gray-500 text-white rounded-lg font-bold text-lg transition-all duration-200 hover:shadow-depth-2 hover:scale-105 disabled:opacity-40 disabled:cursor-not-allowed"
            >
              ✕ Отмена
            </button>

            <button
              onClick={() => {
                onGetSuggestions()
                setShowSuggestions(true)
              }}
              disabled={disabled}
              className="px-6 py-4 bg-yellow-600 hover:bg-yellow-700 text-white rounded-lg font-bold text-lg transition-all duration-200 hover:shadow-depth-2 hover:scale-105 flex items-center justify-center gap-2 disabled:opacity-40 disabled:cursor-not-allowed relative"
            >
              💡 AI
              {suggestions.length > 0 && (
                <span className="absolute -top-1 -right-1 bg-red-600 text-white text-xs px-2 py-0.5 rounded-full font-bold shadow-depth-2">
                  {suggestions.length}
                </span>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* AI Suggestions Modal - Unified Styling */}
      {showSuggestions && (
        <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4 backdrop-blur-sm" onClick={() => setShowSuggestions(false)}>
          <div className="bg-gray-800 rounded-lg shadow-depth-4 max-w-2xl w-full max-h-[80vh] overflow-hidden border-2 border-yellow-500" onClick={(e) => e.stopPropagation()}>
            {/* Modal Header */}
            <div className="bg-yellow-900 bg-opacity-40 border-b-2 border-yellow-600 px-6 py-4 flex justify-between items-center">
              <h3 className="text-2xl font-bold text-yellow-300 flex items-center gap-2">
                💡 AI Подсказки
                {suggestions.length > 0 && (
                  <span className="text-lg text-yellow-400">({suggestions.length})</span>
                )}
              </h3>
              <button
                onClick={() => setShowSuggestions(false)}
                className="text-gray-400 hover:text-white text-2xl font-bold hover:bg-gray-700 w-10 h-10 rounded-lg transition-all duration-200 hover:scale-105"
              >
                ✕
              </button>
            </div>

            {/* Modal Content */}
            <div className="p-4 overflow-y-auto max-h-[calc(80vh-100px)]">
              {loadingSuggestions
                ? (
                    <div className="flex flex-col items-center justify-center py-12">
                      <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-yellow-400 mb-4"></div>
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
                                rounded-lg p-4 transition-all duration-200
                                hover:shadow-depth-3 hover:scale-105 cursor-pointer text-left
                                ${index === 0 ? 'shadow-depth-2 ring-2 ring-yellow-500 ring-opacity-50' : 'shadow-depth-1'}
                              `}
                            >
                              <div className="flex items-center justify-between">
                                {/* Left: Rank + Move Info */}
                                <div className="flex items-center gap-3">
                                  <div className={`
                                    w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold
                                    ${index === 0 ? 'bg-yellow-600 text-white' : index === 1 ? 'bg-gray-600 text-gray-200' : index === 2 ? 'bg-amber-700 text-amber-100' : 'bg-gray-700 text-gray-400'}
                                  `}>
                                    #{index + 1}
                                  </div>
                                  <div>
                                    <div className="flex items-baseline gap-2 mb-1">
                                      <span className="text-yellow-400 font-mono font-bold text-lg">{posStr}</span>
                                      <span className="text-green-400 font-bold text-xl">+{suggestion.letter}</span>
                                    </div>
                                    <div className="bg-gray-900 rounded px-3 py-1 inline-block">
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
