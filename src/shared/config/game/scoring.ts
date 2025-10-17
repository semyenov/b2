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
  А: 1, // A - most common vowel
  Е: 1, // E/Ye - very common
  И: 1, // I - common vowel
  Н: 1, // N - very common consonant
  О: 1, // O - common vowel
  Р: 1, // R - common consonant
  С: 1, // S - very common consonant
  Т: 1, // T - most common consonant

  // Medium frequency Russian letters (Score: 2)
  В: 2, // V - fairly common
  Д: 2, // D - fairly common
  К: 2, // K - fairly common
  Л: 2, // L - fairly common
  М: 2, // M - fairly common
  П: 2, // P - fairly common
  У: 2, // U - fairly common vowel
  Я: 2, // Ya - fairly common

  // Less common Russian letters (Score: 3)
  Б: 3, // B - less common
  Г: 3, // G - less common
  Ж: 3, // Zh - less common
  З: 3, // Z - less common
  Й: 3, // Y (short) - less common
  Х: 3, // Kh - less common
  Ц: 3, // Ts - less common
  Ч: 3, // Ch - less common

  // Rare Russian letters (Score: 4)
  // Highest value for strategic gameplay
  Ё: 4, // Yo - very rare (often replaced with Е)
  Ш: 4, // Sh - rare
  Щ: 4, // Shch - rare
  Ъ: 4, // Hard sign - very rare
  Ы: 4, // Y - rare vowel
  Ь: 4, // Soft sign - rare
  Э: 4, // E - rare
  Ю: 4, // Yu - rare
  Ф: 4, // F - rare (often in borrowed words)

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
