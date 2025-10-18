import { getConfig } from '@server/core/config'
import { logger } from '@server/core/monitoring/logger'
import { isValidUUID } from '@server/core/utils/uuid'
import { GameNotFoundError, InvalidMoveError, InvalidPlacementError } from '@server/domain/errors'
import { applyMove, createGame, findPlacementsForWord } from '@server/domain/game/engine'
import { suggestWords } from '@server/domain/game/suggestions'
import { broadcastGame, setArchiveCallback } from '@server/infrastructure/websocket/hub'
import { store } from '@server/store'
import {
  CreateGameBodySchema,
  ErrorSchema,
  FindPlacementsQuerySchema,
  GameIdParamsSchema,
  GameStateSchema,
  MoveBodySchema,
  PlacementsResponseSchema,
  SuggestQuerySchema,
  SuggestResponseSchema,
  UpdatePlayerBodySchema,
} from '@shared/schemas'
import { Type } from '@sinclair/typebox'
import { Elysia } from 'elysia'
import { getDictionary } from './dictionaryLoader'

// Set up archive callback to delete games when all clients disconnect
setArchiveCallback(async (gameId: string) => {
  const game = await store.get(gameId)
  if (game) {
    await store.delete(gameId)
    logger.info(`Archived game ${gameId} (${game.players.join(' vs ')})`)
  }
})

/**
 * Game management routes - handles game CRUD operations
 */
export const gamesRoutes = new Elysia({ name: 'games', prefix: '/games', tags: ['games'] })
  .head('/', () => new Response(null, { status: 200 }), {
    detail: {
      summary: 'List all games (HEAD)',
      description: 'HEAD request support for games list endpoint.',
      tags: ['games'],
    },
  })
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
    const config = getConfig()
    const game = createGame(id, {
      size: body.size,
      baseWord: body.baseWord,
      players: body.players,
      aiPlayers: body.aiPlayers,
    }, config.game.letterNormalization)
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
  .head('/:id', async ({ params }) => {
    if (!isValidUUID(params.id))
      throw new GameNotFoundError(params.id)
    const game = await store.get(params.id)
    if (!game)
      throw new GameNotFoundError(params.id)
    return new Response(null, { status: 200 })
  }, {
    params: GameIdParamsSchema,
    detail: {
      summary: 'Get game state (HEAD)',
      description: 'HEAD request support for game state endpoint.',
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
    const config = getConfig()
    const res = applyMove(game, body, dictionary, config.game.letterNormalization)
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
  .head('/:id/placements', async ({ params }) => {
    if (!isValidUUID(params.id))
      throw new GameNotFoundError(params.id)
    const game = await store.get(params.id)
    if (!game)
      throw new GameNotFoundError(params.id)
    return new Response(null, { status: 200 })
  }, {
    params: GameIdParamsSchema,
    detail: {
      summary: 'Find valid placements (HEAD)',
      description: 'HEAD request support for placements endpoint.',
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
  .head('/:id/suggest', async ({ params }) => {
    if (!isValidUUID(params.id))
      throw new GameNotFoundError(params.id)
    const game = await store.get(params.id)
    if (!game)
      throw new GameNotFoundError(params.id)
    return new Response(null, { status: 200 })
  }, {
    params: GameIdParamsSchema,
    detail: {
      summary: 'Get AI move suggestions (HEAD)',
      description: 'HEAD request support for suggestions endpoint.',
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
    return suggestWords(game.board, dict, {
      limit,
      usedWords: game.usedWords,
      baseWord: game.baseWord,
    })
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
