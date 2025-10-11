import type { Static } from '@sinclair/typebox'
import type { CreateGameBodySchema, GameStateSchema, MoveBodySchema, PlacementSchema, SuggestionSchema } from '../schemas'

export type GameState = Static<typeof GameStateSchema>
export type CreateGameBody = Static<typeof CreateGameBodySchema>
export type MoveBody = Static<typeof MoveBodySchema>
export type Placement = Static<typeof PlacementSchema>
export type Suggestion = Static<typeof SuggestionSchema>

export class ApiClient {
  constructor(private baseUrl: string = 'http://localhost:3000') {}

  connectWebSocket(gameId: string, onMessage: (game: GameState) => void): WebSocket {
    const wsUrl = this.baseUrl.replace('http://', 'ws://').replace('https://', 'wss://')
    const ws = new WebSocket(`${wsUrl}/games/${gameId}/ws`)

    ws.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data)
        if (data.type === 'game_update' && data.game) {
          onMessage(data.game)
        }
      }
      catch (error) {
        console.error('Failed to parse WebSocket message:', error)
      }
    }

    ws.onerror = (error) => {
      console.error('WebSocket error:', error)
    }

    return ws
  }

  async getGames(): Promise<GameState[]> {
    const response = await fetch(`${this.baseUrl}/games`)
    if (!response.ok)
      throw new Error('Failed to fetch games')
    return response.json()
  }

  async getGame(id: string): Promise<GameState> {
    const response = await fetch(`${this.baseUrl}/games/${id}`)
    if (!response.ok) {
      if (response.status === 404)
        throw new Error('Game not found')
      throw new Error('Failed to fetch game')
    }
    return response.json()
  }

  async createGame(body: CreateGameBody): Promise<GameState> {
    const response = await fetch(`${this.baseUrl}/games`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    })
    if (!response.ok)
      throw new Error('Failed to create game')
    return response.json()
  }

  async makeMove(gameId: string, move: MoveBody): Promise<GameState> {
    const response = await fetch(`${this.baseUrl}/games/${gameId}/move`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(move),
    })
    if (!response.ok) {
      const error = await response.json()
      throw new Error(error.error || 'Failed to make move')
    }
    return response.json()
  }

  async getPlacements(gameId: string, word: string): Promise<Placement[]> {
    const response = await fetch(
      `${this.baseUrl}/games/${gameId}/placements?word=${encodeURIComponent(word)}`,
    )
    if (!response.ok)
      throw new Error('Failed to get placements')
    return response.json()
  }

  async getSuggestions(gameId: string, limit?: number): Promise<Suggestion[]> {
    const url = limit
      ? `${this.baseUrl}/games/${gameId}/suggest?limit=${limit}`
      : `${this.baseUrl}/games/${gameId}/suggest`
    const response = await fetch(url)
    if (!response.ok)
      throw new Error('Failed to get suggestions')
    return response.json()
  }

  async getHealth(): Promise<{ status: string }> {
    const response = await fetch(`${this.baseUrl}/health`)
    if (!response.ok)
      throw new Error('Health check failed')
    return response.json()
  }

  async updatePlayerName(gameId: string, oldName: string, newName: string): Promise<GameState> {
    const response = await fetch(`${this.baseUrl}/games/${gameId}/player`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ oldName, newName }),
    })
    if (!response.ok) {
      const error = await response.json()
      throw new Error(error.error || 'Failed to update player name')
    }
    return response.json()
  }

  async getRandomWords(length: number, count: number = 1): Promise<string[]> {
    const response = await fetch(`${this.baseUrl}/dictionary/random?length=${length}&count=${count}`)
    if (!response.ok) {
      throw new Error('Failed to fetch random words')
    }
    const data = await response.json()
    return data.words
  }
}
