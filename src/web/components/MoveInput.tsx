import type { GameState, MoveBody, Suggestion } from '../lib/client'
import { useEffect, useState } from 'react'

interface MoveInputProps {
  game: GameState
  playerName: string
  onMove: (move: MoveBody) => void
  disabled?: boolean
  suggestion?: Suggestion
}

export function MoveInput({ game, playerName, onMove, disabled, suggestion }: MoveInputProps) {
  const [position, setPosition] = useState('')
  const [letter, setLetter] = useState('')
  const [word, setWord] = useState('')
  const [error, setError] = useState('')

  // Auto-fill form when suggestion is provided
  useEffect(() => {
    if (suggestion) {
      const posStr = `${suggestion.position.row}${String.fromCharCode(1040 + suggestion.position.col)}`
      setPosition(posStr)
      setLetter(suggestion.letter)
      setWord(suggestion.word)
      setError('')
    }
  }, [suggestion])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

    // Parse position (e.g., "2Б" -> row:2, col:1)
    const match = position.match(/^(\d)([А-Я])$/i)
    if (!match) {
      setError('Формат позиции: цифра + буква (например, 2Б)')
      return
    }

    const row = Number.parseInt(match[1], 10)
    const col = match[2].toUpperCase().charCodeAt(0) - 1040

    if (row < 0 || row >= game.size || col < 0 || col >= game.size) {
      setError(`Неверная позиция. Используйте 0-${game.size - 1} для строки и А-${String.fromCharCode(1039 + game.size)} для столбца`)
      return
    }

    if (!letter || !/^[А-Я]$/i.test(letter)) {
      setError('Введите одну русскую букву')
      return
    }

    if (!word || word.length < 2) {
      setError('Слово должно содержать минимум 2 буквы')
      return
    }

    onMove({
      playerId: playerName,
      position: { row, col },
      letter: letter.toUpperCase(),
      word: word.toUpperCase(),
    })

    // Clear form
    setPosition('')
    setLetter('')
    setWord('')
  }

  if (disabled) {
    return (
      <div className="bg-gray-800 rounded-lg p-4 text-center text-yellow-400">
        Ожидание вашего хода...
      </div>
    )
  }

  return (
    <form onSubmit={handleSubmit} className="bg-gray-800 rounded-lg p-4 space-y-4">
      <h3 className="text-lg font-bold text-cyan-400">Сделайте ход</h3>

      <div className="grid grid-cols-3 gap-4">
        <div>
          <label className="block text-sm text-gray-400 mb-1">Позиция</label>
          <input
            type="text"
            value={position}
            onChange={e => setPosition(e.target.value.toUpperCase())}
            className="w-full px-3 py-2 bg-gray-700 rounded border border-gray-600 focus:border-cyan-400 focus:outline-none uppercase"
            placeholder="2Б"
            maxLength={2}
            required
          />
        </div>

        <div>
          <label className="block text-sm text-gray-400 mb-1">Буква</label>
          <input
            type="text"
            value={letter}
            onChange={e => setLetter(e.target.value.toUpperCase())}
            className="w-full px-3 py-2 bg-gray-700 rounded border border-gray-600 focus:border-cyan-400 focus:outline-none uppercase text-center text-xl font-bold"
            placeholder="Ф"
            maxLength={1}
            required
          />
        </div>

        <div>
          <label className="block text-sm text-gray-400 mb-1">Слово</label>
          <input
            type="text"
            value={word}
            onChange={e => setWord(e.target.value.toUpperCase())}
            className="w-full px-3 py-2 bg-gray-700 rounded border border-gray-600 focus:border-cyan-400 focus:outline-none uppercase"
            placeholder="ФРАЗА"
            required
          />
        </div>
      </div>

      {error && (
        <div className="text-red-400 text-sm">{error}</div>
      )}

      <button
        type="submit"
        className="w-full py-2 bg-green-600 hover:bg-green-700 rounded font-semibold transition"
      >
        Отправить ход
      </button>
    </form>
  )
}
