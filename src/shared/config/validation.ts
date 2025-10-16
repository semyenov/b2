/**
 * Validation Rules Configuration
 * Input validation patterns and constraints
 *
 * Defines validation rules for:
 * - Player names
 * - Game IDs
 * - Base words
 * - Move constraints
 */

/**
 * Player name validation rules
 */
export const PLAYER_NAME_VALIDATION = {
  /**
   * Minimum player name length
   */
  MIN_LENGTH: 1,

  /**
   * Maximum player name length
   */
  MAX_LENGTH: 20,

  /**
   * Allowed characters pattern (alphanumeric + underscore + hyphen + Cyrillic)
   */
  PATTERN: /^[\wа-яА-ЯёЁ-]+$/,

  /**
   * Error message for invalid player names
   */
  ERROR_MESSAGE: 'Имя игрока должно содержать от 1 до 20 символов (буквы, цифры, _ или -)',
} as const

/**
 * Base word validation rules (for game creation)
 */
export const BASE_WORD_VALIDATION = {
  /**
   * Allowed characters for base word (Russian Cyrillic only)
   */
  PATTERN: /^[А-ЯЁа-яё]+$/,

  /**
   * Error message for invalid base words
   */
  ERROR_MESSAGE: 'Базовое слово должно содержать только русские буквы',
} as const

/**
 * Move validation constraints
 */
export const MOVE_VALIDATION = {
  /**
   * Minimum word length for a valid move
   * Hardcoded in suggest.ts line 130, now centralized
   */
  MIN_WORD_LENGTH: 3,

  /**
   * Single letter constraint (for letter placement)
   */
  LETTER_LENGTH: 1,
} as const

/**
 * Game ID validation rules
 */
export const GAME_ID_VALIDATION = {
  /**
   * Allowed characters in game IDs
   */
  PATTERN: /^[\w-]+$/,

  /**
   * Minimum game ID length
   */
  MIN_LENGTH: 1,

  /**
   * Maximum game ID length
   */
  MAX_LENGTH: 100,
} as const

/**
 * Email validation (for future authentication)
 */
export const EMAIL_VALIDATION = {
  /**
   * RFC 5322 compliant email pattern (simplified)
   */
  PATTERN: /^[^\s@]+@[^\s@][^\s.@]*\.[^\s@]+$/,

  /**
   * Error message for invalid emails
   */
  ERROR_MESSAGE: 'Неверный формат email',
} as const

/**
 * Password validation (for future authentication)
 */
export const PASSWORD_VALIDATION = {
  /**
   * Minimum password length
   */
  MIN_LENGTH: 8,

  /**
   * Maximum password length
   */
  MAX_LENGTH: 128,

  /**
   * Error message for weak passwords
   */
  ERROR_MESSAGE: 'Пароль должен содержать минимум 8 символов',
} as const

/**
 * Username validation (for future authentication)
 */
export const USERNAME_VALIDATION = {
  /**
   * Minimum username length
   */
  MIN_LENGTH: 3,

  /**
   * Maximum username length
   */
  MAX_LENGTH: 20,

  /**
   * Allowed characters pattern
   */
  PATTERN: /^[\w-]+$/,

  /**
   * Error message for invalid usernames
   */
  ERROR_MESSAGE: 'Имя пользователя должно содержать от 3 до 20 символов (буквы, цифры, _ или -)',
} as const

/**
 * Consolidated validation configuration
 */
export const VALIDATION_RULES = {
  PLAYER_NAME: PLAYER_NAME_VALIDATION,
  BASE_WORD: BASE_WORD_VALIDATION,
  MOVE: MOVE_VALIDATION,
  GAME_ID: GAME_ID_VALIDATION,
  EMAIL: EMAIL_VALIDATION,
  PASSWORD: PASSWORD_VALIDATION,
  USERNAME: USERNAME_VALIDATION,
} as const

/**
 * Helper function to validate player name
 * @param name - Player name to validate
 * @returns True if valid, false otherwise
 */
export function isValidPlayerName(name: string): boolean {
  return (
    name.length >= PLAYER_NAME_VALIDATION.MIN_LENGTH
    && name.length <= PLAYER_NAME_VALIDATION.MAX_LENGTH
    && PLAYER_NAME_VALIDATION.PATTERN.test(name)
  )
}

/**
 * Helper function to validate base word (Russian only)
 * @param word - Base word to validate
 * @returns True if valid, false otherwise
 */
export function isValidBaseWord(word: string): boolean {
  return BASE_WORD_VALIDATION.PATTERN.test(word)
}

/**
 * Helper function to validate email
 * @param email - Email to validate
 * @returns True if valid, false otherwise
 */
export function isValidEmail(email: string): boolean {
  return EMAIL_VALIDATION.PATTERN.test(email)
}

/**
 * Helper function to validate game ID
 * @param id - Game ID to validate
 * @returns True if valid, false otherwise
 */
export function isValidGameId(id: string): boolean {
  return (
    id.length >= GAME_ID_VALIDATION.MIN_LENGTH
    && id.length <= GAME_ID_VALIDATION.MAX_LENGTH
    && GAME_ID_VALIDATION.PATTERN.test(id)
  )
}
