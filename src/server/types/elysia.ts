import type { AuthUser } from '../auth/jwt'

/**
 * JWT plugin interface
 * Defines the shape of the jwt object added by @elysiajs/jwt
 */
export interface JWTPlugin {
  sign: (payload: Record<string, unknown>) => Promise<string>
  verify: (token: string) => Promise<Record<string, unknown> | false>
}

/**
 * Extended request with custom properties
 */
export interface ExtendedRequest extends Request {
  startTime?: number
}

/**
 * Base Elysia context with common properties
 */
export interface BaseContext {
  request: ExtendedRequest
  set: {
    status?: number | string
    headers: Record<string, string>
  }
  headers: Record<string, string | undefined>
}

/**
 * Context with JWT plugins
 */
export interface JWTContext extends BaseContext {
  jwt: JWTPlugin
  refreshJwt: JWTPlugin
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
