import { consola } from 'consola'
import { shake } from 'radash'

interface ErrorContext {
  [key: string]: unknown
}

/**
 * Base class for all game-related errors with consistent structure
 */
export abstract class GameError extends Error {
  abstract status: number
  context: ErrorContext

  constructor(message: string, context: ErrorContext = {}) {
    super(message)
    this.name = this.constructor.name
    this.context = shake({ ...context, timestamp: Date.now() })
  }

  toResponse() {
    return shake({
      error: this.message,
      type: this.name,
      ...this.context,
    })
  }
}

export class GameNotFoundError extends GameError {
  status = 404

  constructor(gameId: string) {
    super(`Game with id '${gameId}' not found`, { gameId })
  }
}

export class InvalidMoveError extends GameError {
  status = 400

  constructor(message: string, context: ErrorContext = {}) {
    super(message, context)
  }
}

export class InvalidPlacementError extends GameError {
  status = 400

  constructor(message: string, context: ErrorContext = {}) {
    super(message, context)
  }
}

export class InvalidGameConfigurationError extends GameError {
  status = 400

  constructor(message: string, context: ErrorContext = {}) {
    super(message, context)
  }
}

export class DictionaryError extends GameError {
  status = 500

  constructor(message: string, context: ErrorContext = {}) {
    super(message, context)
  }

  toResponse() {
    return shake({
      error: 'Dictionary service error',
      details: this.message,
      ...this.context,
    })
  }
}

export class WebSocketError extends GameError {
  status = 500

  constructor(message: string, context: ErrorContext = {}) {
    super(message, context)
  }
}

/**
 * Utility function to safely handle errors in async operations
 */
export function handleAsyncError<T>(
  operation: () => Promise<T>,
  errorMessage: string,
  _context: ErrorContext = {},
): Promise<T> {
  return operation().catch((error) => {
    consola.error(`[Async Error] ${errorMessage}:`, error)
    throw new Error(`${errorMessage}: ${error.message}`)
  })
}

/**
 * Validation helper functions
 */
export function validateRequired<T>(value: T | null | undefined, fieldName: string): T {
  if (value === null || value === undefined) {
    throw new InvalidMoveError(`${fieldName} is required`, { fieldName })
  }
  return value
}

export function validateStringLength(
  value: string,
  fieldName: string,
  minLength = 1,
  maxLength?: number,
): string {
  if (value.length < minLength) {
    throw new InvalidMoveError(`${fieldName} must be at least ${minLength} characters`, { fieldName, length: value.length })
  }
  if (maxLength && value.length > maxLength) {
    throw new InvalidMoveError(`${fieldName} must be at most ${maxLength} characters`, { fieldName, length: value.length })
  }
  return value
}

export function validateNumberRange(
  value: number,
  fieldName: string,
  min?: number,
  max?: number,
): number {
  if (min !== undefined && value < min) {
    throw new InvalidMoveError(`${fieldName} must be at least ${min}`, { fieldName, value })
  }
  if (max !== undefined && value > max) {
    throw new InvalidMoveError(`${fieldName} must be at most ${max}`, { fieldName, value })
  }
  return value
}
