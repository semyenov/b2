/**
 * Russian Localization (ru)
 * Complete Russian translation for the Balda game
 *
 * Organized by domain:
 * - errors: Error messages
 * - loading: Loading state messages
 * - success: Success notifications
 * - a11y: Accessibility labels (screen readers)
 * - status: Game status labels
 * - ui: General UI text
 */

/**
 * Error messages for user-facing notifications
 */
export const errors = {
  // Connection errors
  SERVER_CONNECTION_FAILED: 'Не удалось подключиться к серверу',
  CONNECTION_LOST: 'Соединение потеряно',
  GENERIC_ERROR: 'Произошла ошибка',

  // AI player errors
  AI_NO_MOVES: 'У AI нет доступных ходов',
  AI_MOVE_FAILED: 'Ошибка AI хода',

  // Form validation errors
  BASE_WORD_LENGTH: (size: number, pluralForm: string) =>
    `Базовое слово должно содержать ровно ${size} ${pluralForm}`,
  ONLY_RUSSIAN_LETTERS: 'Используйте только русские буквы',

  // Backend validation errors (translated from English API responses)
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
export const loading = {
  DEFAULT: 'Загрузка',
  CONNECTING: 'Подключение',
  PROCESSING: 'Обработка',
  CREATING_GAME: 'Создание игры',
  JOINING_GAME: 'Подключение к игре',
  LOADING_SUGGESTIONS: 'Загрузка подсказок',
  LOADING_GAMES: 'Загрузка списка игр',
} as const

/**
 * Success messages
 */
export const success = {
  MOVE_ACCEPTED: (word: string, score: number) => `Слово ${word} принято, ${score} очков`,
  GAME_CREATED: 'Игра создана',
  PLAYER_JOINED: 'Игрок присоединился',
  MOVE_SUBMITTED: 'Ход отправлен',
  WORD_VALIDATED: 'Слово проверено',
} as const

/**
 * Accessibility labels for screen readers
 */
export const a11y = {
  // Board cell labels
  BOARD_CELL_EMPTY: (coord: string) => `Пустая клетка ${coord}`,
  BOARD_CELL_FILLED: (coord: string, letter: string) => `Клетка ${coord}, буква ${letter}`,
  BOARD_CELL_SELECTED: (coord: string, letter: string) => `Выбрана клетка ${coord} для буквы ${letter}`,
  BOARD_CELL_IN_PATH: (coord: string, letter: string, position: number) =>
    `Клетка ${coord}, буква ${letter}, позиция ${position} в слове`,

  // Alphabet panel labels
  LETTER_BUTTON: (letter: string) => `Выбрать букву ${letter}`,
  LETTER_BUTTON_SELECTED: (letter: string) => `Буква ${letter} выбрана`,

  // Turn announcements
  TURN_ANNOUNCEMENT: (playerName: string) => `Ход игрока ${playerName}`,
  YOUR_TURN: 'Ваш ход',
  WAITING_FOR_OPPONENT: (playerName: string) => `Ожидание хода игрока ${playerName}`,

  // Move feedback
  MOVE_SUCCESS: (word: string, score: number) => `Слово ${word} принято, ${score} очков`,
  MOVE_ERROR: (error: string) => `Ошибка: ${error}`,

  // Suggestion labels
  SUGGESTION_CARD: (rank: number, word: string, letter: string, position: string, score: number) =>
    `Подсказка ${rank}: ${word}, буква ${letter} на позиции ${position}, ${score} очков`,
} as const

/**
 * Game status labels
 */
export const status = {
  WAITING: 'Ожидание',
  IN_PROGRESS: 'В процессе',
  FINISHED: 'Завершена',
  YOUR_TURN: 'Ваш ход',
  OPPONENT_TURN: 'Ход противника',
} as const

/**
 * General UI text
 */
export const ui = {
  // Buttons
  SUBMIT_MOVE: 'Сделать ход',
  CLEAR_SELECTION: 'Очистить',
  CANCEL: 'Отмена',
  CONFIRM: 'Подтвердить',
  BACK: 'Назад',
  NEXT: 'Далее',
  CREATE_GAME: 'Создать игру',
  JOIN_GAME: 'Присоединиться',
  LEAVE_GAME: 'Выйти из игры',
  NEW_GAME: 'Новая игра',
  REMATCH: 'Реванш',

  // Form labels
  GAME_SIZE: 'Размер доски',
  BASE_WORD: 'Базовое слово',
  PLAYER_NAME: 'Имя игрока',
  GAME_ID: 'ID игры',

  // Placeholders
  ENTER_PLAYER_NAME: 'Введите имя',
  ENTER_BASE_WORD: 'Введите слово',
  ENTER_GAME_ID: 'Введите ID игры',

  // Game info
  PLAYERS: 'Игроки',
  SCORE: 'Счёт',
  MOVES: 'Ходы',
  CURRENT_PLAYER: 'Текущий игрок',
  WINNER: 'Победитель',
  DRAW: 'Ничья',

  // Suggestions panel
  SUGGESTIONS_TITLE: 'Подсказки AI',
  NO_SUGGESTIONS: 'Нет доступных подсказок',
  LOADING_SUGGESTIONS: 'Загрузка подсказок...',

  // Instructions
  SELECT_CELL: 'Выберите пустую клетку',
  SELECT_LETTER: 'Выберите букву',
  BUILD_WORD: 'Составьте слово',
  SUBMIT_WORD: 'Отправьте слово',

  // Time formats
  TIME_JUST_NOW: 'только что',
  TIME_MINUTES_AGO: (n: number) => `${n} мин назад`,
  TIME_HOURS_AGO: (n: number) => `${n} ч назад`,
  TIME_DAYS_AGO: (n: number) => `${n} дн назад`,

  // Plural forms helpers (Russian has 3 forms)
  LETTERS: (n: number) => {
    if (n % 10 === 1 && n % 100 !== 11) {
      return 'букву'
    }
    if ([2, 3, 4].includes(n % 10) && ![12, 13, 14].includes(n % 100)) {
      return 'буквы'
    }
    return 'букв'
  },

  POINTS: (n: number) => {
    if (n % 10 === 1 && n % 100 !== 11) {
      return 'очко'
    }
    if ([2, 3, 4].includes(n % 10) && ![12, 13, 14].includes(n % 100)) {
      return 'очка'
    }
    return 'очков'
  },
} as const

/**
 * Complete Russian localization
 */
export const ru = {
  errors,
  loading,
  success,
  a11y,
  status,
  ui,
} as const

/**
 * Type exports for type-safe message access
 */
export type Locale = typeof ru
