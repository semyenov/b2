import type { CreateGameBody } from '../lib/client'
import { useState } from 'react'
import { getRussianPluralForm } from '../utils/russianPlural'

interface UseCreateGameFormOptions {
  onSubmit: (body: CreateGameBody) => void
}

interface UseCreateGameFormReturn {
  size: string
  baseWord: string
  error: string
  setSize: (size: string) => void
  setBaseWord: (word: string) => void
  handleSubmit: (e: React.FormEvent) => void
}

/**
 * Form validation for Russian letters only
 */
function isValidRussianWord(word: string): boolean {
  return /^[А-ЯЁ]+$/i.test(word)
}

/**
 * Custom hook for create game form logic
 * Handles form state, validation, and submission
 */
export function useCreateGameForm({ onSubmit }: UseCreateGameFormOptions): UseCreateGameFormReturn {
  const [size, setSize] = useState('5')
  const [baseWord, setBaseWord] = useState('')
  const [error, setError] = useState('')

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

    const sizeNum = Number.parseInt(size, 10)

    // Validate word length matches board size
    if (!baseWord || baseWord.length !== sizeNum) {
      setError(`Базовое слово должно содержать ровно ${sizeNum} ${getRussianPluralForm(sizeNum, ['букву', 'буквы', 'букв'])}`)
      return
    }

    // Validate Russian letters only
    if (!isValidRussianWord(baseWord)) {
      setError('Используйте только русские буквы')
      return
    }

    // Submit valid game
    onSubmit({
      size: sizeNum,
      baseWord: baseWord.toUpperCase(),
      players: [`Player_${Date.now()}`, 'Player 2'],
    })
  }

  return {
    size,
    baseWord,
    error,
    setSize,
    setBaseWord,
    handleSubmit,
  }
}
