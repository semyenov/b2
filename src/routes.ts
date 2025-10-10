import type { SizedDictionary } from './dictionary'
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
  SuggestQuerySchema,
  SuggestResponseSchema,
} from './schemas'
import { store } from './store'
import { broadcastGame } from './wsHub'

let dictionaryPromise: Promise<SizedDictionary> | null = null
async function getDictionary(): Promise<SizedDictionary> {
  if (!dictionaryPromise) {
    const dictPath = process.env.DICT_PATH
    if (dictPath) {
      try {
        const { loadDictionaryFromFile } = await import('./dictionary')
        dictionaryPromise = loadDictionaryFromFile(dictPath)
      }
      catch (error) {
        throw new DictionaryError(`Failed to load dictionary from ${dictPath}: ${error}`)
      }
    }
    else {
      const { AllowAllSizedDictionary } = await import('./dictionary')
      dictionaryPromise = Promise.resolve(new AllowAllSizedDictionary())
    }
  }
  return dictionaryPromise
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

/**
 * Game management plugin - handles game CRUD operations
 */
const gamesPlugin = new Elysia({ name: 'games', prefix: '/games' })
  .get('/', async () => await store.getAll())
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
    broadcastGame(params.id, res.game)
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

export function registerRoutes(app: Elysia): Elysia {
  return app
    .get('/health', () => ({ status: 'ok' }))
    .use(dictionaryPlugin)
    .use(gamesPlugin)
}
