import type { SizedDictionary } from './dictionary'
import { Type } from '@sinclair/typebox'
import { Elysia } from 'elysia'
import {
  CreateGameBodySchema,
  DictionaryStatsSchema,
  ErrorSchema,
  FindPlacementsQuerySchema,
  GameIdParamsSchema,
  GameStateSchema,
  MoveBodySchema,
  PlacementsResponseSchema,
  RandomWordsQuerySchema,
  RandomWordsResponseSchema,
  SuggestQuerySchema,
  SuggestResponseSchema,
  UpdatePlayerBodySchema,
} from '../shared/schemas'
import { applyMove, createGame, findPlacementsForWord } from './engine/balda'
import { suggestWords } from './engine/suggest'
import { DictionaryError, GameNotFoundError, InvalidMoveError, InvalidPlacementError } from './errors'
import { logger } from './monitoring/logger'
import { store } from './store'
import { isValidUUID } from './utils/uuid'
import { broadcastGame, setArchiveCallback } from './wsHub'

// Set up archive callback to delete games when all clients disconnect
setArchiveCallback(async (gameId: string) => {
  const game = await store.get(gameId)
  if (game) {
    await store.delete(gameId)
    logger.info(`Archived game ${gameId} (${game.players.join(' vs ')})`)
  }
})

let dictionaryPromise: Promise<SizedDictionary> | null = null
let dictionaryLoadingLock = false

async function getDictionary(): Promise<SizedDictionary> {
  // If dictionary is already loaded or being loaded, return the existing promise
  if (dictionaryPromise) {
    return dictionaryPromise
  }

  // Check if another request is already loading the dictionary
  if (dictionaryLoadingLock) {
    // Wait a bit and retry
    await new Promise(resolve => setTimeout(resolve, 10))
    return getDictionary()
  }

  // Acquire the lock and load the dictionary
  dictionaryLoadingLock = true
  try {
    const dictPath = process.env.DICT_PATH
    if (dictPath) {
      const { loadDictionaryFromFile } = await import('./dictionary')
      dictionaryPromise = loadDictionaryFromFile(dictPath).catch((error) => {
        // Reset on error to allow retry
        dictionaryPromise = null
        throw new DictionaryError(`Failed to load dictionary from ${dictPath}: ${error}`)
      })
    }
    else {
      const { AllowAllSizedDictionary } = await import('./dictionary')
      dictionaryPromise = Promise.resolve(new AllowAllSizedDictionary())
    }
  }
  finally {
    dictionaryLoadingLock = false
  }

  return dictionaryPromise!
}

/**
 * Dictionary plugin - handles dictionary-related endpoints
 */
const dictionaryPlugin = new Elysia({ name: 'dictionary', prefix: '/dictionary', tags: ['dictionary'] })
  .get('/', async () => {
    const dictPath = process.env.DICT_PATH
    if (!dictPath)
      return { loaded: true, source: 'builtin' as const }
    const { loadDictionaryFromFile } = await import('./dictionary')
    const dict = await loadDictionaryFromFile(dictPath)
    return { loaded: true, source: 'file' as const, size: dict.size() }
  }, {
    response: { 200: DictionaryStatsSchema },
    detail: {
      summary: 'Get dictionary metadata',
      description: 'Returns information about the loaded dictionary including source (file or builtin) and size.',
      tags: ['dictionary'],
    },
  })
  .get('/random', async ({ query }) => {
    const dict = await getDictionary()
    const length = query.length ? Number(query.length) : 5
    const count = query.count ? Number(query.count) : 1
    const words = dict.getRandomWords(length, count)
    return { words }
  }, {
    query: RandomWordsQuerySchema,
    response: { 200: RandomWordsResponseSchema },
    detail: {
      summary: 'Get random words from dictionary',
      description: 'Returns random words of specified length from the dictionary. Useful for generating base words for new games.',
      tags: ['dictionary'],
    },
  })

/**
 * Game management plugin - handles game CRUD operations
 */
const gamesPlugin = new Elysia({ name: 'games', prefix: '/games', tags: ['games'] })
  .get('/', async () => await store.getAll(), {
    response: { 200: Type.Array(GameStateSchema) },
    detail: {
      summary: 'List all games',
      description: 'Returns an array of all active games in the system.',
      tags: ['games'],
    },
  })
  .post('/', async ({ body }) => {
    const id = crypto.randomUUID()
    const game = createGame(id, {
      size: body.size,
      baseWord: body.baseWord,
      players: body.players,
      aiPlayers: body.aiPlayers,
    })
    await store.set(game)
    return game
  }, {
    body: CreateGameBodySchema,
    response: { 200: GameStateSchema },
    detail: {
      summary: 'Create a new game',
      description: 'Creates a new Balda game with the specified board size, base word, and players. The base word is placed in the center row of the board.',
      tags: ['games'],
    },
  })
  .get('/:id', async ({ params }) => {
    // Validate UUID format before querying database
    if (!isValidUUID(params.id))
      throw new GameNotFoundError(params.id)

    const game = await store.get(params.id)
    if (!game)
      throw new GameNotFoundError(params.id)

    return game
  }, {
    params: GameIdParamsSchema,
    response: { 200: GameStateSchema, 404: ErrorSchema },
    detail: {
      summary: 'Get game state',
      description: 'Returns the current state of a specific game including board, players, scores, and move history.',
      tags: ['games'],
    },
  })
  .post('/:id/move', async ({ params, body }) => {
    // Validate UUID format before querying database
    if (!isValidUUID(params.id))
      throw new GameNotFoundError(params.id)

    const game = await store.get(params.id)
    if (!game)
      throw new GameNotFoundError(params.id)

    const dictionary = await getDictionary()
    const res = applyMove(game, body, dictionary)
    if (!res.ok)
      throw new InvalidMoveError(res.message)

    await store.set(res.game)
    // Broadcast to all connected clients
    setTimeout(() => broadcastGame(params.id, res.game), 50)
    return res.game
  }, {
    params: GameIdParamsSchema,
    body: MoveBodySchema,
    response: { 200: GameStateSchema, 400: ErrorSchema, 404: ErrorSchema },
    detail: {
      summary: 'Submit a move',
      description: 'Validates and applies a player move to the game. A valid move requires: (1) placing exactly one letter in an empty cell, (2) forming a valid word that uses the placed letter, (3) the word must exist in the dictionary and not have been used before.',
      tags: ['games'],
    },
  })
  .get('/:id/placements', async ({ params, query }) => {
    // Validate UUID format before querying database
    if (!isValidUUID(params.id))
      throw new GameNotFoundError(params.id)

    const game = await store.get(params.id)
    if (!game)
      throw new GameNotFoundError(params.id)

    const { word } = query
    if (!word)
      throw new InvalidPlacementError('Word query parameter is required')

    return findPlacementsForWord(game.board, word)
  }, {
    query: FindPlacementsQuerySchema,
    response: { 200: PlacementsResponseSchema, 400: ErrorSchema, 404: ErrorSchema },
    detail: {
      summary: 'Find valid placements for a word',
      description: 'Returns all possible positions where a single letter can be placed to form the specified word on the current board.',
      tags: ['games'],
    },
  })
  .get('/:id/suggest', async ({ params, query }) => {
    // Validate UUID format before querying database
    if (!isValidUUID(params.id))
      throw new GameNotFoundError(params.id)

    const game = await store.get(params.id)
    if (!game)
      throw new GameNotFoundError(params.id)

    const dict = await getDictionary()
    const limit = query.limit ? Number(query.limit) : undefined
    return suggestWords(game.board, dict, { limit, usedWords: game.usedWords })
  }, {
    query: SuggestQuerySchema,
    response: { 200: SuggestResponseSchema, 404: ErrorSchema },
    detail: {
      summary: 'Get AI move suggestions',
      description: 'Returns a list of suggested moves generated by the AI, sorted by score. Each suggestion includes the position, letter to place, and the word that would be formed.',
      tags: ['games'],
    },
  })
  .patch('/:id/player', async ({ params, body }) => {
    // Validate UUID format before querying database
    if (!isValidUUID(params.id))
      throw new GameNotFoundError(params.id)

    const game = await store.get(params.id)
    if (!game)
      throw new GameNotFoundError(params.id)

    const { oldName, newName } = body

    // Check if new name already exists in the game
    if (game.players.includes(newName) && newName !== oldName) {
      throw new InvalidMoveError(`Player name "${newName}" is already taken in this game`)
    }

    const playerIndex = game.players.indexOf(oldName)
    if (playerIndex === -1)
      throw new InvalidMoveError(`Player "${oldName}" not found in game`)

    // Create updated game with new player name
    const updatedPlayers = [...game.players]
    updatedPlayers[playerIndex] = newName

    // Safely migrate scores - only if the old player had a score
    const updatedScores = { ...game.scores }
    if (oldName in game.scores) {
      // oldName checked to exist in scores object above
      updatedScores[newName] = game.scores[oldName]!
      delete updatedScores[oldName]
    }
    else {
      // Initialize score for new player if they don't have one
      updatedScores[newName] = 0
    }

    // Update move history to reflect the new player name
    const updatedMoves = game.moves.map(move =>
      move.playerId === oldName
        ? { ...move, playerId: newName }
        : move,
    )

    const updatedGame = {
      ...game,
      players: updatedPlayers,
      scores: updatedScores,
      moves: updatedMoves,
    }

    await store.set(updatedGame)
    // Broadcast to all connected clients immediately
    setTimeout(() => broadcastGame(params.id, updatedGame), 50)
    return updatedGame
  }, {
    params: GameIdParamsSchema,
    body: UpdatePlayerBodySchema,
    response: { 200: GameStateSchema, 400: ErrorSchema, 404: ErrorSchema },
    detail: {
      summary: 'Update player name',
      description: 'Updates a player\'s name in the game, preserving their score and move history.',
      tags: ['games'],
    },
  })

// eslint-disable-next-line ts/ban-ts-comment
// @ts-ignore - Elysia type system complexities with JWT plugins cause type inference issues
export function registerRoutes(app: Elysia): Elysia {
  // Import auth routes
  const authPluginImport = import('./routes/auth').then(m => m.authPlugin)

  // eslint-disable-next-line ts/ban-ts-comment
  // @ts-ignore - Elysia type system complexities
  return app
    .get('/health', () => ({ status: 'ok' }), {
      detail: {
        summary: 'Health check',
        description: 'Returns the health status of the API server.',
        tags: ['health'],
      },
    })
    .use(async () => await authPluginImport)
    .use(dictionaryPlugin)
    .use(gamesPlugin)
}
