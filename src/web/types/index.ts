/**
 * Type Definitions - Direct exports from sources
 *
 * No re-export indirection - imports directly from:
 * - Shared types (domain models)
 * - Local web types (UI-specific)
 * - API client types (generated from schemas)
 */

// Shared Domain Types (from @shared/types)
export type { Board, GameStatus, Position } from '../../shared/types'

// API Client Types (from lib/client)
export type { CreateGameBody, GameState, MoveBody, Placement, Suggestion } from '../lib/client'

// Web-Specific API Types
export type { ApiErrorResponse, WebSocketGameUpdate, WebSocketMessage } from './api'

// Web-Specific Hook Types
export type {
  Screen,
  UseCreateGameFormReturn,
  UseFullscreenReturn,
  UseGameClientReturn,
  UseGameControlsReturn,
  UseGameInteractionReturn,
  UseSuggestionsReturn,
} from './hooks'

// Web-Specific UI Types
export type {
  BannerVariant,
  GameStatusConfig,
  GameStep,
} from './ui'
