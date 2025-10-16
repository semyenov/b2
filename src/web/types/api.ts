/**
 * API-related type definitions
 * Web-specific API types (WebSocket, Error handling)
 */

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
