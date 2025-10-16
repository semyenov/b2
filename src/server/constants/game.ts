import type { BoardPosition } from '../engine/balda'

/**
 * Orthogonal directions for board navigation (up, down, left, right)
 */
export const ORTHOGONAL_DIRS: Readonly<readonly BoardPosition[]> = Object.freeze([
  { row: -1, col: 0 }, // up
  { row: 1, col: 0 }, // down
  { row: 0, col: -1 }, // left
  { row: 0, col: 1 }, // right
])

/**
 * Default alphabet for dictionary (Latin + Cyrillic)
 */
export const DEFAULT_ALPHABET = 'ABCDEFGHIJKLMNOPQRSTUVWXYZАБВГДЕЁЖЗИЙКЛМНОПРСТУФХЦЧШЩЪЫЬЭЮЯ'

/**
 * Maximum word length for word enumeration in suggestions
 */
export const MAX_WORD_LENGTH = 8

/**
 * Default and maximum suggestion limits
 */
export const DEFAULT_SUGGESTION_LIMIT = 20
export const MAX_SUGGESTION_LIMIT = 200
