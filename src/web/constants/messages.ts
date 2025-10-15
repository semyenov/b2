/**
 * Application Messages
 * Centralized Russian localization for all user-facing messages
 */

/**
 * Error messages displayed in Banner notifications
 */
export const ERROR_MESSAGES = {
  // Connection errors
  SERVER_CONNECTION_FAILED: 'Не удалось подключиться к серверу',
  CONNECTION_LOST: 'Соединение потеряно',
  GENERIC_ERROR: 'Произошла ошибка',

  // AI errors
  AI_NO_MOVES: 'У AI нет доступных ходов',
  AI_MOVE_FAILED: 'Ошибка AI хода',

  // Form validation errors
  BASE_WORD_LENGTH: (size: number, pluralForm: string) =>
    `Базовое слово должно содержать ровно ${size} ${pluralForm}`,
  ONLY_RUSSIAN_LETTERS: 'Используйте только русские буквы',

  // Backend validation errors (English -> Russian mapping)
  PLAYER_ID_REQUIRED: 'Требуется ID игрока',
  LETTER_REQUIRED: 'Требуется буква',
  LETTER_SINGLE_CHARACTER: 'Буква должна быть одним символом',
  WORD_REQUIRED: 'Требуется слово',
  POSITION_OUT_OF_BOUNDS: 'Позиция за пределами доски',
  CELL_OCCUPIED: 'Клетка уже занята',
  NOT_ADJACENT: 'Размещение должно быть рядом с существующими буквами',
  NOT_YOUR_TURN: 'Не ваш ход',
  WORD_NOT_IN_DICTIONARY: 'Слово отсутствует в словаре',
  WORD_ALREADY_USED: 'Слово уже использовалось в этой игре',
  NO_VALID_PATH: 'Нет допустимого пути для заявленного слова',
  LETTER_NOT_IN_WORD: 'Размещенная буква должна быть частью заявленного слова',
  GAME_NOT_FOUND: 'Игра не найдена',
  PLAYER_NAME_TAKEN: (name: string) => `Имя игрока "${name}" уже занято`,
  PLAYER_NOT_FOUND: (name: string) => `Игрок "${name}" не найден`,
} as const

/**
 * Loading state messages
 */
export const LOADING_MESSAGES = {
  DEFAULT: 'Загрузка',
  CONNECTING: 'Подключение',
  PROCESSING: 'Обработка',
} as const

/**
 * Success messages
 */
export const SUCCESS_MESSAGES = {
  MOVE_ACCEPTED: (word: string, score: number) => `Слово ${word} принято, ${score} очков`,
  GAME_CREATED: 'Игра создана',
  PLAYER_JOINED: 'Игрок присоединился',
} as const

/**
 * Maps English backend error messages to Russian translations
 * Used for runtime translation of API error responses
 */
export const ERROR_MESSAGE_MAP: Record<string, string> = {
  'Player ID is required': ERROR_MESSAGES.PLAYER_ID_REQUIRED,
  'Letter is required': ERROR_MESSAGES.LETTER_REQUIRED,
  'Letter must be exactly one character': ERROR_MESSAGES.LETTER_SINGLE_CHARACTER,
  'Word is required': ERROR_MESSAGES.WORD_REQUIRED,
  'Position is outside of board': ERROR_MESSAGES.POSITION_OUT_OF_BOUNDS,
  'Cell is already occupied': ERROR_MESSAGES.CELL_OCCUPIED,
  'Placement must be adjacent to existing letters': ERROR_MESSAGES.NOT_ADJACENT,
  'Not current player\'s turn': ERROR_MESSAGES.NOT_YOUR_TURN,
  'Word is not present in dictionary': ERROR_MESSAGES.WORD_NOT_IN_DICTIONARY,
  'Word already used in this game': ERROR_MESSAGES.WORD_ALREADY_USED,
  'No valid path for the claimed word': ERROR_MESSAGES.NO_VALID_PATH,
  'Placed letter must be part of the claimed word': ERROR_MESSAGES.LETTER_NOT_IN_WORD,
} as const

/**
 * Translates an English error message to Russian
 * Falls back to original message if no translation found
 *
 * @param message - Error message (possibly in English)
 * @returns Translated message in Russian
 */
export function translateErrorMessage(message: string): string {
  // Check direct mapping
  if (message in ERROR_MESSAGE_MAP) {
    // Message key checked to exist in map above
    return ERROR_MESSAGE_MAP[message]!
  }

  // Check for dynamic messages (e.g., "Player name \"X\" is already taken")
  const playerNameTakenMatch = message.match(/Player name "(.+)" is already taken/)
  if (playerNameTakenMatch && playerNameTakenMatch[1]) {
    // Regex capture group guaranteed to exist by match condition
    return ERROR_MESSAGES.PLAYER_NAME_TAKEN(playerNameTakenMatch[1])
  }

  const playerNotFoundMatch = message.match(/Player "(.+)" not found/)
  if (playerNotFoundMatch && playerNotFoundMatch[1]) {
    // Regex capture group guaranteed to exist by match condition
    return ERROR_MESSAGES.PLAYER_NOT_FOUND(playerNotFoundMatch[1])
  }

  // Return original if no translation found
  return message
}
