import type {
  AppliedMove,
  Board,
  Dictionary,
  Direction,
  GameConfig,
  GameState,
  Letter,
  MoveInput,
  MoveResult,
  Position,
  PositionValidation,
} from '../../shared/types'
import { list, objectify, unique } from 'radash'
import { DEFAULT_LETTER_SCORE, LETTER_SCORES, ORTHOGONAL_DIRS } from '../../shared/config'

// Re-export types for backward compatibility
export type {
  AppliedMove,
  Dictionary,
  Direction,
  GameConfig,
  GameState,
  Letter,
  MoveInput,
  MoveResult,
  PositionValidation,
}
export type { Position as BoardPosition }

/**
 * Generate a stable cache key for board state and word parameters
 */
function generateCacheKey(board: Board, word: string, mustInclude: Position): string {
  // Create a hash of the board state by flattening and joining
  // Use '-' for null to avoid collision with empty string letters
  const boardHash = board.map(row => row.map(cell => cell === null ? '-' : cell).join(',')).join('|')
  return `${boardHash}:${word}:${mustInclude.row},${mustInclude.col}`
}

/**
 * Simple memoization utility for expensive function calls with proper LRU eviction
 */
function memoize(
  fn: (board: Board, word: string, mustInclude: Position) => boolean,
  keyGenerator: (board: Board, word: string, mustInclude: Position) => string,
  maxSize = 1000,
): (board: Board, word: string, mustInclude: Position) => boolean {
  const cache = new Map<string, boolean>()
  const accessOrder = new Map<string, number>()
  let accessCounter = 0

  return (board: Board, word: string, mustInclude: Position): boolean => {
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
  (board: Board, word: string, mustInclude: Position): boolean => {
    // Implementation moved from the original function
    const size = board.length
    const target = normalizeWord(word)
    if (!target.length)
      return false

    const first = target[0]
    if (!first)
      return false
    const starts: Position[] = []
    for (let r = 0; r < size; r++) {
      for (let c = 0; c < size; c++) {
        // Non-null assertion: loop bounds guarantee valid array access
        if (board[r]![c] === first) {
          starts.push({ row: r, col: c })
        }
      }
    }
    if (starts.length === 0)
      return false

    const mustKey = `${mustInclude.row},${mustInclude.col}`

    for (const start of starts) {
      const stack: Array<{ pos: Position, index: number, path: Set<string> }> = [
        { pos: start, index: 0, path: new Set([`${start.row},${start.col}`]) },
      ]

      while (stack.length > 0) {
        const { pos, index, path } = stack.pop()!

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

          // Non-null assertion: isInside() check guarantees valid access
          const nextCell = board[nextPos.row]![nextPos.col]
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

/**
 * Validate if a position can be used for placement
 */
function validatePlacement(game: GameState, position: Position): { ok: true } | { ok: false, message: string } {
  // Non-null assertion: position is validated by caller
  if (game.board[position.row]![position.col] !== null) {
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
function createBoardWithPlacement(board: Board, position: Position, letter: string): Board {
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

export function createEmptyBoard(size: number): Board {
  return list(0, size - 1, () => list(0, size - 1, () => null))
}

export function isInside(size: number, { row, col }: Position): boolean {
  return row >= 0 && row < size && col >= 0 && col < size
}

export function canPlace(board: Board, pos: Position): boolean {
  // Non-null assertion: isInside() check guarantees valid access
  return isInside(board.length, pos) && board[pos.row]![pos.col] === null
}

export function placeBaseWord(board: Board, baseWord: string): void {
  const size = board.length
  const word = normalizeWord(baseWord)
  if (word.length > size)
    throw new Error('Base word length must fit the board size')

  // Center the word both horizontally and vertically
  const centerRow = Math.floor(size / 2)
  const startCol = Math.floor((size - word.length) / 2)

  for (let i = 0; i < word.length; i++) {
    // Non-null assertions: centerRow and startCol+i are within bounds by construction
    // word[i] is within bounds by loop condition
    board[centerRow]![startCol + i] = word[i]!
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
 * Calculate word score based on letter rarity
 * Uses shared scoring system from ../../shared/constants/scoring
 */
export function calculateWordScore(word: string): number {
  const normalized = normalizeWord(word)
  let score = 0
  for (const letter of normalized) {
    score += LETTER_SCORES[letter] ?? DEFAULT_LETTER_SCORE // Default score for unknown letters
  }
  return score
}

/**
 * Iterate over orthogonally adjacent neighbors of a position
 */
export function forEachNeighbor(
  size: number,
  pos: Position,
  cb: (n: Position) => void,
): void {
  for (const d of ORTHOGONAL_DIRS) {
    const n = { row: pos.row + d.row, col: pos.col + d.col }
    if (isInside(size, n))
      cb(n)
  }
}

export function isAdjacentToExisting(board: Board, pos: Position): boolean {
  let adjacent = false
  forEachNeighbor(board.length, pos, (n) => {
    // Non-null assertion: forEachNeighbor only calls with valid positions
    if (board[n.row]![n.col] !== null)
      adjacent = true
  })
  return adjacent
}

export function existsPathForWord(
  board: Board,
  word: string,
  mustInclude: Position,
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

  // Validate base word length matches board size
  const normalizedBaseWord = normalizeWord(baseWord)
  if (normalizedBaseWord.length !== size) {
    throw new Error(`Base word length (${normalizedBaseWord.length}) must match board size (${size})`)
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
    baseWord: normalizeWord(baseWord),
    board,
    players: normalizedPlayers,
    aiPlayers: [...aiPlayers],
    currentPlayerIndex: 0,
    moves: [],
    createdAt: Date.now(),
    scores,
    usedWords: [normalizeWord(baseWord)],
    version: 1, // Initial version for optimistic locking
  }
}

export function findPlacementsForWord(
  board: Board,
  rawWord: string,
): Array<{ position: Position, letter: string }> {
  const word = normalizeWord(rawWord)
  if (!word)
    return []

  const size = board.length
  const results: Array<{ position: Position, letter: string }> = []
  const candidateLetters = unique(word.split(''))

  for (let r = 0; r < size; r++) {
    for (let c = 0; c < size; c++) {
      // Non-null assertion: loop bounds guarantee valid access
      if (board[r]![c] !== null)
        continue
      const pos = { row: r, col: c }
      if (!isAdjacentToExisting(board, pos))
        continue
      for (const letter of candidateLetters) {
        // Create a copy of the board with the tentative placement
        const boardCopy = board.map(row => [...row])
        boardCopy[r]![c] = letter
        const ok = existsPathForWord(boardCopy, word, pos)
        if (ok)
          results.push({ position: pos, letter })
      }
    }
  }
  return results
}
