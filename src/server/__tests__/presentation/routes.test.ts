import cors from '@elysiajs/cors'
import { afterAll, afterEach, beforeAll, describe, expect, test } from 'bun:test'
import { Elysia } from 'elysia'
import { createTestClient } from '../../../../test/helpers/testClient'
import { registerRoutes } from '../../routes'
import { store } from '../../store'

// Create test app instance
const app = new Elysia()
  .use(cors())
  .onError(({ code, error }) => {
    if (code === 'NOT_FOUND') {
      return { success: false, error: 'Not found' }
    }
    return {
      success: false,
      error: String(error) || 'Internal server error',
    }
  })

// eslint-disable-next-line ts/ban-ts-comment
// @ts-ignore - Elysia type system complexities
registerRoutes(app)

const client = createTestClient(app)

describe('API Routes - Health Check', () => {
  test('GET /health returns ok status', async () => {
    const response = await client.get('/health')
    expect(response.status).toBe(200)
    expect(response.data).toEqual({ status: 'ok' })
  })
})

describe('API Routes - Dictionary', () => {
  test('GET /dictionary returns dictionary info', async () => {
    const response = await client.get('/dictionary')
    expect(response.status).toBe(200)
    expect(response.data).toHaveProperty('loaded')
    expect(response.data.loaded).toBe(true)
  })

  test('GET /dictionary/random returns random words', async () => {
    const response = await client.get('/dictionary/random?length=5&count=3')
    expect(response.status).toBe(200)
    expect(response.data).toHaveProperty('words')
    expect(Array.isArray(response.data.words)).toBe(true)
  })

  test('GET /dictionary/random uses defaults', async () => {
    const response = await client.get('/dictionary/random')
    expect(response.status).toBe(200)
    expect(response.data).toHaveProperty('words')
  })
})

describe('API Routes - Games CRUD', () => {
  let testGameId: string

  afterEach(async () => {
    // Clean up test games
    if (testGameId) {
      await store.delete(testGameId)
    }
  })

  afterAll(async () => {
    // Clean up all test games
    const games = await store.getAll()
    for (const game of games) {
      await store.delete(game.id)
    }
  })

  describe('POST /games', () => {
    test('creates new game with valid data', async () => {
      const response = await client.post('/games', {
        size: 5,
        baseWord: 'HELLO',
        players: ['Alice', 'Bob'],
      })

      expect(response.status).toBe(200)
      expect(response.data).toHaveProperty('id')
      expect(response.data.size).toBe(5)
      expect(response.data.players).toEqual(['Alice', 'Bob'])
      expect(response.data.board.length).toBe(5)
      expect(response.data.usedWords).toContain('HELLO')

      testGameId = response.data.id
    })

    test('creates game with AI players', async () => {
      const response = await client.post('/games', {
        size: 5,
        baseWord: 'WORLD',
        players: ['Human', 'AI-Bot'],
        aiPlayers: ['AI-Bot'],
      })

      expect(response.status).toBe(200)
      expect(response.data.aiPlayers).toContain('AI-Bot')

      testGameId = response.data.id
    })

    test('rejects invalid board size', async () => {
      const response = await client.post('/games', {
        size: 2, // Too small
        baseWord: 'HI',
        players: ['Alice', 'Bob'],
      })

      expect(response.status).toBeGreaterThanOrEqual(400)
    })

    test('creates game with default players', async () => {
      const response = await client.post('/games', {
        size: 5,
        baseWord: 'HELLO', // Must be 5 letters for 5x5 board
      })

      expect(response.status).toBe(200)
      expect(response.data.players.length).toBeGreaterThan(0)

      testGameId = response.data.id
    })
  })

  describe('GET /games', () => {
    beforeAll(async () => {
      // Create test games
      const game1 = await client.post('/games', {
        size: 5,
        baseWord: 'ALPHA', // Must be 5 letters for 5x5 board
        players: ['A', 'B'],
      })
      await client.post('/games', {
        size: 5,
        baseWord: 'BRAVO', // Must be 5 letters for 5x5 board
        players: ['C', 'D'],
      })
      testGameId = game1.data.id // Save for cleanup
    })

    test('returns list of all games', async () => {
      const response = await client.get('/games')

      expect(response.status).toBe(200)
      expect(Array.isArray(response.data)).toBe(true)
      expect(response.data.length).toBeGreaterThan(0)
    })

    test('each game has required properties', async () => {
      const response = await client.get('/games')

      if (response.data.length > 0) {
        const game = response.data[0]
        expect(game).toHaveProperty('id')
        expect(game).toHaveProperty('size')
        expect(game).toHaveProperty('board')
        expect(game).toHaveProperty('players')
        expect(game).toHaveProperty('scores')
      }
    })
  })

  describe('GET /games/:id', () => {
    beforeAll(async () => {
      const response = await client.post('/games', {
        size: 5,
        baseWord: 'QUICK', // Must be 5 letters for 5x5 board
        players: ['Alice', 'Bob'],
      })
      testGameId = response.data.id
    })

    test('returns game by ID', async () => {
      const response = await client.get(`/games/${testGameId}`)

      expect(response.status).toBe(200)
      expect(response.data.id).toBe(testGameId)
    })

    test('returns 404 for non-existent game', async () => {
      const response = await client.get('/games/non-existent-id')

      expect(response.status).toBe(404)
    })
  })

  describe('POST /games/:id/move', () => {
    beforeAll(async () => {
      const response = await client.post('/games', {
        size: 5,
        baseWord: 'НУЖНО', // Russian word, 5 letters for 5x5 board
        players: ['Alice', 'Bob'],
      })
      testGameId = response.data.id
    })

    test('accepts valid move', async () => {
      const response = await client.post(`/games/${testGameId}/move`, {
        playerId: 'Alice',
        position: { row: 1, col: 1 }, // Above 'У' in НУЖНО
        letter: 'Т',
        word: 'НУТ', // Н[2,0] -> У[2,1] -> Т[1,1]
      })

      expect(response.status).toBe(200)
      expect(response.data.board[1][1]).toBe('Т')
      expect(response.data.moves.length).toBe(1)
      expect(response.data.currentPlayerIndex).toBe(1) // Bob's turn
    })

    test('rejects move from wrong player', async () => {
      // Create fresh game
      const gameResponse = await client.post('/games', {
        size: 5,
        baseWord: 'WORLD', // Must be 5 letters for 5x5 board
        players: ['Alice', 'Bob'],
      })
      testGameId = gameResponse.data.id

      const response = await client.post(`/games/${testGameId}/move`, {
        playerId: 'Bob', // Alice's turn
        position: { row: 1, col: 1 },
        letter: 'S',
        word: 'DOGS',
      })

      expect(response.status).toBe(400)
    })

    test('rejects move on occupied cell', async () => {
      // Create fresh game
      const gameResponse = await client.post('/games', {
        size: 5,
        baseWord: 'HELLO', // Must be 5 letters for 5x5 board
        players: ['Alice', 'Bob'],
      })
      testGameId = gameResponse.data.id

      const response = await client.post(`/games/${testGameId}/move`, {
        playerId: 'Alice',
        position: { row: 2, col: 1 }, // HELLO position (center row)
        letter: 'X',
        word: 'XTEST',
      })

      expect(response.status).toBe(400)
    })

    test('returns 404 for non-existent game', async () => {
      const response = await client.post('/games/non-existent/move', {
        playerId: 'Alice',
        position: { row: 0, col: 0 },
        letter: 'A',
        word: 'TEST',
      })

      expect(response.status).toBe(404)
    })
  })

  describe('GET /games/:id/suggestions', () => {
    let suggestGameId: string

    beforeAll(async () => {
      const response = await client.post('/games', {
        size: 5,
        baseWord: 'HELLO',
        players: ['Alice', 'Bob'],
      })
      suggestGameId = response.data.id
    })

    afterAll(async () => {
      if (suggestGameId) {
        await store.delete(suggestGameId)
      }
    })

    test('returns move suggestions', async () => {
      const response = await client.get(
        `/games/${suggestGameId}/suggest?playerId=Alice&limit=5`,
      )

      expect(response.status).toBe(200)
      expect(Array.isArray(response.data)).toBe(true)
      expect(response.data.length).toBeLessThanOrEqual(5)
    })

    test('suggestions have required properties', async () => {
      const response = await client.get(
        `/games/${suggestGameId}/suggest?playerId=Alice`,
      )

      expect(response.status).toBe(200)
      if (response.data && response.data.length > 0) {
        const suggestion = response.data[0]
        expect(suggestion).toHaveProperty('position')
        expect(suggestion).toHaveProperty('letter')
        expect(suggestion).toHaveProperty('word')
        expect(suggestion).toHaveProperty('score')
      }
    })

    test('uses default limit when not specified', async () => {
      const response = await client.get(`/games/${suggestGameId}/suggest?playerId=Alice`)

      expect(response.status).toBe(200)
      expect(response.data.length).toBeLessThanOrEqual(20) // DEFAULT_SUGGESTION_LIMIT
    })

    test('returns 404 for non-existent game', async () => {
      const response = await client.get('/games/non-existent/suggest?playerId=Alice')

      expect(response.status).toBe(404)
    })
  })

  describe('GET /games/:id/placements', () => {
    let placementGameId: string

    beforeAll(async () => {
      const response = await client.post('/games', {
        size: 5,
        baseWord: 'HELLO', // Must be 5 letters for 5x5 board
        players: ['Alice', 'Bob'],
      })
      placementGameId = response.data.id
    })

    afterAll(async () => {
      if (placementGameId) {
        await store.delete(placementGameId)
      }
    })

    test('returns valid placements for word', async () => {
      const response = await client.get(`/games/${placementGameId}/placements?word=SCAT`)

      expect(response.status).toBe(200)
      expect(Array.isArray(response.data)).toBe(true)
    })

    test('placement objects have position and letter', async () => {
      const response = await client.get(`/games/${placementGameId}/placements?word=SCAT`)

      expect(response.status).toBe(200)
      if (response.data && response.data.length > 0) {
        const placement = response.data[0]
        expect(placement).toHaveProperty('position')
        expect(placement).toHaveProperty('letter')
        expect(placement.position).toHaveProperty('row')
        expect(placement.position).toHaveProperty('col')
      }
    })

    test('requires word parameter', async () => {
      const response = await client.get(`/games/${placementGameId}/placements`)

      expect(response.status).toBeGreaterThanOrEqual(400)
    })

    test('returns 404 for non-existent game', async () => {
      const response = await client.get('/games/non-existent/placements?word=TEST')

      expect(response.status).toBe(404)
    })
  })

  describe('PATCH /games/:id/player', () => {
    let renameGameId: string

    beforeAll(async () => {
      const response = await client.post('/games', {
        size: 5,
        baseWord: 'HELLO', // Must be 5 letters for 5x5 board
        players: ['OldName', 'Bob'],
      })
      renameGameId = response.data.id
    })

    afterAll(async () => {
      if (renameGameId) {
        await store.delete(renameGameId)
      }
    })

    test('updates player name', async () => {
      const response = await client.patch(`/games/${renameGameId}/player`, {
        oldName: 'OldName',
        newName: 'NewName',
      })

      expect(response.status).toBe(200)
      expect(response.data.players).toContain('NewName')
      expect(response.data.players).not.toContain('OldName')
      expect(response.data.scores).toHaveProperty('NewName')
    })

    test('rejects if new name already exists', async () => {
      const response = await client.patch(`/games/${renameGameId}/player`, {
        oldName: 'NewName',
        newName: 'Bob', // Already exists
      })

      expect(response.status).toBe(400)
    })

    test('rejects if old player not found', async () => {
      const response = await client.patch(`/games/${renameGameId}/player`, {
        oldName: 'NonExistent',
        newName: 'SomeName',
      })

      expect(response.status).toBe(400)
    })

    test('returns 404 for non-existent game', async () => {
      const response = await client.patch('/games/non-existent/player', {
        oldName: 'A',
        newName: 'B',
      })

      expect(response.status).toBe(404)
    })
  })
})

describe('API Routes - Error Handling', () => {
  test('returns 404 for unknown routes', async () => {
    const response = await client.get('/unknown-route')

    expect(response.status).toBe(404)
  })

  test('handles malformed JSON in POST', async () => {
    const response = await app.handle(
      new Request('http://localhost/games', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: '{invalid json}',
      }),
    )

    expect(response.status).toBeGreaterThanOrEqual(400)
  })
})
