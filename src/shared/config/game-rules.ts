/**
 * Game Rules Configuration
 * Core game mechanics and rules shared between client and server
 *
 * This configuration defines the fundamental rules of the Balda word game:
 * - Board dimensions and constraints
 * - Word length requirements
 * - Player count limits
 * - Alphabet definitions
 * - Movement directions
 */

/**
 * Board position type
 */
export interface BoardPosition {
  readonly row: number
  readonly col: number
}

/**
 * Board configuration
 */
export const BOARD_CONFIG = {
  /**
   * Available board sizes for game creation
   */
  SIZES: [3, 4, 5, 6, 7] as const,

  /**
   * Default board size (5x5 grid)
   */
  DEFAULT_SIZE: 5,

  /**
   * Minimum allowed board size
   */
  MIN_SIZE: 3,

  /**
   * Maximum allowed board size
   */
  MAX_SIZE: 7,
} as const

/**
 * Word length constraints
 */
export const WORD_CONFIG = {
  /**
   * Minimum word length for valid moves
   * Note: Base word is always equal to board size
   */
  MIN_LENGTH: 2,

  /**
   * Maximum word length for suggestion enumeration
   * Limits computational complexity of AI suggestions
   */
  MAX_LENGTH: 8,

  /**
   * Minimum word length for move validation
   * Words must be at least 3 letters to be accepted as valid moves
   */
  MIN_LENGTH_FOR_MOVE: 3,
} as const

/**
 * Player configuration
 */
export const PLAYER_CONFIG = {
  /**
   * Minimum number of players
   */
  MIN_COUNT: 2,

  /**
   * Maximum number of players
   */
  MAX_COUNT: 4,

  /**
   * Default player count for new games
   */
  DEFAULT_COUNT: 2,

  /**
   * Player name constraints
   */
  NAME_MIN_LENGTH: 1,
  NAME_MAX_LENGTH: 20,
} as const

/**
 * Turn and timing configuration
 */
export const TURN_CONFIG = {
  /**
   * Maximum time per turn in milliseconds (5 minutes)
   * After timeout, turn automatically passes to next player
   */
  TIMEOUT_MS: 5 * 60 * 1000,
} as const

/**
 * Alphabet definitions
 */
export const ALPHABET_CONFIG = {
  /**
   * Russian (Cyrillic) alphabet including Ё
   */
  RUSSIAN: 'АБВГДЕЁЖЗИЙКЛМНОПРСТУФХЦЧШЩЪЫЬЭЮЯ',

  /**
   * Latin alphabet (English)
   */
  LATIN: 'ABCDEFGHIJKLMNOPQRSTUVWXYZ',

  /**
   * Combined alphabet (Latin + Cyrillic)
   * Used for multi-language dictionary support
   */
  DEFAULT: 'ABCDEFGHIJKLMNOPQRSTUVWXYZАБВГДЕЁЖЗИЙКЛМНОПРСТУФХЦЧШЩЪЫЬЭЮЯ',
} as const

/**
 * Orthogonal movement directions
 * Balda only allows orthogonal (up/down/left/right) adjacency, no diagonals
 */
export const ORTHOGONAL_DIRS: readonly BoardPosition[] = Object.freeze([
  { row: -1, col: 0 }, // up
  { row: 1, col: 0 }, // down
  { row: 0, col: -1 }, // left
  { row: 0, col: 1 }, // right
])

/**
 * Consolidated game rules configuration
 * Single import for all game mechanics
 */
export const GAME_RULES = {
  BOARD: BOARD_CONFIG,
  WORD: WORD_CONFIG,
  PLAYER: PLAYER_CONFIG,
  TURN: TURN_CONFIG,
  ALPHABET: ALPHABET_CONFIG,
  ORTHOGONAL_DIRS,
} as const

/**
 * Type exports for configuration
 */
export type BoardSize = (typeof BOARD_CONFIG.SIZES)[number]
