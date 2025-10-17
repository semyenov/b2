import type {
  CreateGameBodySchema,
  GameStateSchema,
  MoveBodySchema,
  PlacementSchema,
  SuggestionSchema,
} from '@shared/schemas'
import type { Static } from '@sinclair/typebox'
import { env } from '@config/env'
import { logger } from '@utils/logger'

export type GameState = Static<typeof GameStateSchema>
export type CreateGameBody = Static<typeof CreateGameBodySchema>
export type MoveBody = Static<typeof MoveBodySchema>
export type Placement = Static<typeof PlacementSchema>
export type Suggestion = Static<typeof SuggestionSchema>

/**
 * API Client for Balda Game Backend
 * Handles all HTTP and WebSocket communication with the game server
 *
 * API URL is automatically detected:
 * - Development: http://localhost:3000
 * - Production: Same origin as frontend (auto-detected)
 * - Custom: Override via VITE_API_URL environment variable
 */
export class ApiClient {
  /**
   * @param baseUrl - Base URL for API endpoints (default: auto-detected from env config)
   */
  constructor(private baseUrl: string = env.apiBaseUrl) { }

  /**
   * Fetch JSON from API with error handling
   * @param url - Request URL
   * @param options - Fetch options
   * @returns Parsed JSON response
   * @throws Error with user-friendly message on failure
   */
  private async fetchJson<T>(url: string, options?: RequestInit): Promise<T> {
    const response = await fetch(url, options)
    if (!response.ok) {
      let message = `HTTP ${response.status}`
      try {
        const error = await response.json()
        message = error.error || error.message || message
      }
      catch {
        message = response.statusText || message
      }
      throw new Error(message)
    }
    return response.json()
  }

  /**
   * Establish WebSocket connection for real-time game updates
   * @param gameId - Game ID to connect to
   * @param onMessage - Callback for game state updates
   * @param onClose - Optional callback when connection closes
   * @returns WebSocket instance
   */
  connectWebSocket(
    gameId: string,
    onMessage: (game: GameState) => void,
    onClose?: () => void,
  ): WebSocket {
    // Convert HTTP base URL to WebSocket URL
    const wsBaseUrl = this.baseUrl.replace(/^http/, 'ws')
    const wsUrl = `${wsBaseUrl}/games/${gameId}/ws`

    const ws = new WebSocket(wsUrl)

    ws.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data)
        if (data?.type === 'game_update' && data.game) {
          onMessage(data.game)
        }
      }
      catch (error) {
        logger.error('Failed to parse WebSocket message', error as Error)
      }
    }

    ws.onerror = () => {
      logger.warn('WebSocket connection error')
    }

    ws.onclose = () => {
      onClose?.()
    }

    return ws
  }

  async getGames(): Promise<GameState[]> {
    return this.fetchJson(`${this.baseUrl}/games`)
  }

  async getGame(id: string): Promise<GameState> {
    return this.fetchJson(`${this.baseUrl}/games/${id}`)
  }

  async createGame(body: CreateGameBody): Promise<GameState> {
    return this.fetchJson(`${this.baseUrl}/games`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    })
  }

  async makeMove(gameId: string, move: MoveBody): Promise<GameState> {
    return this.fetchJson(`${this.baseUrl}/games/${gameId}/move`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(move),
    })
  }

  async getSuggestions(gameId: string, limit = 10): Promise<Suggestion[]> {
    return this.fetchJson(`${this.baseUrl}/games/${gameId}/suggest?limit=${limit}`)
  }

  async getHealth(): Promise<{ status: string }> {
    return this.fetchJson(`${this.baseUrl}/health`)
  }

  async updatePlayerName(gameId: string, oldName: string, newName: string): Promise<GameState> {
    return this.fetchJson(`${this.baseUrl}/games/${gameId}/player`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ oldName, newName }),
    })
  }

  async getRandomWords(length: number, count = 1): Promise<string[]> {
    const data = await this.fetchJson<{ words: string[] }>(
      `${this.baseUrl}/dictionary/random?length=${length}&count=${count}`,
    )
    return data.words
  }
}
