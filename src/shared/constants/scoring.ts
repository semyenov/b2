/**
 * Letter Scoring Constants
 * Shared between server and web for consistent scoring
 *
 * Letter rarity-based scoring system for Russian and Latin alphabets.
 * Rare letters get higher scores to encourage diverse word formation.
 */

/**
 * Letter scores based on frequency in Russian and Latin texts
 * - Score 1: Common letters (high frequency)
 * - Score 2: Medium frequency letters
 * - Score 3: Less common letters
 * - Score 4: Rare letters
 */
export const LETTER_SCORES: Readonly<Record<string, number>> = Object.freeze({
  // Common Russian letters (lower scores)
  А: 1,
  Е: 1,
  И: 1,
  Н: 1,
  О: 1,
  Р: 1,
  С: 1,
  Т: 1,

  // Medium frequency Russian letters
  В: 2,
  Д: 2,
  К: 2,
  Л: 2,
  М: 2,
  П: 2,
  У: 2,
  Я: 2,

  // Less common Russian letters
  Б: 3,
  Г: 3,
  Ж: 3,
  З: 3,
  Й: 3,
  Х: 3,
  Ц: 3,
  Ч: 3,

  // Rare Russian letters (higher scores)
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
  Q: 3,
  R: 2,
  S: 2,
  T: 2,
  U: 2,
  V: 2,
  W: 3,
  X: 3,
  Y: 3,
  Z: 3,
})

/**
 * Default score for unknown letters
 */
export const DEFAULT_LETTER_SCORE = 1
