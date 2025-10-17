/**
 * Alphabet Definitions
 * Character sets for different languages
 *
 * Defines the valid characters for:
 * - Russian (Cyrillic) alphabet
 * - Latin (English) alphabet
 * - Combined multi-language support
 */

/**
 * Alphabet definitions for different languages
 */
export const ALPHABETS = {
  /**
   * Russian (Cyrillic) alphabet including Ё
   * 33 letters total
   */
  RUSSIAN: 'АБВГДЕЁЖЗИЙКЛМНОПРСТУФХЦЧШЩЪЫЬЭЮЯ',

  /**
   * Latin alphabet (English)
   * 26 letters total
   */
  LATIN: 'ABCDEFGHIJKLMNOPQRSTUVWXYZ',

  /**
   * Combined alphabet (Latin + Cyrillic)
   * Used for multi-language dictionary support
   * 59 letters total (26 Latin + 33 Cyrillic)
   */
  DEFAULT: 'ABCDEFGHIJKLMNOPQRSTUVWXYZАБВГДЕЁЖЗИЙКЛМНОПРСТУФХЦЧШЩЪЫЬЭЮЯ',
} as const

/**
 * Helper function to check if a character is valid in an alphabet
 * @param char - Character to check
 * @param alphabet - Alphabet to check against (default: DEFAULT)
 * @returns True if character is in alphabet
 */
export function isValidChar(char: string, alphabet: string = ALPHABETS.DEFAULT): boolean {
  return alphabet.includes(char.toUpperCase())
}

/**
 * Helper function to filter a string to only valid alphabet characters
 * @param str - String to filter
 * @param alphabet - Alphabet to filter by (default: DEFAULT)
 * @returns Filtered string with only valid characters
 */
export function filterToAlphabet(str: string, alphabet: string = ALPHABETS.DEFAULT): string {
  return str
    .toUpperCase()
    .split('')
    .filter(char => alphabet.includes(char))
    .join('')
}

/**
 * Get alphabet for a language code
 * @param lang - Language code ('ru', 'en', or 'default')
 * @returns Alphabet string
 */
export function getAlphabet(lang: 'ru' | 'en' | 'default' = 'default'): string {
  switch (lang) {
    case 'ru':
      return ALPHABETS.RUSSIAN
    case 'en':
      return ALPHABETS.LATIN
    default:
      return ALPHABETS.DEFAULT
  }
}
