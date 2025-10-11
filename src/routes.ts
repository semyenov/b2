import type { SizedDictionary } from './dictionary'
import { Type } from '@sinclair/typebox'
import { Elysia } from 'elysia'
import { applyMove, createGame, findPlacementsForWord } from './engine/balda'
import { suggestWords } from './engine/suggest'
import { DictionaryError, GameNotFoundError, InvalidMoveError, InvalidPlacementError } from './errors'
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
} from './schemas'
import { store } from './store'
import { broadcastGame } from './wsHub'

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
const dictionaryPlugin = new Elysia({ name: 'dictionary', prefix: '/dictionary' })
  .get('/', async () => {
    const dictPath = process.env.DICT_PATH
    if (!dictPath)
      return { loaded: true, source: 'builtin' as const }
    const { loadDictionaryFromFile } = await import('./dictionary')
    const dict = await loadDictionaryFromFile(dictPath)
    return { loaded: true, source: 'file' as const, size: dict.size() }
  }, { response: { 200: DictionaryStatsSchema } })
  .get('/random', async ({ query }) => {
    const dict = await getDictionary()
    const length = query.length ? Number(query.length) : 5
    const count = query.count ? Number(query.count) : 1
    const words = dict.getRandomWords(length, count)
    return { words }
  }, { query: RandomWordsQuerySchema, response: { 200: RandomWordsResponseSchema } })

/**
 * Game management plugin - handles game CRUD operations
 */
const gamesPlugin = new Elysia({ name: 'games', prefix: '/games' })
  .get('/', async () => await store.getAll(), {
    response: { 200: Type.Array(GameStateSchema) },
  })
  .post('/', async ({ body }) => {
    const id = crypto.randomUUID()
    const game = createGame(id, { size: body.size, baseWord: body.baseWord, players: body.players })
    await store.set(game)
    return game
  }, {
    body: CreateGameBodySchema,
    response: { 200: GameStateSchema },
  })
  .get('/:id', async ({ params }) => {
    const game = await store.get(params.id)
    if (!game)
      throw new GameNotFoundError(params.id)

    return game
  }, { params: GameIdParamsSchema, response: { 200: GameStateSchema, 404: ErrorSchema } })
  .post('/:id/move', async ({ params, body }) => {
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
  })
  .get('/:id/placements', async ({ params, query }) => {
    const game = await store.get(params.id)
    if (!game)
      throw new GameNotFoundError(params.id)

    const { word } = query
    if (!word)
      throw new InvalidPlacementError('Word query parameter is required')

    return findPlacementsForWord(game.board, word)
  }, { query: FindPlacementsQuerySchema, response: { 200: PlacementsResponseSchema, 400: ErrorSchema, 404: ErrorSchema } })
  .get('/:id/suggest', async ({ params, query }) => {
    const game = await store.get(params.id)
    if (!game)
      throw new GameNotFoundError(params.id)

    const dict = await getDictionary()
    const limit = query.limit ? Number(query.limit) : undefined
    return suggestWords(game.board, dict, { limit })
  }, { query: SuggestQuerySchema, response: { 200: SuggestResponseSchema, 404: ErrorSchema } })
  .patch('/:id/player', async ({ params, body }) => {
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
      updatedScores[newName] = game.scores[oldName]
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
  })

export function registerRoutes(app: Elysia): Elysia {
  return app
    .get('/health', () => ({ status: 'ok' }))
    .use(dictionaryPlugin)
    .use(gamesPlugin)
}
