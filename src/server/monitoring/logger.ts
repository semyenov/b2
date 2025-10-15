import { consola, createConsola } from 'consola'

const isProduction = process.env['NODE_ENV'] === 'production'
const logLevel = process.env['LOG_LEVEL'] ?? (isProduction ? 'info' : 'debug')
const logFormat = process.env['LOG_FORMAT'] ?? (isProduction ? 'json' : 'pretty')

/**
 * Application logger with structured logging support
 */
export const logger = createConsola({
  level: getLogLevel(logLevel),
  formatOptions: {
    date: true,
    colors: logFormat !== 'json',
    compact: logFormat === 'json',
  },
  reporters: logFormat === 'json'
    ? [
        {
          log(logObj) {
            const { date, type, tag, args, level: _level, ...rest } = logObj
            const logData = {
              timestamp: date?.toISOString(),
              level: type,
              tag,
              message: args.join(' '),
              ...rest,
            }
            // Use process.stdout.write for structured logging to avoid ESLint console rules
            process.stdout.write(`${JSON.stringify(logData)}\n`)
          },
        },
      ]
    : undefined,
})

/**
 * Convert log level string to numeric level
 */
function getLogLevel(level: string): number {
  switch (level.toLowerCase()) {
    case 'debug':
    case '5':
      return 5
    case 'info':
    case '4':
      return 4
    case 'warn':
    case '3':
      return 3
    case 'error':
    case '2':
      return 2
    case 'silent':
    case '0':
      return 0
    default:
      return 4 // default to info
  }
}

/**
 * Create a child logger with a specific tag
 */
export function createLogger(tag: string) {
  return logger.withTag(tag)
}

/**
 * Log request with correlation ID
 */
export function logRequest(method: string, path: string, correlationId?: string) {
  logger.info(`${method} ${path}`, {
    correlationId,
    method,
    path,
  })
}

/**
 * Log response with correlation ID and status
 */
export function logResponse(method: string, path: string, status: number, duration: number, correlationId?: string) {
  const level = status >= 500 ? 'error' : status >= 400 ? 'warn' : 'info'
  logger[level](`${method} ${path} ${status} ${duration}ms`, {
    correlationId,
    method,
    path,
    status,
    duration,
  })
}

/**
 * Log error with correlation ID
 */
export function logError(error: Error, context?: Record<string, unknown>) {
  logger.error(error.message, {
    error: {
      name: error.name,
      message: error.message,
      stack: error.stack,
    },
    ...context,
  })
}

// Export default consola instance for compatibility
export { consola }
