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
  .derive(({ headers }) => {
    // Extract or generate correlation ID
    const correlationId = headers['x-correlation-id']
      || headers['x-request-id']
      || crypto.randomUUID()

    return { correlationId }
  })
  .onRequest((context: any) => {
    // Type assertion needed: TypeScript can't infer that derive() adds 'correlationId'
    const url = new URL(context.request.url)

    // Skip logging for certain paths
    if (url.pathname === '/favicon.ico' || url.pathname.startsWith('/swagger')) {
      return
    }

    logRequest(context.request.method, url.pathname, context.correlationId)

    // Store start time for duration tracking
    ;(context.request as Request & { startTime?: number }).startTime = Date.now()
  })
  .onAfterResponse((context: any) => {
    // Type assertion needed: TypeScript can't infer that derive() adds 'correlationId'
    const url = new URL(context.request.url)

    // Skip logging for certain paths
    if (url.pathname === '/favicon.ico' || url.pathname.startsWith('/swagger')) {
      return
    }

    const duration = Date.now() - ((context.request as Request & { startTime?: number }).startTime || Date.now())
    const status = typeof context.set.status === 'number' ? context.set.status : 200

    logResponse(context.request.method, url.pathname, status, duration, context.correlationId)
  })
  .onError((context: any) => {
    // Type assertion needed: TypeScript can't infer that derive() adds 'correlationId'
    const url = new URL(context.request.url)

    // Access config lazily
    const config = getConfig()

    // Handle both Error instances and other error types
    const errorInfo = context.error instanceof Error
      ? {
          name: context.error.name,
          message: context.error.message,
          stack: config.server.isProduction ? undefined : context.error.stack,
        }
      : {
          name: 'UnknownError',
          message: String(context.error),
          stack: undefined,
        }

    logger.error(`Error in ${context.request.method} ${url.pathname}`, {
      correlationId: context.correlationId,
      method: context.request.method,
      path: url.pathname,
      error: errorInfo,
    })
  })
