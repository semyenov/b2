/**
 * Letter rarity-based scoring system
 * Matches backend implementation in src/server/engine/balda.ts
 */

const LETTER_SCORES: Record<string, number> = {
  // Common Russian letters (lower scores)
  А: 1,
  Е: 1,
  И: 1,
  Н: 1,
  О: 1,
  Р: 1,
  С: 1,
  Т: 1,
  // Medium frequency
  В: 2,
  Д: 2,
  К: 2,
  Л: 2,
  М: 2,
  П: 2,
  У: 2,
  Я: 2,
  // Less common
  Б: 3,
  Г: 3,
  Ж: 3,
  З: 3,
  Й: 3,
  Х: 3,
  Ц: 3,
  Ч: 3,
  // Rare letters (higher scores)
  Ё: 4,
  Ш: 4,
  Щ: 4,
  Ъ: 4,
  Ы: 4,
  Ь: 4,
  Э: 4,
  Ю: 4,
  Ф: 4,
  // Latin letters (medium scores)
  A: 2,
  B: 2,
  C: 2,
  D: 2,
  E: 2,
  F: 2,
  G: 2,
  H: 2,
  I: 2,
  J: 2,
  K: 2,
  L: 2,
  M: 2,
  N: 2,
  O: 2,
  P: 2,
  Q: 2,
  R: 2,
  S: 2,
  T: 2,
  U: 2,
  V: 2,
  W: 2,
  X: 2,
  Y: 2,
  Z: 2,
}

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
    score += LETTER_SCORES[letter] ?? 1 // Default score for unknown letters
  }
  return score
}
