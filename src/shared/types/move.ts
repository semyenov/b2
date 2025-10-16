/**
 * Move Domain Types
 * Types related to player moves and move validation
 *
 * Defines structures for:
 * - Move input (user submission)
 * - Move validation results
 * - Move history records
 */

import type { GameState, Position } from './game'

/**
 * Move input from player
 * Represents a player's intended move before validation
 *
 * Used for:
 * - API request body (POST /games/:id/move)
 * - Server-side validation
 * - TypeBox schema validation
 */
export interface MoveInput {
  /** Player making the move */
  readonly playerId: string

  /** Position where letter is being placed */
  readonly position: Position

  /** Letter to place (single uppercase character) */
  readonly letter: string

  /** Word being formed (must include new letter) */
  readonly word: string
}

/**
 * Result of applying a move
 * Discriminated union for success/failure
 *
 * @example Success
 * ```typescript
 * const result: MoveResult = {
 *   ok: true,
 *   game: updatedGameState
 * }
 * ```
 *
 * @example Failure
 * ```typescript
 * const result: MoveResult = {
 *   ok: false,
 *   message: 'Word already used in this game'
 * }
 * ```
 */
export type MoveResult
  = | { readonly ok: true, readonly game: GameState }
    | { readonly ok: false, readonly message: string }

/**
 * Move validation errors
 * Enum of all possible validation failure reasons
 */
export enum MoveValidationError {
  CELL_OCCUPIED = 'Cell is already occupied',
  NOT_ADJACENT = 'Placement must be adjacent to existing letters',
  NOT_YOUR_TURN = 'Not current player\'s turn',
  WORD_NOT_IN_DICTIONARY = 'Word is not present in dictionary',
  WORD_ALREADY_USED = 'Word already used in this game',
  NO_VALID_PATH = 'No valid path for the claimed word',
  LETTER_NOT_IN_WORD = 'Placed letter must be part of the claimed word',
  POSITION_OUT_OF_BOUNDS = 'Position is outside of board',
  INVALID_WORD_LENGTH = 'Word must be at least 3 letters',
}

/**
 * Move validation result with detailed feedback
 * Used for client-side pre-validation
 */
export interface MoveValidationResult {
  /** Whether the move is valid */
  readonly valid: boolean

  /** Error reason if invalid */
  readonly error?: MoveValidationError

  /** Optional additional context */
  readonly details?: string
}

/**
 * Move placement options for suggestion engine
 * Represents a possible move placement
 */
export interface MovePlacement {
  /** Position to place letter */
  readonly position: Position

  /** Letter to place */
  readonly letter: string
}

/**
 * Type guard to check if MoveResult is success
 * @param result - Move result to check
 * @returns True if result is successful
 */
export function isMoveSuccess(result: MoveResult): result is { ok: true, game: GameState } {
  return result.ok === true
}

/**
 * Type guard to check if MoveResult is failure
 * @param result - Move result to check
 * @returns True if result failed
 */
export function isMoveFailure(result: MoveResult): result is { ok: false, message: string } {
  return result.ok === false
}

/**
 * Extract error message from MoveResult
 * @param result - Move result
 * @returns Error message or undefined if successful
 */
export function getMoveError(result: MoveResult): string | undefined {
  return isMoveFailure(result) ? result.message : undefined
}
