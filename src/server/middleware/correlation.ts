import { getConfig } from '@server/config'
import { Elysia } from 'elysia'
import { logger, logRequest, logResponse } from '../monitoring/logger'

/**
 * Correlation middleware - tracks requests with unique IDs
 * This middleware:
 * - Generates or extracts correlation IDs from headers
 * - Logs requests and responses with correlation IDs
 * - Tracks request duration
 * - Configuration is accessed lazily when needed
 */
export const correlationMiddleware = new Elysia({ name: 'correlation' })
  .onRequest((context) => {
    const { request } = context

    // Extract or generate correlation ID from request headers
    const correlationId = request.headers.get('x-correlation-id')
      || request.headers.get('x-request-id')
      || crypto.randomUUID()

    const url = new URL(request.url)

    // Skip logging for certain paths
    if (url.pathname === '/favicon.ico' || url.pathname.startsWith('/swagger')) {
      return
    }

    logRequest(request.method, url.pathname, correlationId)

    // Store start time for duration tracking
    ;(request as Request & { startTime?: number }).startTime = Date.now()

    // Store correlationId in the request for later use
    ;(request as Request & { correlationId?: string }).correlationId = correlationId
  })
  .onAfterResponse((context) => {
    const { request, set } = context
    const correlationId = (request as Request & { correlationId?: string }).correlationId
    const url = new URL(request.url)

    // Skip logging for certain paths
    if (url.pathname === '/favicon.ico' || url.pathname.startsWith('/swagger')) {
      return
    }

    const duration = Date.now() - ((request as Request & { startTime?: number }).startTime || Date.now())
    const status = typeof set.status === 'number' ? set.status : 200

    logResponse(request.method, url.pathname, status, duration, correlationId)
  })
  .onError((context) => {
    const { request, error } = context
    const correlationId = (request as Request & { correlationId?: string }).correlationId
    const url = new URL(request.url)

    // Access config lazily
    const config = getConfig()

    // Handle both Error instances and other error types
    const errorInfo = error instanceof Error
      ? {
          name: error.name,
          message: error.message,
          stack: config.server.isProduction ? undefined : error.stack,
        }
      : {
          name: 'UnknownError',
          message: String(error),
          stack: undefined,
        }

    logger.error(`Error in ${request.method} ${url.pathname}`, {
      correlationId,
      method: request.method,
      path: url.pathname,
      error: errorInfo,
    })
  })
