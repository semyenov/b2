import { cors } from '@elysiajs/cors'
import { swagger } from '@elysiajs/swagger'
import { Elysia } from 'elysia'
import { rateLimit } from 'elysia-rate-limit'
import { GameIdParamsSchema } from '../shared/schemas'
import { jwtPlugin } from './auth/jwt'
import { AuthenticationError, AuthorizationError } from './auth/middleware'
import { DictionaryError, GameNotFoundError, InvalidMoveError, InvalidPlacementError } from './errors'
import { correlationMiddleware } from './middleware/correlation'
import { logger } from './monitoring/logger'
import { registerRoutes } from './routes'
import { addClient, removeClient } from './wsHub'

const port = Number(process.env['PORT'] ?? 3000)
const isProduction = process.env['NODE_ENV'] === 'production'

// Check database connection on startup if DATABASE_URL is configured
await (async () => {
  if (process.env['DATABASE_URL']) {
    const { checkDatabaseConnection } = await import('./db/client')
    const connected = await checkDatabaseConnection()
    if (!connected) {
      logger.error('Failed to connect to database. Exiting...')
      process.exit(1)
    }
  }
})()

const app = new Elysia()
  .use(correlationMiddleware)
  .use(rateLimit({
    duration: 60000, // 1 minute window
    max: 100, // 100 requests per minute per IP
    errorResponse: 'Too many requests, please try again later',
    // Don't rate limit health check and swagger endpoints
    skip: (request) => {
      const pathname = new URL(request.url).pathname
      return pathname === '/health' || pathname.startsWith('/swagger')
    },
  }))
  .use(cors({
    origin: true,
    credentials: true,
  }))
  .use(jwtPlugin)
  .use(swagger({
    documentation: {
      info: {
        title: 'Balda Game API',
        version: '1.0.0',
        description: 'REST API for Balda word game - a Russian word-building game where players take turns adding letters to a grid and forming new words using the placed letters.',
        contact: {
          name: 'API Support',
          url: 'https://github.com/semyenov/balda',
        },
        license: {
          name: 'MIT',
          url: 'https://opensource.org/licenses/MIT',
        },
      },
      tags: [
        { name: 'health', description: 'Health check endpoints' },
        { name: 'auth', description: 'Authentication and authorization endpoints' },
        { name: 'dictionary', description: 'Dictionary and word validation endpoints' },
        { name: 'games', description: 'Game management and gameplay endpoints' },
      ],
      servers: [
        { url: 'http://localhost:3000', description: 'Development server' },
        { url: 'https://api.balda.example.com', description: 'Production server' },
      ],
    },
    path: '/swagger',
    exclude: ['/swagger', '/swagger/json'],
  }))
  .error({
    GAME_NOT_FOUND: GameNotFoundError,
    INVALID_MOVE: InvalidMoveError,
    INVALID_PLACEMENT: InvalidPlacementError,
    DICTIONARY_ERROR: DictionaryError,
    AUTHENTICATION_ERROR: AuthenticationError,
    AUTHORIZATION_ERROR: AuthorizationError,
  })
  .onError(({ code, error, set }) => {
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

    if (code === 'AUTHENTICATION_ERROR') {
      set.status = 401
      return error.toResponse()
    }

    if (code === 'AUTHORIZATION_ERROR') {
      set.status = 403
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
      logger.info(`WebSocket client connected to game ${id}`)
      addClient(id, ws)
    },
    message(_ws, _message) {
      // no-op; server-initiated broadcast happens on moves
    },
    close(ws) {
      removeClient(ws)
      logger.info('WebSocket client disconnected')
    },
  })
  .use(registerRoutes)
  .listen(port)

logger.box(
  `🦊 Elysia is running at ${app.server?.hostname}:${app.server?.port}\n📚 Swagger API docs: ${app.server?.hostname}:${app.server?.port}/swagger`,
)
