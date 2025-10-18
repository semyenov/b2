import { cors } from '@elysiajs/cors'
import { swagger } from '@elysiajs/swagger'
import { loadConfig } from '@server/core/config'
import { GameIdParamsSchema } from '@shared/schemas'
import { Elysia } from 'elysia'
import { rateLimit } from 'elysia-rate-limit'
import { createJwtPlugin } from './auth/jwt'
import { AuthenticationError, AuthorizationError } from './auth/middleware'
import { extractTokenFromQuery, isWsAuthRequired, verifyWsToken } from './auth/wsAuth'
import { logger } from './core/monitoring/logger'
import { DictionaryError, GameNotFoundError, InvalidMoveError, InvalidPlacementError } from './domain/errors'
import { addClient, removeClient } from './infrastructure/websocket/hub'
import { correlationMiddleware } from './presentation/http/middleware/correlation'
import { registerRoutes } from './routes'

// Load configuration on startup
const config = await loadConfig()

// Check database connection on startup
await (async () => {
  if (config.database.url) {
    const { checkDatabaseConnection } = await import('./infrastructure/persistence/postgres/client')
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
    duration: config.rateLimit.duration,
    max: config.rateLimit.max,
    errorResponse: 'Too many requests, please try again later',
    // Don't rate limit health check and swagger endpoints
    skip: (request) => {
      const pathname = new URL(request.url).pathname
      return pathname === '/health' || pathname.startsWith('/swagger')
    },
  }))
  .use(cors({
    origin: config.cors.origin,
    credentials: config.cors.credentials,
  }))
  .use(createJwtPlugin())
  .use(config.swagger.enabled
    ? swagger({
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
            { url: `http://${config.server.host}:${config.server.port}`, description: 'Development server' },
            { url: 'https://api.balda.example.com', description: 'Production server' },
          ],
        },
        path: config.swagger.path,
        exclude: [config.swagger.path, `${config.swagger.path}/json`],
      })
    : new Elysia())
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
        details: config.server.isProduction ? undefined : error.all,
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
      details: config.server.isProduction ? undefined : String(error),
    }
  })
  .get('/favicon.ico', () => new Response('', { status: 204 }))
  .get('/', () => ({ status: 'ok' }))
  .ws('/games/:id/ws', {
    params: GameIdParamsSchema,
    async open(ws) {
      const id = ws.data.params.id
      const authRequired = isWsAuthRequired()

      // Extract and verify JWT token from query parameters
      const token = extractTokenFromQuery(ws.data.request.url)

      // @ts-expect-error - Elysia context complexity with JWT
      const authData = await verifyWsToken(token, this.jwt)

      // In production, require authentication
      if (authRequired && !authData) {
        logger.warn(`Unauthorized WebSocket connection attempt to game ${id}`)
        ws.close(1008, 'Unauthorized: Valid JWT token required')
        return
      }

      // Log connection with auth status
      if (authData) {
        logger.info(`WebSocket client connected to game ${id} (user: ${authData.userId})`)
      }
      else {
        logger.info(`WebSocket client connected to game ${id} (unauthenticated - development mode)`)
      }

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
  .listen(config.server.port)

const swaggerInfo = config.swagger.enabled
  ? `\n📚 Swagger API docs: ${app.server?.hostname}:${app.server?.port}${config.swagger.path}`
  : ''

logger.box(
  `🦊 Elysia is running at ${app.server?.hostname}:${app.server?.port}${swaggerInfo}`,
)
