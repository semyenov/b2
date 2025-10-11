import type { GameState, MoveBody } from '../lib/client'
import { useState } from 'react'

interface BottomControlsProps {
  game: GameState
  playerName: string
  onMove: (move: MoveBody) => void
  onGetSuggestions: () => void
  disabled?: boolean
  selectedCell?: { row: number, col: number }
  selectedLetter?: string
  wordPath?: Array<{ row: number, col: number }>
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
  onClearSelection,
}: BottomControlsProps) {
  const [hoveredLetter, setHoveredLetter] = useState<string>('')

  const wordFormed = wordPath.map((pos) => {
    const cell = game.board[pos.row]?.[pos.col]
    // If this is the selected empty cell, show the selected letter
    if (pos.row === selectedCell?.row && pos.col === selectedCell?.col && !cell) {
      return selectedLetter || '?'
    }
    return cell || ''
  }).join('')

  const canSubmit = selectedCell && selectedLetter && wordPath.length >= 2

  const handleSubmit = () => {
    if (!canSubmit || !selectedCell)
      return

    onMove({
      playerId: playerName,
      position: selectedCell,
      letter: selectedLetter,
      word: wordFormed.toUpperCase(),
    })

    onClearSelection?.()
  }

  return (
    <div className="bg-gray-800 border-2 border-gray-600 rounded-lg p-3">
      {/* Status and word display */}
      <div className="mb-1.5 flex items-center justify-between">
        <div className="text-xs text-gray-500">
          {disabled
            ? (
                <span className="text-orange-400">Ждите хода...</span>
              )
            : (
                <>
                  {!selectedCell && <span>Выберите клетку</span>}
                  {selectedCell && !selectedLetter && <span>Выберите букву</span>}
                  {selectedCell && selectedLetter && wordPath.length < 2 && <span>Составьте слово</span>}
                  {canSubmit && <span className="text-green-400 font-semibold">Готово!</span>}
                </>
              )}
        </div>

        {/* Word display */}
        {wordFormed && (
          <div className="flex items-center gap-2">
            <span className="text-gray-500 text-xs">Слово:</span>
            <div className="px-3 py-1 bg-gray-700 rounded border border-gray-600">
              <span className="text-xl font-bold font-mono tracking-wider text-gray-100">
                {wordFormed}
              </span>
            </div>
          </div>
        )}
      </div>

      {/* Alphabet buttons */}
      <div className="mb-2">
        <div className="grid grid-cols-11 gap-1">
          {RUSSIAN_ALPHABET.map(letter => (
            <button
              key={letter}
              onClick={() => onLetterSelect?.(letter)}
              onMouseEnter={() => setHoveredLetter(letter)}
              onMouseLeave={() => setHoveredLetter('')}
              disabled={disabled || !selectedCell || !!selectedLetter}
              className={`
                px-1.5 py-1.5 rounded font-bold text-base transition-all
                ${selectedLetter === letter
              ? 'bg-blue-600 text-white shadow-md transform scale-105'
              : hoveredLetter === letter
                ? 'bg-yellow-500 text-gray-900 transform scale-105'
                : 'bg-gray-700 text-gray-200 border border-gray-600 hover:bg-gray-600'
            }
                ${(disabled || !selectedCell || !!selectedLetter) && selectedLetter !== letter
              ? 'opacity-30 cursor-not-allowed'
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
      <div className="flex gap-1.5">
        <button
          onClick={handleSubmit}
          disabled={!canSubmit || disabled}
          className={`
            flex-1 py-2 px-4 rounded font-semibold text-sm transition-all
            ${canSubmit && !disabled
      ? 'bg-green-600 hover:bg-green-700 text-white shadow-md hover:shadow-lg'
      : 'bg-gray-700 text-gray-500 cursor-not-allowed'
    }
          `}
        >
          Подтвердить
        </button>

        <button
          onClick={onClearSelection}
          disabled={disabled || (!selectedCell && !selectedLetter && wordPath.length === 0)}
          className="px-4 py-2 bg-gray-600 hover:bg-gray-500 text-white rounded font-semibold text-sm transition-all hover:shadow-md"
        >
          Отмена
        </button>

        <button
          onClick={onGetSuggestions}
          disabled={disabled}
          className="px-4 py-2 bg-yellow-600 hover:bg-yellow-700 text-white rounded font-semibold text-sm transition-all hover:shadow-md flex items-center gap-1.5"
        >
          💡 Подсказка
        </button>
      </div>
    </div>
  )
}
