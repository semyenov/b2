import { Elysia } from 'elysia'
import { jwtPlugin } from './jwt'

/**
 * Authentication error
 */
export class AuthenticationError extends Error {
  constructor(message = 'Authentication required') {
    super(message)
    this.name = 'AuthenticationError'
  }

  toResponse() {
    return {
      error: this.message,
    }
  }
}

/**
 * Authorization error
 */
export class AuthorizationError extends Error {
  constructor(message = 'Insufficient permissions') {
    super(message)
    this.name = 'AuthorizationError'
  }

  toResponse() {
    return {
      error: this.message,
    }
  }
}

/**
 * Authentication middleware - ensures user is logged in
 * Use this to protect routes that require authentication
 */
export const authMiddleware = new Elysia({ name: 'auth-middleware' })
  .use(jwtPlugin)
  .error({
    AUTHENTICATION_ERROR: AuthenticationError,
    AUTHORIZATION_ERROR: AuthorizationError,
  })
  .onBeforeHandle((context: any) => {
    if (!context.user) {
      context.set.status = 401
      throw new AuthenticationError('Authentication required. Please login.')
    }
  })

/**
 * Optional authentication middleware - extracts user if present but doesn't require it
 */
export const optionalAuthMiddleware = new Elysia({ name: 'optional-auth-middleware' })
  .use(jwtPlugin)
  .derive((context: any) => {
    return { currentUser: context.user ?? null }
  })
