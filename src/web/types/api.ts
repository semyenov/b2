/**
 * API-related type definitions
 * Consolidates types for backend communication
 */

// Re-export main API types from client
// These are derived from TypeBox schemas in @shared/schemas
export type { CreateGameBody, GameState, MoveBody, Placement, Suggestion } from '@lib/client'

/**
 * WebSocket message types
 */
export interface WebSocketGameUpdate {
  type: 'game_update'
  game: import('@lib/client').GameState
}

export type WebSocketMessage = WebSocketGameUpdate

/**
 * API Error response structure
 */
export interface ApiErrorResponse {
  error?: string
  message?: string
  statusCode?: number
}

/**
 * Dictionary metadata response
 */
export interface DictionaryMetadata {
  wordCount: number
  alphabet: string[]
  letterFrequency: Record<string, number>
}
