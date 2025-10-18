import type { AuthUser } from '../auth/jwt'

/**
 * Extended request with custom properties
 */
export interface ExtendedRequest extends Request {
  startTime?: number
}

/**
 * Base Elysia context with common properties
 */
export interface BaseContext extends Record<string, unknown> {
  request: ExtendedRequest
  set: {
    status?: number
    headers: Record<string, string>
  }
  headers: Record<string, string | undefined>
}

/**
 * Context with JWT plugins
 */
export interface JWTContext extends BaseContext {
  jwt: {
    sign: (payload: Record<string, unknown>) => Promise<string>
    verify: (token?: string, options?: unknown) => Promise<Record<string, unknown> | false>
  }
  refreshJwt: {
    sign: (payload: Record<string, unknown>) => Promise<string>
    verify: (token?: string, options?: unknown) => Promise<Record<string, unknown> | false>
  }
}

/**
 * Context with authenticated user
 */
export interface AuthContext extends JWTContext {
  user: AuthUser | null
}

/**
 * Context with correlation ID for request tracking
 */
export interface CorrelationContext extends BaseContext {
  correlationId: string
}

/**
 * Full app context with all plugins
 */
export interface AppContext extends AuthContext, CorrelationContext {
  // All properties are inherited from AuthContext and CorrelationContext
}

/**
 * Context for routes that require authentication
 */
export interface AuthenticatedContext extends AppContext {
  user: AuthUser // Non-null user (enforced by middleware)
}
