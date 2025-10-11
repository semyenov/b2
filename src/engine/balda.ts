import { list, objectify, unique } from 'radash'
import { ORTHOGONAL_DIRS } from '../constants'

/**
 * Generate a stable cache key for board state and word parameters
 */
function generateCacheKey(board: Letter[][], word: string, mustInclude: BoardPosition): string {
  // Create a hash of the board state by flattening and joining
  // Use '-' for null to avoid collision with empty string letters
  const boardHash = board.map(row => row.map(cell => cell === null ? '-' : cell).join(',')).join('|')
  return `${boardHash}:${word}:${mustInclude.row},${mustInclude.col}`
}

/**
 * Simple memoization utility for expensive function calls with proper LRU eviction
 */
function memoize(
  fn: (board: Letter[][], word: string, mustInclude: BoardPosition) => boolean,
  keyGenerator: (board: Letter[][], word: string, mustInclude: BoardPosition) => string,
  maxSize = 1000,
): (board: Letter[][], word: string, mustInclude: BoardPosition) => boolean {
  const cache = new Map<string, boolean>()
  const accessOrder = new Map<string, number>()
  let accessCounter = 0

  return (board: Letter[][], word: string, mustInclude: BoardPosition): boolean => {
    const key = keyGenerator(board, word, mustInclude)

    if (cache.has(key)) {
      // Update access order for LRU
      accessOrder.set(key, ++accessCounter)
      const cachedValue = cache.get(key)
      if (cachedValue !== undefined) {
        return cachedValue
      }
    }

    const result = fn(board, word, mustInclude)

    if (cache.size >= maxSize) {
      // Find least recently used entry
      let oldestKey = ''
      let oldestAccess = Infinity
      for (const [k, access] of accessOrder) {
        if (access < oldestAccess) {
          oldestAccess = access
          oldestKey = k
        }
      }
      // Remove least recently used entry
      if (oldestKey) {
        cache.delete(oldestKey)
        accessOrder.delete(oldestKey)
      }
    }

    cache.set(key, result)
    accessOrder.set(key, ++accessCounter)
    return result
  }
}

/**
 * Create a memoized version of existsPathForWord for repeated calls
 */
const memoizedExistsPathForWord = memoize(
  (board: Letter[][], word: string, mustInclude: BoardPosition): boolean => {
    // Implementation moved from the original function
    const size = board.length
    const target = normalizeWord(word)
    if (!target.length)
      return false

    const first = target[0]
    if (!first)
      return false
    const starts: BoardPosition[] = []
    for (let r = 0; r < size; r++) {
      for (let c = 0; c < size; c++) {
        if (board[r][c] === first) {
          starts.push({ row: r, col: c })
        }
      }
    }
    if (starts.length === 0)
      return false

    const mustKey = `${mustInclude.row},${mustInclude.col}`

    for (const start of starts) {
      const stack: Array<{ pos: BoardPosition, index: number, path: Set<string> }> = [
        { pos: start, index: 0, path: new Set([`${start.row},${start.col}`]) },
      ]

      while (stack.length > 0) {
        const { pos, index, path } = stack.pop()!
        const _key = `${pos.row},${pos.col}`

        if (index === target.length - 1) {
          if (path.has(mustKey)) {
            return true
          }
          continue
        }

        for (const d of ORTHOGONAL_DIRS) {
          const nextPos = { row: pos.row + d.row, col: pos.col + d.col }
          if (!isInside(size, nextPos))
            continue

          const nextKey = `${nextPos.row},${nextPos.col}`
          if (path.has(nextKey))
            continue

          const nextCell = board[nextPos.row][nextPos.col]
          if (nextCell !== target[index + 1])
            continue

          const newPath = new Set(path)
          newPath.add(nextKey)
          stack.push({ pos: nextPos, index: index + 1, path: newPath })
        }
      }
    }
    return false
  },
  generateCacheKey,
  500, // Limit cache size to prevent memory issues
)

export type Letter = string | null

export interface BoardPosition {
  readonly row: number
  readonly col: number
}

export interface MoveInput {
  readonly playerId: string
  readonly position: BoardPosition
  readonly letter: string
  readonly word: string
}

export interface AppliedMove extends MoveInput {
  readonly appliedAt: number
}

export interface GameState {
  readonly id: string
  readonly size: number
  readonly board: Letter[][]
  readonly players: string[]
  readonly aiPlayers: string[]
  readonly currentPlayerIndex: number
  readonly moves: AppliedMove[]
  readonly createdAt: number
  readonly scores: Record<string, number>
  readonly usedWords: string[]
}

export interface Dictionary {
  readonly has: (word: string) => boolean
  readonly hasPrefix?: (prefix: string) => boolean
}

/**
 * Game configuration for creating new games
 */
export interface GameConfig {
  readonly size: number
  readonly baseWord: string
  readonly players?: string[]
  readonly aiPlayers?: string[]
}

/**
 * Result of applying a move to a game
 */
export type MoveResult
  = | { readonly ok: true, readonly game: GameState }
    | { readonly ok: false, readonly message: string }

/**
 * Valid directions for board navigation
 */
export type Direction = 'up' | 'down' | 'left' | 'right'

/**
 * Position validation result
 */
export interface PositionValidation {
  readonly isValid: boolean
  readonly reason?: string
}

/**
 * Validate if a move input is well-formed
 */
function _validateMoveInput(move: MoveInput, size: number): { ok: true } | { ok: false, message: string } {
  if (!move.playerId?.trim()) {
    return { ok: false, message: 'Player ID is required' }
  }
  if (!move.letter?.trim()) {
    return { ok: false, message: 'Letter is required' }
  }
  if (move.letter.length !== 1) {
    return { ok: false, message: 'Letter must be exactly one character' }
  }
  if (!move.word?.trim()) {
    return { ok: false, message: 'Word is required' }
  }
  if (!isInside(size, move.position)) {
    return { ok: false, message: 'Position is outside of board' }
  }
  return { ok: true }
}

/**
 * Validate if a position can be used for placement
 */
function validatePlacement(game: GameState, position: BoardPosition): { ok: true } | { ok: false, message: string } {
  if (game.board[position.row][position.col] !== null) {
    return { ok: false, message: 'Cell is already occupied' }
  }
  if (!isAdjacentToExisting(game.board, position)) {
    return { ok: false, message: 'Placement must be adjacent to existing letters' }
  }
  return { ok: true }
}

/**
 * Create a new board state with a letter placed at the given position
 */
function createBoardWithPlacement(board: Letter[][], position: BoardPosition, letter: string): Letter[][] {
  return board.map(row => [...row])
    .map((row, r) =>
      r === position.row
        ? row.map((cell, c) => c === position.col ? letter : cell)
        : row,
    )
}

export class AllowAllDictionary implements Dictionary {
  has(word: string): boolean {
    return Boolean(word?.length)
  }
}

export function createEmptyBoard(size: number): Letter[][] {
  return list(0, size - 1, () => list(0, size - 1, () => null))
}

export function isInside(size: number, { row, col }: BoardPosition): boolean {
  return row >= 0 && row < size && col >= 0 && col < size
}

export function canPlace(board: Letter[][], pos: BoardPosition): boolean {
  return isInside(board.length, pos) && board[pos.row][pos.col] === null
}

export function placeBaseWord(board: Letter[][], baseWord: string): void {
  const size = board.length
  const word = normalizeWord(baseWord)
  if (word.length > size)
    throw new Error('Base word length must fit the board size')

  // Center the word both horizontally and vertically
  const centerRow = Math.floor(size / 2)
  const startCol = Math.floor((size - word.length) / 2)

  for (let i = 0; i < word.length; i++) {
    board[centerRow][startCol + i] = word[i]
  }
}

export function normalizeLetter(letter: string): string {
  if (!letter || letter.length === 0)
    return letter
  const firstChar = letter[0]
  if (!firstChar)
    return letter
  return firstChar.toUpperCase()
}

export function normalizeWord(word: string): string {
  return (word ?? '').trim().toUpperCase()
}

/**
 * Letter rarity scores for Russian language (based on frequency analysis)
 * Rare letters get higher scores
 */
const LETTER_SCORES: Record<string, number> = {
  // Common letters (lower scores)
  А: 1,
  Е: 1,
  И: 1,
  Н: 1,
  О: 1,
  Р: 1,
  С: 1,
  Т: 1,
  // Medium frequency
  В: 2,
  Д: 2,
  К: 2,
  Л: 2,
  М: 2,
  П: 2,
  У: 2,
  Я: 2,
  // Less common
  Б: 3,
  Г: 3,
  Ж: 3,
  З: 3,
  Й: 3,
  Х: 3,
  Ц: 3,
  Ч: 3,
  // Rare letters (higher scores)
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
}

/**
 * Calculate word score based on letter rarity
 */
export function calculateWordScore(word: string): number {
  const normalized = normalizeWord(word)
  let score = 0
  for (const letter of normalized) {
    score += LETTER_SCORES[letter] ?? 1 // Default score for unknown letters
  }
  return score
}

/**
 * Iterate over orthogonally adjacent neighbors of a position
 */
export function forEachNeighbor(
  size: number,
  pos: BoardPosition,
  cb: (n: BoardPosition) => void,
): void {
  for (const d of ORTHOGONAL_DIRS) {
    const n = { row: pos.row + d.row, col: pos.col + d.col }
    if (isInside(size, n))
      cb(n)
  }
}

export function isAdjacentToExisting(board: Letter[][], pos: BoardPosition): boolean {
  let adjacent = false
  forEachNeighbor(board.length, pos, (n) => {
    if (board[n.row][n.col] !== null)
      adjacent = true
  })
  return adjacent
}

export function existsPathForWord(
  board: Letter[][],
  word: string,
  mustInclude: BoardPosition,
): boolean {
  // Use memoization for repeated calls with same parameters (useful for suggestion engine)
  // Note: Board state changes frequently, so we don't cache based on board content
  return memoizedExistsPathForWord(board, word, mustInclude)
}

export function applyMove(
  game: GameState,
  move: MoveInput,
  dictionary: Dictionary,
): MoveResult {
  const { position } = move
  const letter = normalizeLetter(move.letter)
  const word = normalizeWord(move.word)

  // Turn validation - check if player ID matches current player
  const currentPlayerId = game.players[game.currentPlayerIndex]
  if (move.playerId !== currentPlayerId) {
    return { ok: false, message: 'Not current player\'s turn' }
  }

  if (!dictionary.has(word)) {
    return { ok: false, message: 'Word is not present in dictionary' }
  }
  // Validate input format and placement
  const placementValidation = validatePlacement(game, position)
  if (!placementValidation.ok) {
    return placementValidation
  }

  // Uniqueness check
  if (game.usedWords.includes(word)) {
    return { ok: false, message: 'Word already used in this game' }
  }

  // Create board with tentative placement and validate path
  const boardWithPlacement = createBoardWithPlacement(game.board, position, letter)

  // Validate the path with the tentative placement
  const valid = existsPathForWord(boardWithPlacement, word, position)
  if (!valid) {
    return { ok: false, message: 'No valid path for the claimed word' }
  }

  // Verify that the placed letter is actually used in the word
  if (!word.includes(letter)) {
    return { ok: false, message: 'Placed letter must be part of the claimed word' }
  }

  // Create new game state with all updates (immutable)
  const updatedGame: GameState = {
    ...game,
    board: boardWithPlacement,
    moves: [
      ...game.moves,
      { ...move, letter, word, appliedAt: Date.now() },
    ],
    scores: {
      ...game.scores,
      [move.playerId]: (game.scores[move.playerId] ?? 0) + calculateWordScore(word),
    },
    usedWords: [...game.usedWords, word],
    currentPlayerIndex: (game.currentPlayerIndex + 1) % game.players.length,
  }

  return { ok: true, game: updatedGame }
}

export function createGame(
  id: string,
  config: GameConfig,
): GameState {
  const { size, baseWord, players = ['A', 'B'], aiPlayers = [] } = config
  if (size < 3) {
    throw new Error('Board size must be at least 3')
  }
  const board = createEmptyBoard(size)
  placeBaseWord(board, baseWord)
  // Use provided players or default to ['A', 'B']
  const normalizedPlayers = [...players]
  const scores = objectify(
    normalizedPlayers,
    p => p,
    () => 0,
  )
  return {
    id,
    size,
    board,
    players: normalizedPlayers,
    aiPlayers: [...aiPlayers],
    currentPlayerIndex: 0,
    moves: [],
    createdAt: Date.now(),
    scores,
    usedWords: [normalizeWord(baseWord)],
  }
}

export function findPlacementsForWord(
  board: Letter[][],
  rawWord: string,
): Array<{ position: BoardPosition, letter: string }> {
  const word = normalizeWord(rawWord)
  if (!word)
    return []

  const size = board.length
  const results: Array<{ position: BoardPosition, letter: string }> = []
  const candidateLetters = unique(word.split(''))

  for (let r = 0; r < size; r++) {
    for (let c = 0; c < size; c++) {
      if (board[r][c] !== null)
        continue
      const pos = { row: r, col: c }
      if (!isAdjacentToExisting(board, pos))
        continue
      for (const letter of candidateLetters) {
        // Create a copy of the board with the tentative placement
        const boardCopy = board.map(row => [...row])
        boardCopy[r][c] = letter
        const ok = existsPathForWord(boardCopy, word, pos)
        if (ok)
          results.push({ position: pos, letter })
      }
    }
  }
  return results
}
