import type { User } from '../models/user'
import type { JWTPlugin } from '../types/elysia'
import { jwt } from '@elysiajs/jwt'
import { Elysia } from 'elysia'
import { logger } from '../monitoring/logger'

// JWT secret from environment
const JWT_SECRET = process.env.JWT_SECRET ?? 'change-me-in-production'
const JWT_REFRESH_SECRET = process.env.JWT_REFRESH_SECRET ?? 'change-me-refresh-in-production'

if (JWT_SECRET === 'change-me-in-production') {
  logger.warn('Using default JWT_SECRET. Please set JWT_SECRET environment variable in production!')
}

/**
 * JWT payload interface
 */
export interface JWTPayload {
  userId: string
  email: string
  username: string
  iat?: number
  exp?: number
}

/**
 * Refresh token payload interface
 */
export interface RefreshTokenPayload {
  userId: string
  iat?: number
  exp?: number
}

/**
 * User object extracted from JWT
 */
export interface AuthUser {
  id: string
  email: string
  username: string
}

/**
 * JWT authentication plugin for Elysia
 * Adds JWT signing/verification and extracts user from Authorization header
 */
export const jwtPlugin = new Elysia({ name: 'jwt-auth' })
  .use(jwt({
    name: 'jwt',
    secret: JWT_SECRET,
    exp: '1h', // Access token expires in 1 hour
  }))
  .use(jwt({
    name: 'refreshJwt',
    secret: JWT_REFRESH_SECRET,
    exp: '7d', // Refresh token expires in 7 days
  }))
  .derive(async ({ jwt, headers }) => {
    const auth = headers.authorization
    if (!auth?.startsWith('Bearer ')) {
      return { user: null as AuthUser | null }
    }

    const token = auth.slice(7)
    try {
      const payload = await jwt.verify(token) as JWTPayload | false
      if (!payload) {
        return { user: null as AuthUser | null }
      }

      return {
        user: {
          id: payload.userId,
          email: payload.email,
          username: payload.username,
        } as AuthUser,
      }
    }
    catch (error) {
      logger.error('JWT verification failed:', error)
      return { user: null as AuthUser | null }
    }
  })

/**
 * Generate access token for user
 */
export async function generateAccessToken(app: { jwt: JWTPlugin }, user: Pick<User, 'id' | 'email' | 'username'>): Promise<string> {
  const payload: Record<string, unknown> & JWTPayload = {
    userId: user.id,
    email: user.email,
    username: user.username,
  }
  return await app.jwt.sign(payload)
}

/**
 * Generate refresh token for user
 */
export async function generateRefreshToken(app: { refreshJwt: JWTPlugin }, userId: string): Promise<string> {
  const payload: Record<string, unknown> & RefreshTokenPayload = {
    userId,
  }
  return await app.refreshJwt.sign(payload)
}
