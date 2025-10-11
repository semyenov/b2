import type { GameState, MoveBody, Suggestion } from '../lib/client'
import { useState } from 'react'
import { buildMoveBody, canSubmitMove, formWordFromPath } from '../utils/moveValidation'
import { Board } from './Board'

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
  const [activeTab, setActiveTab] = useState<'alphabet' | 'suggestions'>('alphabet')

  const wordFormed = formWordFromPath(wordPath, game.board, selectedCell, selectedLetter)
  const canSubmit = canSubmitMove(selectedCell, selectedLetter, wordPath)

  const handleSubmit = () => {
    if (!canSubmit || !selectedCell || !selectedLetter) {
      return
    }

    const moveBody = buildMoveBody(playerName, selectedCell, selectedLetter, wordFormed)
    onMove(moveBody)
    onClearSelection?.()
  }

  return (
    <div className="flex-1 flex gap-3 bg-gray-800 rounded-lg border-2 border-gray-600 shadow-depth-3 p-3">
      {/* Left: Board Section */}
      <div className="flex-1 flex items-center justify-center">
        <Board
          game={game}
          selectedCell={selectedCell}
          selectedLetter={selectedLetter}
          wordPath={wordPath}
          onCellClick={onCellClick}
          disabled={disabled}
        />
      </div>

      {/* Right: Controls Section */}
      <div className="w-80 flex flex-col bg-gray-800 border-2 border-gray-600 rounded-lg overflow-hidden shadow-depth-3">
        {/* Status */}
        <div className="p-3 bg-gray-750 border-b border-gray-600">
          <div className="text-xs text-gray-400 mb-2">
            {disabled
              ? (
                  <span className="text-orange-400">⏳ Ждите хода...</span>
                )
              : (
                  <>
                    {!selectedCell && <span>👆 Выберите клетку</span>}
                    {selectedCell && !selectedLetter && <span>🔤 Выберите букву</span>}
                    {selectedCell && selectedLetter && wordPath.length < 2 && <span>✍️ Составьте слово</span>}
                    {canSubmit && <span className="text-green-400 font-semibold">✓ Готово!</span>}
                  </>
                )}
          </div>

          {/* Word display */}
          {wordFormed && (
            <div className="px-3 py-2 bg-gray-900 rounded border border-gray-600">
              <div className="text-xs text-gray-500 mb-1">Слово:</div>
              <div className="text-2xl font-bold font-mono tracking-wider text-cyan-400">
                {wordFormed}
              </div>
            </div>
          )}
        </div>

        {/* Tab selector */}
        <div className="flex border-b border-gray-600 bg-gray-750">
          <button
            onClick={() => setActiveTab('alphabet')}
            className={`flex-1 py-2 text-xs font-bold transition-all ${
              activeTab === 'alphabet'
                ? 'bg-gray-800 text-cyan-400 border-b-2 border-cyan-400'
                : 'text-gray-500 hover:text-gray-300'
            }`}
          >
            🔤 АЛФАВИТ
          </button>
          <button
            onClick={() => setActiveTab('suggestions')}
            className={`flex-1 py-2 text-xs font-bold transition-all relative ${
              activeTab === 'suggestions'
                ? 'bg-gray-800 text-yellow-400 border-b-2 border-yellow-400'
                : 'text-gray-500 hover:text-gray-300'
            }`}
          >
            💡 AI
            {suggestions.length > 0 && (
              <span className="absolute top-1 right-1 bg-yellow-600 text-white text-[9px] px-1 py-0.5 rounded-full">
                {suggestions.length}
              </span>
            )}
          </button>
        </div>

        {/* Content area */}
        <div className="flex-1 overflow-hidden">
          {activeTab === 'alphabet'
            ? (
              /* Alphabet grid */
                <div className="h-full p-3 overflow-y-auto">
                  <div className="grid grid-cols-7 gap-1.5">
                    {RUSSIAN_ALPHABET.map(letter => (
                      <button
                        key={letter}
                        onClick={() => onLetterSelect?.(letter)}
                        onMouseEnter={() => setHoveredLetter(letter)}
                        onMouseLeave={() => setHoveredLetter('')}
                        disabled={disabled || !selectedCell || !!selectedLetter}
                        className={`aspect-square rounded-lg font-bold text-lg transition-all ${selectedLetter === letter
                          ? 'bg-blue-600 text-white shadow-lg ring-2 ring-blue-400 transform scale-105'
                          : hoveredLetter === letter && !disabled && selectedCell && !selectedLetter
                            ? 'bg-yellow-500 text-gray-900 transform scale-105 shadow-md'
                            : 'bg-gray-700 text-gray-200 border border-gray-600 hover:bg-gray-600'
                        } ${(disabled || !selectedCell || !!selectedLetter) && selectedLetter !== letter
                          ? 'opacity-30 cursor-not-allowed'
                          : 'cursor-pointer hover:shadow-md'
                        }`}
                      >
                        {letter}
                      </button>
                    ))}
                  </div>
                </div>
              )
            : (
              /* Suggestions display */
                <div className="h-full">
                  {loadingSuggestions
                    ? (
                        <div className="h-full flex items-center justify-center">
                          <div className="text-center text-gray-400">
                            <div className="animate-spin rounded-full h-10 w-10 border-b-4 border-yellow-400 mx-auto mb-2"></div>
                            <div className="text-sm font-semibold">Загрузка...</div>
                          </div>
                        </div>
                      )
                    : suggestions.length === 0
                      ? (
                          <div className="h-full flex items-center justify-center">
                            <div className="text-center text-gray-500 px-4">
                              <div className="text-4xl mb-2">💡</div>
                              <div className="text-xs">Нет подсказок</div>
                            </div>
                          </div>
                        )
                      : (
                          <div className="h-full overflow-y-auto p-2 space-y-1.5">
                            {suggestions.map((suggestion, index) => {
                              const posStr = `${suggestion.position.row}${String.fromCharCode(1040 + suggestion.position.col)}`
                              const scoreColor = suggestion.score >= 10 ? 'text-green-400' : suggestion.score >= 5 ? 'text-yellow-400' : 'text-gray-400'
                              const borderColor = index === 0 ? 'border-yellow-500' : 'border-gray-600'

                              return (
                                <button
                                  key={index}
                                  onClick={() => {
                                    onSelectSuggestion?.(suggestion)
                                    setActiveTab('alphabet')
                                  }}
                                  className={`
                                    w-full group relative bg-gradient-to-br from-gray-750 to-gray-800 hover:from-gray-700 hover:to-gray-750
                                    border ${borderColor} hover:border-yellow-500
                                    rounded-lg p-2 transition-all duration-200
                                    hover:shadow-depth-2 hover:scale-102 cursor-pointer text-left
                                    ${index === 0 ? 'shadow-depth-1' : ''}
                                  `}
                                >
                                  {/* Rank indicator */}
                                  <div className="flex items-start justify-between mb-1">
                                    <div className={`flex items-center gap-1.5 ${index === 0 ? 'animate-pop' : ''}`}>
                                      <div className={`
                                        w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold
                                        ${index === 0 ? 'bg-yellow-600 text-white' : 'bg-gray-900 text-gray-500 border border-gray-700'}
                                      `}
                                      >
                                        {index + 1}
                                      </div>
                                      <div className="flex items-baseline gap-1">
                                        <span className="text-yellow-400 font-mono font-bold text-xs">{posStr}</span>
                                        <span className="text-green-400 font-bold text-sm">
                                          +
                                          {suggestion.letter}
                                        </span>
                                      </div>
                                    </div>

                                    {/* Score */}
                                    <div className={`${scoreColor} font-bold text-sm`}>
                                      {suggestion.score.toFixed(0)}
                                    </div>
                                  </div>

                                  {/* Word display */}
                                  <div className="bg-gray-900 bg-opacity-50 rounded px-2 py-1 border border-gray-700 group-hover:border-gray-600">
                                    <div className="text-white font-bold uppercase tracking-wide text-xs">
                                      {suggestion.word}
                                    </div>
                                  </div>

                                  {/* Hover indicator */}
                                  <div className="absolute inset-0 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
                                    <div className="absolute top-1/2 right-2 -translate-y-1/2 text-yellow-400 text-sm">→</div>
                                  </div>
                                </button>
                              )
                            })}
                          </div>
                        )}
                </div>
              )}
        </div>

        {/* Action buttons */}
        <div className="p-3 space-y-2 bg-gray-750 border-t border-gray-600">
          <button
            onClick={handleSubmit}
            disabled={!canSubmit || disabled}
            className={`w-full py-3 px-4 rounded-lg font-bold text-base transition-all duration-200 ${canSubmit && !disabled
              ? 'bg-green-600 hover:bg-green-700 text-white shadow-depth-2 hover:shadow-depth-3 hover:scale-105 glow-green'
              : 'bg-gray-700 text-gray-500 cursor-not-allowed shadow-depth-1'
            }`}
          >
            ✓ Подтвердить
          </button>

          <div className="flex gap-2">
            <button
              onClick={onClearSelection}
              disabled={disabled || (!selectedCell && !selectedLetter && wordPath.length === 0)}
              className="flex-1 px-4 py-2 bg-gray-600 hover:bg-gray-500 text-white rounded-lg font-semibold text-sm transition-all hover:shadow-md disabled:opacity-50 disabled:cursor-not-allowed"
            >
              ✕ Отмена
            </button>

            <button
              onClick={() => {
                onGetSuggestions()
                setActiveTab('suggestions')
              }}
              disabled={disabled}
              className="flex-1 px-4 py-2 bg-yellow-600 hover:bg-yellow-700 text-white rounded-lg font-semibold text-sm transition-all hover:shadow-md flex items-center justify-center gap-1.5 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              💡 AI
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
