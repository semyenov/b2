/**
 * Database error handling utilities
 * Provides classification and handling of PostgreSQL-specific errors
 */

import { consola } from 'consola'

/**
 * PostgreSQL error codes
 * @see https://www.postgresql.org/docs/current/errcodes-appendix.html
 */
export const PgErrorCodes = {
  UNIQUE_VIOLATION: '23505',
  FOREIGN_KEY_VIOLATION: '23503',
  NOT_NULL_VIOLATION: '23502',
  CHECK_VIOLATION: '23514',
  DEADLOCK_DETECTED: '40P01',
  SERIALIZATION_FAILURE: '40001',
  CONNECTION_FAILURE: '08006',
  CONNECTION_EXCEPTION: '08000',
} as const

/**
 * Custom error for database-specific issues
 */
export class DatabaseError extends Error {
  constructor(
    message: string,
    public readonly code?: string,
    public readonly originalError?: unknown,
  ) {
    super(message)
    this.name = 'DatabaseError'
  }
}

/**
 * Error when a unique constraint is violated
 */
export class UniqueViolationError extends DatabaseError {
  constructor(message = 'A record with this value already exists', originalError?: unknown) {
    super(message, PgErrorCodes.UNIQUE_VIOLATION, originalError)
    this.name = 'UniqueViolationError'
  }
}

/**
 * Error when a foreign key constraint is violated
 */
export class ForeignKeyViolationError extends DatabaseError {
  constructor(message = 'Referenced record does not exist', originalError?: unknown) {
    super(message, PgErrorCodes.FOREIGN_KEY_VIOLATION, originalError)
    this.name = 'ForeignKeyViolationError'
  }
}

/**
 * Error when a deadlock is detected
 */
export class DeadlockError extends DatabaseError {
  constructor(message = 'Database deadlock detected', originalError?: unknown) {
    super(message, PgErrorCodes.DEADLOCK_DETECTED, originalError)
    this.name = 'DeadlockError'
  }
}

/**
 * Error when a transaction serialization fails
 */
export class SerializationError extends DatabaseError {
  constructor(message = 'Transaction serialization failure', originalError?: unknown) {
    super(message, PgErrorCodes.SERIALIZATION_FAILURE, originalError)
    this.name = 'SerializationError'
  }
}

/**
 * Error when optimistic locking fails (version mismatch)
 */
export class OptimisticLockError extends DatabaseError {
  constructor(
    message = 'The resource was modified by another process. Please retry.',
    public readonly resourceId?: string,
    public readonly expectedVersion?: number,
  ) {
    super(message, 'OPTIMISTIC_LOCK', undefined)
    this.name = 'OptimisticLockError'
  }
}

/**
 * Check if an error is a PostgreSQL error with a code
 */
function isPgError(error: unknown): error is { code: string, message: string } {
  return (
    typeof error === 'object'
    && error !== null
    && 'code' in error
    && typeof (error as { code: unknown }).code === 'string'
  )
}

/**
 * Classify and wrap PostgreSQL errors into appropriate error types
 */
export function classifyDatabaseError(error: unknown): DatabaseError {
  if (error instanceof DatabaseError) {
    return error
  }

  if (!isPgError(error)) {
    return new DatabaseError(
      error instanceof Error ? error.message : 'Unknown database error',
      undefined,
      error,
    )
  }

  switch (error.code) {
    case PgErrorCodes.UNIQUE_VIOLATION:
      return new UniqueViolationError(error.message, error)

    case PgErrorCodes.FOREIGN_KEY_VIOLATION:
      return new ForeignKeyViolationError(error.message, error)

    case PgErrorCodes.DEADLOCK_DETECTED:
      return new DeadlockError(error.message, error)

    case PgErrorCodes.SERIALIZATION_FAILURE:
      return new SerializationError(error.message, error)

    case PgErrorCodes.NOT_NULL_VIOLATION:
      return new DatabaseError(`Required field is missing: ${error.message}`, error.code, error)

    case PgErrorCodes.CHECK_VIOLATION:
      return new DatabaseError(`Constraint violation: ${error.message}`, error.code, error)

    case PgErrorCodes.CONNECTION_FAILURE:
    case PgErrorCodes.CONNECTION_EXCEPTION:
      return new DatabaseError(`Database connection error: ${error.message}`, error.code, error)

    default:
      return new DatabaseError(error.message, error.code, error)
  }
}

/**
 * Check if an error is retryable (transient failure)
 */
export function isRetryableError(error: unknown): boolean {
  if (!isPgError(error)) {
    return false
  }

  return (
    error.code === PgErrorCodes.DEADLOCK_DETECTED
    || error.code === PgErrorCodes.SERIALIZATION_FAILURE
    || error.code === PgErrorCodes.CONNECTION_FAILURE
    || error.code === PgErrorCodes.CONNECTION_EXCEPTION
  )
}

/**
 * Retry a database operation with exponential backoff
 */
export async function withRetry<T>(
  operation: () => Promise<T>,
  options: {
    maxAttempts?: number
    initialDelay?: number
    maxDelay?: number
    backoffFactor?: number
  } = {},
): Promise<T> {
  const {
    maxAttempts = 3,
    initialDelay = 100,
    maxDelay = 2000,
    backoffFactor = 2,
  } = options

  let lastError: unknown
  let delay = initialDelay

  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    try {
      return await operation()
    }
    catch (error) {
      lastError = error

      // Only retry if it's a retryable error and we have attempts left
      if (!isRetryableError(error) || attempt === maxAttempts) {
        throw classifyDatabaseError(error)
      }

      consola.warn(`Database operation failed (attempt ${attempt}/${maxAttempts}), retrying in ${delay}ms...`, {
        error: error instanceof Error ? error.message : String(error),
      })

      // Wait before retrying
      await new Promise(resolve => setTimeout(resolve, delay))

      // Exponential backoff
      delay = Math.min(delay * backoffFactor, maxDelay)
    }
  }

  // Should never reach here, but TypeScript needs it
  throw classifyDatabaseError(lastError)
}

/**
 * Wrap a database operation with error handling and logging
 */
export async function wrapDatabaseOperation<T>(
  operationName: string,
  operation: () => Promise<T>,
  context?: Record<string, unknown>,
): Promise<T> {
  try {
    return await operation()
  }
  catch (error) {
    const dbError = classifyDatabaseError(error)

    consola.error(`Database operation "${operationName}" failed`, {
      error: dbError.message,
      code: dbError.code,
      ...context,
    })

    throw dbError
  }
}
