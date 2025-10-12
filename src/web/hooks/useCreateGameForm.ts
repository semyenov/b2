import type { CreateGameBody } from '../lib/client'
import { useState } from 'react'
import { generatePlayerName } from '../utils/playerNameUtils'
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
 * @param word - Word to validate
 * @returns True if word contains only Russian letters
 */
function isValidRussianWord(word: string): boolean {
  return /^[А-ЯЁ]+$/i.test(word)
}

/**
 * Custom hook for create game form logic
 * Handles form state, validation, and submission
 *
 * @param options - Form submission callback
 * @returns Form state and handlers
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

    // Submit valid game with generated player names
    onSubmit({
      size: sizeNum,
      baseWord: baseWord.toUpperCase(),
      players: [generatePlayerName(), generatePlayerName()],
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
