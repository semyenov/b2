/**
 * WebSocket authentication utilities
 * Handles JWT verification for WebSocket connections
 */

import type { JWTPayloadSpec } from '@elysiajs/jwt'
import { getConfig } from '@server/core/config'
import { consola } from 'consola'

export interface AuthenticatedWsData {
  userId: string
  isAuthenticated: boolean
}

/**
 * Extract JWT token from WebSocket URL query parameters
 * Supports both 'token' and 'access_token' query parameters
 */
export function extractTokenFromQuery(url: string): string | null {
  try {
    const urlObj = new URL(url)
    const token = urlObj.searchParams.get('token') || urlObj.searchParams.get('access_token')
    return token
  }
  catch {
    return null
  }
}

/**
 * Verify JWT token and extract user ID
 * Returns null if token is invalid or missing
 */
export async function verifyWsToken(
  token: string | null,
  jwt: {
    verify: (token: string) => Promise<JWTPayloadSpec | false>
  },
): Promise<AuthenticatedWsData | null> {
  if (!token) {
    consola.warn('WebSocket connection attempted without token')
    return null
  }

  try {
    const payload = await jwt.verify(token)

    if (!payload) {
      consola.warn('WebSocket connection attempted with invalid token')
      return null
    }

    // Extract userId from payload
    const userId = typeof payload === 'object' && 'sub' in payload
      ? String(payload.sub)
      : null

    if (!userId) {
      consola.warn('WebSocket token missing user ID')
      return null
    }

    return {
      userId,
      isAuthenticated: true,
    }
  }
  catch (error) {
    consola.error('Error verifying WebSocket token:', error)
    return null
  }
}

/**
 * Check if WebSocket authentication is required
 * Can be disabled in development for easier testing
 */
export function isWsAuthRequired(): boolean {
  const config = getConfig()
  return config.server.nodeEnv === 'production'
}
