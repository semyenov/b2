/**
 * Letter rarity-based scoring system
 * Uses shared scoring constants from ../../shared/constants/scoring
 */

import { DEFAULT_LETTER_SCORE, LETTER_SCORES } from '../../shared/constants/scoring'

/**
 * Normalizes a word by converting to uppercase and trimming whitespace
 *
 * @param word - Word to normalize
 * @returns Normalized word in uppercase
 *
 * @example
 * ```ts
 * normalizeWord('слово') // 'СЛОВО'
 * normalizeWord(' Hello ') // 'HELLO'
 * ```
 */
function normalizeWord(word: string): string {
  return word.trim().toUpperCase()
}

/**
 * Calculates word score based on letter rarity
 *
 * Each letter has a score (1-4) based on its frequency in Russian/Latin text:
 * - Common letters (А, Е, И, О, etc.): 1 point
 * - Medium frequency (В, Д, К, М, etc.): 2 points
 * - Less common (Б, Г, Ж, З, etc.): 3 points
 * - Rare letters (Ё, Ш, Щ, Ъ, etc.): 4 points
 *
 * @param word - Word to score
 * @returns Total score (sum of all letter scores)
 *
 * @example
 * ```ts
 * calculateWordScore('СЛОВО') // 1+2+1+2+1 = 7
 * calculateWordScore('ЁЖ') // 4+3 = 7
 * ```
 */
export function calculateWordScore(word: string): number {
  const normalized = normalizeWord(word)
  let score = 0
  for (const letter of normalized) {
    score += LETTER_SCORES[letter] ?? DEFAULT_LETTER_SCORE // Default score for unknown letters
  }
  return score
}
