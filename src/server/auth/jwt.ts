import type { User } from '../models/user'
import { jwt } from '@elysiajs/jwt'
import { getConfig } from '@shared/config/server'
import { Elysia } from 'elysia'

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
 * Create JWT authentication plugin for Elysia
 * Adds JWT signing/verification and extracts user from Authorization header
 *
 * Must be called after loadConfig() to access JWT configuration
 *
 * @returns Elysia plugin with JWT authentication
 */
export function createJwtPlugin() {
  const config = getConfig()

  return new Elysia({ name: 'jwt-auth' })
    .use(jwt({
      name: 'jwt',
      alg: 'HS256',
      secret: config.jwt.secret,
      exp: config.jwt.accessTokenExpiry,
    }))
    .use(jwt({
      name: 'refreshJwt',
      alg: 'HS256',
      secret: config.jwt.refreshSecret,
      exp: config.jwt.refreshTokenExpiry,
    }))
    .derive(async ({ jwt, headers }) => {
      const auth = headers['authorization']
      if (!auth?.startsWith('Bearer ')) {
        return { user: null }
      }

      const token = auth.slice(7)
      try {
        const payload = await jwt.verify(token) as JWTPayload | false
        if (!payload) {
          return { user: null }
        }

        return {
          user: {
            id: payload.userId,
            email: payload.email,
            username: payload.username,
          },
        }
      }
      catch {
        return { user: null }
      }
    })
}

/**
 * Generate access token for user
 */
export async function generateAccessToken(app: { jwt: { sign: (payload: Record<string, unknown>) => Promise<string> } }, user: Pick<User, 'id' | 'email' | 'username'>): Promise<string> {
  const payload = {
    userId: user.id,
    email: user.email,
    username: user.username,
  }
  return await app.jwt.sign(payload)
}

/**
 * Generate refresh token for user
 */
export async function generateRefreshToken(app: { refreshJwt: { sign: (payload: Record<string, unknown>) => Promise<string> } }, userId: string): Promise<string> {
  const payload = {
    userId,
  }
  return await app.refreshJwt.sign(payload)
}
