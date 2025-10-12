/**
 * Game configuration constants
 * Central location for all magic numbers and configuration values
 */

export const GAME_CONFIG = {
  // Suggestions
  MAX_SUGGESTIONS_DISPLAY: 20,

  // Board
  DEFAULT_BOARD_SIZE: 5,
  MIN_WORD_LENGTH: 2,

  // Alphabet
  ALPHABET_GRID_COLUMNS: 11,

  // AI
  AI_THINKING_DELAY_MS: 1500,

  // Score thresholds for suggestion coloring
  SCORE_THRESHOLDS: {
    HIGH: 10,
    MEDIUM: 5,
  },
} as const

export const BOARD_SIZES = [3, 4, 5, 6, 7] as const

export const RUSSIAN_ALPHABET = 'АБВГДЕЁЖЗИЙКЛМНОПРСТУФХЦЧШЩЪЫЬЭЮЯ'.split('')

/**
 * Game status configuration
 * Maps status to display label and styling classes
 */
export const GAME_STATUS_CONFIG = {
  waiting: {
    label: 'Ожидание',
    className: 'bg-yellow-900 text-yellow-300 border-yellow-600',
  },
  in_progress: {
    label: 'В процессе',
    className: 'bg-green-900 text-green-300 border-green-600',
  },
  finished: {
    label: 'Завершена',
    className: 'bg-gray-700 text-gray-300 border-gray-600',
  },
} as const

/**
 * Accessibility labels
 */
export const A11Y_LABELS = {
  BOARD_CELL_EMPTY: (coord: string) => `Пустая клетка ${coord}`,
  BOARD_CELL_FILLED: (coord: string, letter: string) => `Клетка ${coord}, буква ${letter}`,
  BOARD_CELL_SELECTED: (coord: string, letter: string) => `Выбрана клетка ${coord} для буквы ${letter}`,
  BOARD_CELL_IN_PATH: (coord: string, letter: string, position: number) => `Клетка ${coord}, буква ${letter}, позиция ${position} в слове`,

  LETTER_BUTTON: (letter: string) => `Выбрать букву ${letter}`,
  LETTER_BUTTON_SELECTED: (letter: string) => `Буква ${letter} выбрана`,

  TURN_ANNOUNCEMENT: (playerName: string) => `Ход игрока ${playerName}`,
  YOUR_TURN: 'Ваш ход',
  WAITING_FOR_OPPONENT: (playerName: string) => `Ожидание хода игрока ${playerName}`,

  MOVE_SUCCESS: (word: string, score: number) => `Слово ${word} принято, ${score} очков`,
  MOVE_ERROR: (error: string) => `Ошибка: ${error}`,
} as const

/**
 * Game status types
 */
export const GAME_STATUS = {
  WAITING: 'waiting',
  IN_PROGRESS: 'in_progress',
  FINISHED: 'finished',
} as const

export type GameStatus = typeof GAME_STATUS[keyof typeof GAME_STATUS]
