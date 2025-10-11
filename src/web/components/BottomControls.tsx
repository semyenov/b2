import type { GameState, MoveBody } from '../lib/client'
import { useState } from 'react'

interface BottomControlsProps {
  game: GameState
  playerName: string
  onMove: (move: MoveBody) => void
  onGetSuggestions: () => void
  disabled?: boolean
  selectedCell?: { row: number; col: number }
  selectedLetter?: string
  wordPath?: Array<{ row: number; col: number }>
  onLetterSelect?: (letter: string) => void
  onClearSelection?: () => void
}

const RUSSIAN_ALPHABET = 'АБВГДЕЁЖЗИЙКЛМНОПРСТУФХЦЧШЩЪЫЬЭЮЯ'.split('')

export function BottomControls({
  game,
  playerName,
  onMove,
  onGetSuggestions,
  disabled,
  selectedCell,
  selectedLetter,
  wordPath = [],
  onLetterSelect,
  onClearSelection
}: BottomControlsProps) {
  const [hoveredLetter, setHoveredLetter] = useState<string>('')

  const wordFormed = wordPath.map(pos => {
    const cell = game.board[pos.row]?.[pos.col]
    // If this is the selected empty cell, show the selected letter
    if (pos.row === selectedCell?.row && pos.col === selectedCell?.col && !cell) {
      return selectedLetter || '?'
    }
    return cell || ''
  }).join('')

  const canSubmit = selectedCell && selectedLetter && wordPath.length >= 2

  const handleSubmit = () => {
    if (!canSubmit || !selectedCell) return

    onMove({
      playerId: playerName,
      position: selectedCell,
      letter: selectedLetter,
      word: wordFormed.toUpperCase(),
    })

    onClearSelection?.()
  }

  return (
    <div className="bg-gray-200 border-2 border-gray-400 rounded-lg p-4">
      {/* Status and word display */}
      <div className="mb-4 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="text-sm text-gray-600">
            {disabled ? (
              <span className="text-orange-600 font-semibold">Ждите своего хода...</span>
            ) : (
              <>
                {!selectedCell && <span>Кликните на пустую клетку</span>}
                {selectedCell && !selectedLetter && <span>Выберите букву</span>}
                {selectedCell && selectedLetter && wordPath.length < 2 && <span>Составьте слово (кликайте по буквам)</span>}
                {canSubmit && <span className="text-green-600 font-semibold">Слово готово!</span>}
              </>
            )}
          </div>
        </div>

        {/* Word display */}
        {wordFormed && (
          <div className="flex items-center gap-2">
            <span className="text-gray-600">Слово:</span>
            <div className="px-4 py-2 bg-white rounded border-2 border-gray-400">
              <span className="text-2xl font-bold font-mono tracking-wider">
                {wordFormed}
              </span>
            </div>
          </div>
        )}
      </div>

      {/* Alphabet buttons */}
      <div className="mb-4">
        <div className="grid grid-cols-11 gap-1">
          {RUSSIAN_ALPHABET.map(letter => (
            <button
              key={letter}
              onClick={() => onLetterSelect?.(letter)}
              onMouseEnter={() => setHoveredLetter(letter)}
              onMouseLeave={() => setHoveredLetter('')}
              disabled={disabled || !selectedCell || !!selectedLetter}
              className={`
                px-2 py-3 rounded font-bold text-lg transition-all
                ${selectedLetter === letter
                  ? 'bg-blue-500 text-white shadow-md transform scale-105'
                  : hoveredLetter === letter
                  ? 'bg-yellow-300 text-gray-800 transform scale-105'
                  : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-100'
                }
                ${(disabled || !selectedCell || !!selectedLetter) && selectedLetter !== letter
                  ? 'opacity-40 cursor-not-allowed'
                  : 'cursor-pointer hover:shadow-md'
                }
              `}
            >
              {letter}
            </button>
          ))}
        </div>
      </div>

      {/* Action buttons */}
      <div className="flex gap-2">
        <button
          onClick={handleSubmit}
          disabled={!canSubmit || disabled}
          className={`
            flex-1 py-3 px-6 rounded-lg font-semibold text-lg transition-all
            ${canSubmit && !disabled
              ? 'bg-green-500 hover:bg-green-600 text-white shadow-md hover:shadow-lg transform hover:scale-102'
              : 'bg-gray-300 text-gray-500 cursor-not-allowed'
            }
          `}
        >
          Подтвердить
        </button>

        <button
          onClick={onClearSelection}
          disabled={disabled || (!selectedCell && !selectedLetter && wordPath.length === 0)}
          className="px-6 py-3 bg-gray-400 hover:bg-gray-500 text-white rounded-lg font-semibold transition-all hover:shadow-md"
        >
          Отмена
        </button>

        <button
          onClick={onGetSuggestions}
          disabled={disabled}
          className="px-6 py-3 bg-yellow-500 hover:bg-yellow-600 text-white rounded-lg font-semibold transition-all hover:shadow-md flex items-center gap-2"
        >
          💡 Подсказка
        </button>
      </div>
    </div>
  )
}