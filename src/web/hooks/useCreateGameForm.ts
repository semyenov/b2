import type { CreateGameBody } from '@lib/client'
import { ERROR_MESSAGES } from '@constants/messages'
import { generatePlayerName } from '@utils/playerNameUtils'
import { getRussianPluralForm } from '@utils/russianPlural'
import { useState } from 'react'

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
 * @param options - Hook configuration
 * @param options.onSubmit - Form submission callback
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
      const pluralForm = getRussianPluralForm(sizeNum, ['букву', 'буквы', 'букв'])
      setError(ERROR_MESSAGES.BASE_WORD_LENGTH(sizeNum, pluralForm))
      return
    }

    // Validate Russian letters only
    if (!isValidRussianWord(baseWord)) {
      setError(ERROR_MESSAGES.ONLY_RUSSIAN_LETTERS)
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
