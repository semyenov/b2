/**
 * Type Definitions - TypeScript type exports
 *
 * Centralized exports for all type definitions
 * Organized by domain: game, API, hooks, UI
 */

// API Types
export type {
  ApiErrorResponse,
  CreateGameBody,
  DictionaryMetadata,
  GameState,
  MoveBody,
  Placement,
  Suggestion,
  WebSocketGameUpdate,
  WebSocketMessage,
} from './api'

// Game Types
export type { Board, Position } from './game'

// Hook Types
export type {
  Screen,
  UseCreateGameFormReturn,
  UseFullscreenReturn,
  UseGameClientReturn,
  UseGameControlsReturn,
  UseGameInteractionReturn,
  UseSuggestionsReturn,
} from './hooks'

// UI Types
export type {
  BannerVariant,
  GameStatus,
  GameStatusConfig,
  GameStep,
} from './ui'
