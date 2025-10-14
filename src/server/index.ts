import { cors } from '@elysiajs/cors'
import { consola } from 'consola'
import { Elysia } from 'elysia'
import { DictionaryError, GameNotFoundError, InvalidMoveError, InvalidPlacementError } from './errors'
import { registerRoutes } from './routes'
import { GameIdParamsSchema } from '../shared/schemas'
import { addClient, removeClient } from './wsHub'

const port = Number(process.env.PORT ?? 3000)
const isProduction = process.env.NODE_ENV === 'production'

const app = new Elysia()
  .use(cors({
    origin: true,
    credentials: true,
  }))
  .error({
    GAME_NOT_FOUND: GameNotFoundError,
    INVALID_MOVE: InvalidMoveError,
    INVALID_PLACEMENT: InvalidPlacementError,
    DICTIONARY_ERROR: DictionaryError,
  })
  .onRequest(({ request }) => {
    consola.info(`${request.method} ${new URL(request.url).pathname}`)
  })
  .onError(({ code, error, set }) => {
    // Log all errors for debugging
    consola.error(`[${code}]`, error)

    // Handle validation errors with detailed feedback
    if (code === 'VALIDATION') {
      set.status = 400
      return {
        error: 'Validation failed',
        details: isProduction ? undefined : error.all,
      }
    }

    // Handle custom domain errors
    if (code === 'GAME_NOT_FOUND') {
      set.status = 404
      return error.toResponse()
    }

    if (code === 'INVALID_MOVE' || code === 'INVALID_PLACEMENT') {
      set.status = 400
      return error.toResponse()
    }

    if (code === 'DICTIONARY_ERROR') {
      set.status = 500
      return error.toResponse()
    }

    // Handle 404 Not Found
    if (code === 'NOT_FOUND') {
      set.status = 404
      return { error: 'Route not found' }
    }

    // Generic error handler
    set.status = 500
    return {
      error: 'Internal server error',
      details: isProduction ? undefined : String(error),
    }
  })
  .get('/favicon.ico', () => new Response('', { status: 204 }))
  .get('/', () => ({ status: 'ok' }))
  .ws('/games/:id/ws', {
    params: GameIdParamsSchema,
    open(ws) {
      const id = ws.data.params.id
      consola.info(`WebSocket client connected to game ${id}`)
      addClient(id, ws)
    },
    message(_ws, _message) {
      // no-op; server-initiated broadcast happens on moves
    },
    close(ws) {
      removeClient(ws)
      consola.info('WebSocket client disconnected')
    },
  })
  .use(registerRoutes)
  .listen(port)

consola.box(
  `🦊 Elysia is running at ${app.server?.hostname}:${app.server?.port}`,
)
