/**
 * Scoring Configuration
 * Letter rarity-based scoring system
 *
 * Defines point values for letters based on frequency in Russian and Latin texts.
 * Rare letters get higher scores to encourage diverse word formation and strategic gameplay.
 *
 * Score Distribution:
 * - Score 1: Common letters (high frequency) - 8 Russian letters (А,Е,И,Н,О,Р,С,Т)
 * - Score 2: Medium frequency - 8 Russian (В,Д,К,Л,М,П,У,Я) + 21 Latin (A-V)
 * - Score 3: Less common - 8 Russian (Б,Г,Ж,З,Й,Х,Ц,Ч) + 5 Latin (Q,W,X,Y,Z)
 * - Score 4: Rare letters (highest value) - 9 Russian (Ё,Ш,Щ,Ъ,Ы,Ь,Э,Ю,Ф)
 */

/**
 * Letter score mapping based on frequency analysis
 * Keys are uppercase letters, values are point values (1-4)
 */
export const LETTER_SCORES: Readonly<Record<string, number>> = Object.freeze({
  // ========================================
  // RUSSIAN LETTERS (Cyrillic)
  // ========================================

  // Common Russian letters (Score: 1)
  // These appear most frequently in Russian text
  А: 4, // A - most common vowel
  Е: 4, // E/Ye - very common
  И: 4, // I - common vowel
  Н: 4, // N - very common consonant
  О: 4, // O - common vowel
  Р: 4, // R - common consonant
  С: 4, // S - very common consonant
  Т: 4, // T - most common consonant

  // Medium frequency Russian letters (Score: 2)
  В: 3, // V - fairly common
  Д: 3, // D - fairly common
  К: 3, // K - fairly common
  Л: 3, // L - fairly common
  М: 3, // M - fairly common
  П: 3, // P - fairly common
  У: 3, // U - fairly common vowel
  Я: 3, // Ya - fairly common

  // Less common Russian letters (Score: 3)
  Б: 2, // B - less common
  Г: 2, // G - less common
  Ж: 2, // Zh - less common
  З: 2, // Z - less common
  Й: 2, // Y (short) - less common
  Х: 2, // Kh - less common
  Ц: 2, // Ts - less common
  Ч: 2, // Ch - less common

  // Rare Russian letters (Score: 4)
  // Highest value for strategic gameplay
  Ё: 1, // Yo - very rare (often replaced with Е)
  Ш: 1, // Sh - rare
  Щ: 1, // Shch - rare
  Ъ: 1, // Hard sign - very rare
  Ы: 1, // Y - rare vowel
  Ь: 1, // Soft sign - rare
  Э: 1, // E - rare
  Ю: 1, // Yu - rare
  Ф: 1, // F - rare (often in borrowed words)

  // ========================================
  // LATIN LETTERS (English)
  // ========================================

  // Common Latin letters (Score: 2)
  // Medium baseline for non-Russian letters
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
  R: 2,
  S: 2,
  T: 2,
  U: 2,
  V: 2,

  // Rare Latin letters (Score: 3)
  Q: 3, // Rare in English
  W: 3, // Less common
  X: 3, // Rare
  Y: 3, // Less common as consonant
  Z: 3, // Rare
})

/**
 * Scoring metadata and constraints
 */
export const SCORING_METADATA = {
  /**
   * Default score for letters not in LETTER_SCORES map
   * Used as fallback for unknown characters
   */
  DEFAULT_SCORE: 1,

  /**
   * Minimum possible letter score
   */
  MIN_SCORE: 1,

  /**
   * Maximum possible letter score
   */
  MAX_SCORE: 4,

  /**
   * Score multiplier for future game modes
   * Currently not used, reserved for combo multipliers or special tiles
   */
  MULTIPLIER: 1,

  /**
   * Total number of scored letters
   */
  TOTAL_LETTERS: Object.keys(LETTER_SCORES).length,
} as const

/**
 * Export default score as top-level constant for backward compatibility
 */
export const DEFAULT_LETTER_SCORE = SCORING_METADATA.DEFAULT_SCORE

/**
 * Consolidated scoring configuration
 */
export const SCORING_CONFIG = {
  LETTER_SCORES,
  ...SCORING_METADATA,
} as const

/**
 * Calculate the score for a single letter
 * @param letter - Letter to score (case-insensitive)
 * @returns Point value (1-4)
 */
export function getLetterScore(letter: string): number {
  const normalized = letter.toUpperCase()
  return LETTER_SCORES[normalized] ?? SCORING_METADATA.DEFAULT_SCORE
}

/**
 * Calculate total score for a word
 * @param word - Word to score
 * @returns Sum of all letter scores
 */
export function calculateWordScore(word: string): number {
  let score = 0
  for (const letter of word.toUpperCase()) {
    score += getLetterScore(letter)
  }
  return score
}

/**
 * Get all letters with a specific score value
 * @param score - Score value to filter by (1-4)
 * @returns Array of letters with that score
 */
export function getLettersByScore(score: number): string[] {
  return Object.entries(LETTER_SCORES)
    .filter(([_, letterScore]) => letterScore === score)
    .map(([letter]) => letter)
}

/**
 * Calculate score distribution statistics
 * @returns Object with count of letters at each score level
 */
export function getScoreDistribution(): Record<number, number> {
  const distribution: Record<number, number> = { 1: 0, 2: 0, 3: 0, 4: 0 }
  for (const score of Object.values(LETTER_SCORES)) {
    distribution[score] = (distribution[score] ?? 0) + 1
  }
  return distribution
}
