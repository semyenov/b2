/**
 * Shared Types - Main Export
 * Centralized type definitions for the Balda game
 *
 * This module provides a single import point for all domain types:
 * - Game: Core game state and board types
 * - Move: Move input and validation types
 * - Suggestion: AI suggestion types
 * - Dictionary: Word validation interfaces
 * - Result: Generic result pattern types
 *
 * @example
 * ```typescript
 * import type { GameState, Position, Suggestion, Dictionary } from '@shared/types'
 *
 * function processMove(game: GameState, pos: Position): MoveResult {
 *   // ...
 * }
 * ```
 */

// ============================================
// Core Game Types
// ============================================

export type {
  AsyncDictionary,
  Dictionary,
  DictionaryConfig,
  DictionaryMetadata,
  DictionaryStatus,
  SizedDictionary,
} from './dictionary'

export {
  hasPrefixSupport,
  isAsyncDictionary,
  isSizedDictionary,
} from './dictionary'

// ============================================
// Move Types
// ============================================

export type {
  AppliedMove,
  Board,
  Direction,
  GameConfig,
  GameState,
  GameStatus,
  Letter,
  Position,
  PositionValidation,
} from './game'

export {
  isInBounds,
  isPosition,
  isSamePosition,
  positionToCoord,
} from './game'

export {
  MoveValidationError,
} from './move'

// ============================================
// Suggestion Types
// ============================================

export type {
  MoveInput,
  MovePlacement,
  MoveResult,
  MoveValidationResult,
} from './move'

export {
  getMoveError,
  isMoveFailure,
  isMoveSuccess,
} from './move'

// ============================================
// Dictionary Types
// ============================================

export type {
  Result,
} from './result'

export {
  andThen,
  combine,
  err,
  fromPromise,
  isErr,
  isOk,
  map,
  mapErr,
  ok,
  toPromise,
  unwrap,
  unwrapOr,
} from './result'

// ============================================
// Result Pattern Types
// ============================================

export type {
  RankedSuggestion,
  Suggestion,
  SuggestionsResponse,
  SuggestOptions,
} from './suggestion'

export {
  compareSuggestions,
  filterByMinScore,
  groupByTier,
} from './suggestion'

// ============================================
// Backward Compatibility Aliases
// ============================================

/**
 * @deprecated Use Position instead
 * Kept for backward compatibility with server code
 */
export type BoardPosition = Position
