/**
 * Core Game Domain Types
 * Shared between client and server
 *
 * This file defines the fundamental data structures for the Balda word game.
 * All types are readonly to enforce immutability and prevent accidental mutations.
 *
 * Key Types:
 * - Position: Board coordinates
 * - Board: 2D grid of letters
 * - GameState: Complete game state snapshot
 * - GameConfig: Configuration for creating new games
 */

/**
 * Position on the game board
 * Unifies BoardPosition (server) and Position (web)
 *
 * @property row - Zero-indexed row number
 * @property col - Zero-indexed column number
 */
export interface Position {
  readonly row: number
  readonly col: number
}

/**
 * Letter type - either a single uppercase character or null (empty cell)
 */
export type Letter = string | null

/**
 * Game board representation
 * 2D array of letters, indexed as board[row][col]
 *
 * @example
 * ```typescript
 * const board: Board = [
 *   [null, null, 'К', null, null],
 *   [null, null, 'О', null, null],
 *   ['Б', 'А', 'Л', 'Д', 'А'],
 *   [null, null, 'Ш', null, null],
 *   [null, null, 'К', null, null],
 * ]
 * ```
 */
export type Board = Letter[][]

/**
 * Complete game state snapshot
 * Represents all data needed to reconstruct the current game situation
 *
 * This is the core domain model shared between:
 * - Server game engine
 * - WebSocket updates
 * - Client state management
 * - Database persistence (via serialization)
 */
export interface GameState {
  /** Unique game identifier (UUID or nanoid) */
  readonly id: string

  /** Board size (e.g., 5 for a 5x5 board) */
  readonly size: number

  /** Base word placed at game start (horizontally centered) */
  readonly baseWord: string

  /** Current board state with all placed letters */
  readonly board: Board

  /** Ordered list of player names */
  readonly players: string[]

  /** List of AI player names (subset of players) */
  readonly aiPlayers: string[]

  /** Index of current player in players array */
  readonly currentPlayerIndex: number

  /** Complete move history (chronologically ordered) */
  readonly moves: AppliedMove[]

  /** Unix timestamp (milliseconds) when game was created */
  readonly createdAt: number

  /** Current scores by player name */
  readonly scores: Record<string, number>

  /** Set of words already used in this game */
  readonly usedWords: string[]

  /** Version number for optimistic locking */
  readonly version: number
}

/**
 * Applied move (part of game history)
 * Extends MoveInput with timestamp
 */
export interface AppliedMove {
  /** Player who made this move */
  readonly playerId: string

  /** Position where letter was placed */
  readonly position: Position

  /** Letter that was placed (uppercase) */
  readonly letter: string

  /** Word that was formed */
  readonly word: string

  /** Unix timestamp (milliseconds) when move was applied */
  readonly appliedAt: number
}

/**
 * Game configuration for creating new games
 * Minimum required data to initialize a game
 */
export interface GameConfig {
  /** Board size (must match BOARD_CONFIG.SIZES) */
  readonly size: number

  /** Base word (length must equal size) */
  readonly baseWord: string

  /** Optional player names (defaults to ['A', 'B']) */
  readonly players?: string[]

  /** Optional AI player names (must be subset of players) */
  readonly aiPlayers?: string[]
}

/**
 * Direction enum for board navigation
 * Used primarily for path-finding and adjacency checks
 */
export type Direction = 'up' | 'down' | 'left' | 'right'

/**
 * Position validation result
 * Used to provide detailed feedback on why a position is invalid
 */
export interface PositionValidation {
  /** Whether the position is valid */
  readonly isValid: boolean

  /** Optional reason for invalidity (for user feedback) */
  readonly reason?: string
}

/**
 * Game status derived from state
 * Not stored in GameState, computed from current state
 */
export type GameStatus = 'waiting' | 'in_progress' | 'finished'

/**
 * Type guard to check if a value is a valid Position
 * @param value - Value to check
 * @returns True if value is a Position
 */
export function isPosition(value: unknown): value is Position {
  return (
    typeof value === 'object'
    && value !== null
    && 'row' in value
    && 'col' in value
    && typeof (value as Position).row === 'number'
    && typeof (value as Position).col === 'number'
  )
}

/**
 * Type guard to check if two positions are equal
 * @param a - First position
 * @param b - Second position
 * @returns True if positions have same row and column
 */
export function isSamePosition(a: Position, b: Position): boolean {
  return a.row === b.row && a.col === b.col
}

/**
 * Check if a position is within board bounds
 * @param size - Board size (square board)
 * @param pos - Position to check
 * @returns True if position is valid
 */
export function isInBounds(size: number, pos: Position): boolean {
  return pos.row >= 0 && pos.row < size && pos.col >= 0 && pos.col < size
}

/**
 * Convert position to coordinate string for display
 * @param pos - Position
 * @returns Coordinate string (e.g., "A1", "B3")
 */
export function positionToCoord(pos: Position): string {
  const col = String.fromCodePoint(65 + pos.col) // A, B, C, ...
  const row = (pos.row + 1).toString() // 1, 2, 3, ...
  return `${col}${row}`
}
