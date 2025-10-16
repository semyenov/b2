/**
 * Internationalization (i18n) Configuration
 * Multi-language support for the Balda game
 *
 * Currently supports:
 * - Russian (ru) - Primary language
 *
 * Future languages:
 * - English (en)
 * - Other languages as needed
 */

import { ru } from './ru'

/**
 * Available locales
 */
export type LocaleCode = 'ru' | 'en'

/**
 * Default locale for the application
 */
export const DEFAULT_LOCALE: LocaleCode = 'ru'

/**
 * Locale registry
 * Maps locale codes to their translations
 */
const locales = {
  ru,
  // en: will be added when English translation is available
} as const

/**
 * Get translation messages for a specific locale
 * Falls back to Russian if locale not available
 *
 * @param locale - Locale code (e.g., 'ru', 'en')
 * @returns Translation messages for the locale
 */
export function getMessages(locale: LocaleCode = DEFAULT_LOCALE) {
  return locale in locales ? locales[locale as keyof typeof locales] : locales.ru
}

/**
 * Current active messages (Russian by default)
 * Import this to access translations throughout the app
 */
export const messages = getMessages(DEFAULT_LOCALE)

/**
 * Re-export Russian messages for direct access
 */
export { ru }

/**
 * Re-export types
 */
export type { Locale } from './ru'

/**
 * Error message translation map (English API → Russian UI)
 * Used to translate backend error responses to user-facing messages
 */
export const ERROR_MESSAGE_MAP: Record<string, string> = {
  'Player ID is required': messages.errors.PLAYER_ID_REQUIRED,
  'Letter is required': messages.errors.LETTER_REQUIRED,
  'Letter must be exactly one character': messages.errors.LETTER_SINGLE_CHARACTER,
  'Word is required': messages.errors.WORD_REQUIRED,
  'Position is outside of board': messages.errors.POSITION_OUT_OF_BOUNDS,
  'Cell is already occupied': messages.errors.CELL_OCCUPIED,
  'Placement must be adjacent to existing letters': messages.errors.NOT_ADJACENT,
  'Not current player\'s turn': messages.errors.NOT_YOUR_TURN,
  'Word is not present in dictionary': messages.errors.WORD_NOT_IN_DICTIONARY,
  'Word already used in this game': messages.errors.WORD_ALREADY_USED,
  'No valid path for the claimed word': messages.errors.NO_VALID_PATH,
  'Placed letter must be part of the claimed word': messages.errors.LETTER_NOT_IN_WORD,
  'Game not found': messages.errors.GAME_NOT_FOUND,
} as const

/**
 * Translate an API error message to user-facing Russian text
 * Handles both static messages and dynamic messages with parameters
 *
 * @param message - Error message from API (typically in English)
 * @returns Translated error message in Russian
 *
 * @example
 * translateError('Word is not present in dictionary')
 * // Returns: 'Слово отсутствует в словаре'
 *
 * @example
 * translateError('Player name "John" is already taken')
 * // Returns: 'Имя игрока "John" уже занято'
 */
export function translateError(message: string): string {
  // Check direct mapping for static messages
  if (message in ERROR_MESSAGE_MAP) {
    return ERROR_MESSAGE_MAP[message]!
  }

  // Handle dynamic messages with regex extraction

  // "Player name \"X\" is already taken"
  const playerNameTakenMatch = message.match(/Player name "(.+)" is already taken/)
  if (playerNameTakenMatch?.[1]) {
    return messages.errors.PLAYER_NAME_TAKEN(playerNameTakenMatch[1])
  }

  // "Player \"X\" not found"
  const playerNotFoundMatch = message.match(/Player "(.+)" not found/)
  if (playerNotFoundMatch?.[1]) {
    return messages.errors.PLAYER_NOT_FOUND(playerNotFoundMatch[1])
  }

  // Return original message if no translation found
  // This ensures we always show something to the user
  return message
}

/**
 * Helper to format time ago in Russian
 * @param timestamp - Unix timestamp in milliseconds
 * @returns Human-readable time string
 */
export function formatTimeAgo(timestamp: number): string {
  const now = Date.now()
  const diffMs = now - timestamp
  const diffMinutes = Math.floor(diffMs / (1000 * 60))
  const diffHours = Math.floor(diffMs / (1000 * 60 * 60))
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24))

  if (diffMinutes < 1) {
    return messages.ui.TIME_JUST_NOW
  }
  if (diffMinutes < 60) {
    return messages.ui.TIME_MINUTES_AGO(diffMinutes)
  }
  if (diffHours < 24) {
    return messages.ui.TIME_HOURS_AGO(diffHours)
  }
  return messages.ui.TIME_DAYS_AGO(diffDays)
}

/**
 * Get correct Russian plural form for a number
 * Russian has 3 plural forms based on the number
 *
 * @param n - Number
 * @param forms - Array of 3 forms [one, few, many]
 * @returns Correct plural form
 *
 * @example
 * getRussianPlural(1, ['буква', 'буквы', 'букв']) // 'буква'
 * getRussianPlural(2, ['буква', 'буквы', 'букв']) // 'буквы'
 * getRussianPlural(5, ['буква', 'буквы', 'букв']) // 'букв'
 */
export function getRussianPlural(n: number, forms: [string, string, string]): string {
  const mod10 = n % 10
  const mod100 = n % 100

  if (mod10 === 1 && mod100 !== 11) {
    return forms[0] // one: 1, 21, 31, ...
  }
  if ([2, 3, 4].includes(mod10) && ![12, 13, 14].includes(mod100)) {
    return forms[1] // few: 2-4, 22-24, ...
  }
  return forms[2] // many: 0, 5-20, 25-30, ...
}
