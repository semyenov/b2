import { flat, list, objectify, sift, unique } from 'radash'
import { ORTHOGONAL_DIRS } from '../constants'

export type Letter = string | null

export interface BoardPosition {
  row: number
  col: number
}

export interface MoveInput {
  playerId: string
  position: BoardPosition
  letter: string
  word: string
}

export interface AppliedMove extends MoveInput {
  appliedAt: number
}

export interface GameState {
  id: string
  size: number
  board: Letter[][]
  players: string[]
  currentPlayerIndex: number
  moves: AppliedMove[]
  createdAt: number
  scores: Record<string, number>
  usedWords: string[]
}

export interface Dictionary {
  has: (word: string) => boolean
  hasPrefix?: (prefix: string) => boolean
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
  const centerRow = Math.floor(size / 2)
  const startCol = Math.floor((size - word.length) / 2)
  for (let i = 0; i < word.length; i++) {
    board[centerRow][startCol + i] = word[i]
  }
}

export function normalizeLetter(letter: string): string {
  if (!letter || letter.length === 0)
    return letter
  return letter[0]!.toUpperCase()
}

export function normalizeWord(word: string): string {
  return (word ?? '').trim().toUpperCase()
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
  const size = board.length
  const target = normalizeWord(word)
  if (!target.length)
    return false

  // Pre-collect all starting cells for first letter
  const first = target[0]!
  const starts = sift(
    flat(
      list(0, size - 1, r =>
        list(0, size - 1, c =>
          board[r][c] === first ? { row: r, col: c } : null)),
    ),
  )
  if (starts.length === 0)
    return false

  const mustKey = `${mustInclude.row},${mustInclude.col}`

  const visited = new Set<string>()

  const dfs = (pos: BoardPosition, index: number): boolean => {
    const key = `${pos.row},${pos.col}`
    if (visited.has(key))
      return false
    const cell = board[pos.row][pos.col]
    if (cell !== target[index])
      return false
    visited.add(key)
    try {
      if (index === target.length - 1) {
        // Completed word; ensure path used includes mustInclude
        return visited.has(mustKey)
      }
      let found = false
      forEachNeighbor(size, pos, (n) => {
        if (found)
          return
        if (board[n.row][n.col] == null)
          return
        if (board[n.row][n.col] !== target[index + 1])
          return
        if (dfs(n, index + 1))
          found = true
      })
      return found
    }
    finally {
      visited.delete(key)
    }
  }

  for (const start of starts) {
    if (dfs(start, 0))
      return true
  }
  return false
}

export function applyMove(
  game: GameState,
  move: MoveInput,
  dictionary: Dictionary,
): { ok: true, game: GameState } | { ok: false, message: string } {
  const size = game.size
  const { position } = move
  const letter = normalizeLetter(move.letter)
  const word = normalizeWord(move.word)

  // Turn validation
  const currentPlayerId = game.players[game.currentPlayerIndex]
  if (move.playerId !== currentPlayerId) {
    return { ok: false, message: 'Not current player\'s turn' }
  }

  if (!dictionary.has(word)) {
    return { ok: false, message: 'Word is not present in dictionary' }
  }
  if (!isInside(size, position)) {
    return { ok: false, message: 'Position is outside of board' }
  }
  if (game.board[position.row][position.col] !== null) {
    return { ok: false, message: 'Cell is already occupied' }
  }
  if (!letter || letter.length !== 1) {
    return { ok: false, message: 'Letter must be a single character' }
  }

  // Placement must be adjacent to at least one occupied cell
  if (!isAdjacentToExisting(game.board, position)) {
    return { ok: false, message: 'Placement must be adjacent to existing letters' }
  }

  // Uniqueness check
  if (game.usedWords.includes(word)) {
    return { ok: false, message: 'Word already used in this game' }
  }

  // Tentatively place the letter and validate the path
  game.board[position.row][position.col] = letter
  const valid = existsPathForWord(game.board, word, position)
  if (!valid) {
    // revert tentative placement
    game.board[position.row][position.col] = null
    return { ok: false, message: 'No valid path for the claimed word' }
  }

  // Record move
  game.moves.push({ ...move, letter, word, appliedAt: Date.now() })
  // Scoring: 1 point per letter
  game.scores[move.playerId] = (game.scores[move.playerId] ?? 0) + word.length
  // Record used word
  game.usedWords.push(word)
  // rotate turn
  game.currentPlayerIndex = (game.currentPlayerIndex + 1) % game.players.length
  return { ok: true, game }
}

export function createGame(
  id: string,
  size: number,
  baseWord: string,
  players: string[] = ['A', 'B'],
): GameState {
  if (size < 3 || size % 2 === 0) {
    throw new Error('Board size must be an odd number >= 3')
  }
  const board = createEmptyBoard(size)
  placeBaseWord(board, baseWord)
  const normalizedPlayers = players.length ? players : ['A', 'B']
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
    currentPlayerIndex: 0,
    moves: [],
    createdAt: Date.now(),
    scores,
    usedWords: [],
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
        board[r][c] = letter
        const ok = existsPathForWord(board, word, pos)
        board[r][c] = null
        if (ok)
          results.push({ position: pos, letter })
      }
    }
  }
  return results
}
