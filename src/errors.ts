import { shake } from 'radash'

interface ErrorContext {
  [key: string]: unknown
}

export class GameNotFoundError extends Error {
  status = 404
  context: ErrorContext

  constructor(gameId: string) {
    super(`Game with id '${gameId}' not found`)
    this.name = 'GameNotFoundError'
    this.context = shake({ gameId, timestamp: Date.now() })
  }

  toResponse() {
    return shake({ error: this.message, ...this.context })
  }
}

export class InvalidMoveError extends Error {
  status = 400
  context: ErrorContext

  constructor(message: string, context: ErrorContext = {}) {
    super(message)
    this.name = 'InvalidMoveError'
    this.context = shake({ ...context, timestamp: Date.now() })
  }

  toResponse() {
    return shake({ error: this.message, ...this.context })
  }
}

export class InvalidPlacementError extends Error {
  status = 400
  context: ErrorContext

  constructor(message: string, context: ErrorContext = {}) {
    super(message)
    this.name = 'InvalidPlacementError'
    this.context = shake({ ...context, timestamp: Date.now() })
  }

  toResponse() {
    return shake({
      error: this.message,
      ...this.context,
    })
  }
}

export class DictionaryError extends Error {
  status = 500
  context: ErrorContext

  constructor(message: string, context: ErrorContext = {}) {
    super(message)
    this.name = 'DictionaryError'
    this.context = shake({ ...context, timestamp: Date.now() })
  }

  toResponse() {
    return shake({
      error: 'Dictionary service error',
      details: this.message,
      ...this.context,
    })
  }
}
