import type { Static } from '@sinclair/typebox'
import type {
  CreateGameBodySchema,
  GameStateSchema,
  MoveBodySchema,
  PlacementSchema,
  SuggestionSchema,
} from '../../shared/schemas'
import { logger } from '../utils/logger'

export type GameState = Static<typeof GameStateSchema>
export type CreateGameBody = Static<typeof CreateGameBodySchema>
export type MoveBody = Static<typeof MoveBodySchema>
export type Placement = Static<typeof PlacementSchema>
export type Suggestion = Static<typeof SuggestionSchema>

/**
 * API Client for Balda Game Backend
 * Handles all HTTP and WebSocket communication with the game server
 */
export class ApiClient {
  /**
   * @param baseUrl - Base URL for API endpoints (default: '/api')
   */
  constructor(private baseUrl: string = '/api') { }

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
    // In development, connect directly to the backend server
    // In production, use the same host as the frontend
    const isDev = window.location.hostname === 'localhost' && window.location.port === '5173'
    const wsHost = isDev ? 'localhost:3000' : window.location.host
    const wsProtocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:'
    const wsUrl = `${wsProtocol}//${wsHost}/games/${gameId}/ws`

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
