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
  .derive(({ headers, request }) => {
    const startTime = Date.now()
    const url = new URL(request.url)
    const correlationId = headers['x-correlation-id']
      || headers['x-request-id']
      || crypto.randomUUID()

    return {
      url,
      startTime,
      correlationId,
    }
  })
  .onBeforeHandle((context) => {
    const { request, url, correlationId } = context
    logRequest(request.method, url.pathname, correlationId)
  })
  .onAfterResponse((context) => {
    const { request, set, correlationId, startTime } = context
    const url = new URL(request.url)

    // Skip logging for certain paths
    if (url.pathname === '/favicon.ico' || url.pathname.startsWith('/swagger')) {
      return
    }

    const duration = Date.now() - startTime
    const status = typeof set.status === 'number' ? set.status : 200

    logResponse(request.method, url.pathname, status, duration, correlationId)
  })
  .onError((context) => {
    const { request, error, correlationId } = context
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
