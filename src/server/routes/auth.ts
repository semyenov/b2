import type { RefreshTokenPayload } from '../auth/jwt'
import { Elysia } from 'elysia'
import {
  AuthResponseSchema,
  ErrorSchema,
  LoginBodySchema,
  PublicUserSchema,
  RefreshTokenBodySchema,
  RefreshTokenResponseSchema,
  RegisterBodySchema,
} from '../../shared/schemas'
import { generateAccessToken, generateRefreshToken, jwtPlugin } from '../auth/jwt'
import { AuthenticationError } from '../auth/middleware'
import { logger } from '../monitoring/logger'
import { userService } from '../services/user'

/**
 * Authentication routes plugin
 */
export const authPlugin = new Elysia({ name: 'auth', prefix: '/auth', tags: ['auth'] })
  .use(jwtPlugin)
  .error({
    AUTHENTICATION_ERROR: AuthenticationError,
  })
  .onError(({ code, error, set }) => {
    if (code === 'AUTHENTICATION_ERROR') {
      set.status = 401
      return (error as AuthenticationError).toResponse()
    }
    return { error: 'Internal server error' }
  })
  .post('/register', async ({ body, jwt, refreshJwt }) => {
    try {
      // Create user
      const user = await userService.create(body.email, body.username, body.password)

      // Generate tokens
      const token = await generateAccessToken({ jwt: jwt as any }, user)
      const refreshToken = await generateRefreshToken({ refreshJwt: refreshJwt as any }, user.id)

      logger.info(`User registered successfully: ${user.email} (${user.username})`)

      return {
        user: {
          id: user.id,
          email: user.email,
          username: user.username,
          createdAt: user.createdAt,
        },
        token,
        refreshToken,
      }
    }
    catch (error) {
      logger.error('Registration failed:', error)
      throw error
    }
  }, {
    body: RegisterBodySchema,
    response: {
      200: AuthResponseSchema,
      400: ErrorSchema,
    },
    detail: {
      summary: 'Register a new user',
      description: 'Creates a new user account with email and password. Returns an access token and refresh token for authentication.',
      tags: ['auth'],
    },
  })
  .post('/login', async ({ body, jwt, refreshJwt, set }) => {
    // Find user by email
    const user = await userService.findByEmail(body.email)
    if (!user) {
      set.status = 401
      return {
        error: 'Invalid email or password',
      }
    }

    // Verify password
    const isValidPassword = await userService.verifyPassword(user, body.password)
    if (!isValidPassword) {
      set.status = 401
      return {
        error: 'Invalid email or password',
      }
    }

    // Generate tokens
    const token = await generateAccessToken({ jwt: jwt as any }, user)
    const refreshToken = await generateRefreshToken({ refreshJwt: refreshJwt as any }, user.id)

    logger.info(`User logged in successfully: ${user.email} (${user.username})`)

    return {
      user: {
        id: user.id,
        email: user.email,
        username: user.username,
        createdAt: user.createdAt,
      },
      token,
      refreshToken,
    }
  }, {
    body: LoginBodySchema,
    response: {
      200: AuthResponseSchema,
      401: ErrorSchema,
    },
    detail: {
      summary: 'Login with email and password',
      description: 'Authenticates a user with email and password. Returns an access token and refresh token.',
      tags: ['auth'],
    },
  })
  .post('/refresh', async ({ body, refreshJwt, jwt, set }) => {
    try {
      // Verify refresh token
      const refreshBody = body as { refreshToken: string }
      const payload = await refreshJwt.verify(refreshBody.refreshToken) as RefreshTokenPayload | false
      if (!payload) {
        set.status = 401
        return {
          error: 'Invalid refresh token',
        }
      }

      // Find user
      const user = await userService.findById(payload.userId)
      if (!user) {
        set.status = 401
        return {
          error: 'User not found',
        }
      }

      // Generate new access token
      const token = await generateAccessToken({ jwt: jwt as any }, user)

      logger.info(`Token refreshed for user: ${user.email}`)

      return {
        token,
      }
    }
    catch (error) {
      logger.error('Token refresh failed:', error)
      set.status = 401
      return {
        error: 'Invalid refresh token',
      }
    }
  }, {
    body: RefreshTokenBodySchema,
    response: {
      200: RefreshTokenResponseSchema,
      401: ErrorSchema,
    },
    detail: {
      summary: 'Refresh access token',
      description: 'Uses a refresh token to obtain a new access token. Call this when the access token expires.',
      tags: ['auth'],
    },
  })
  .get('/me', async (context: any) => {
    if (!context.user) {
      context.set.status = 401
      throw new AuthenticationError('Authentication required')
    }

    // Find full user details
    const fullUser = await userService.findById(context.user.id)
    if (!fullUser) {
      context.set.status = 404
      return {
        error: 'User not found',
      }
    }

    return {
      id: fullUser.id,
      email: fullUser.email,
      username: fullUser.username,
      createdAt: fullUser.createdAt,
    }
  }, {
    response: {
      200: PublicUserSchema,
      401: ErrorSchema,
      404: ErrorSchema,
    },
    detail: {
      summary: 'Get current user',
      description: 'Returns the currently authenticated user\'s profile. Requires a valid access token in the Authorization header.',
      tags: ['auth'],
    },
  })
