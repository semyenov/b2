import { Type } from '@sinclair/typebox'

/**
 * User model - represents a registered user in the system
 */
export interface User {
  id: string
  email: string
  username: string
  passwordHash: string
  createdAt: number
  updatedAt: number
}

/**
 * TypeBox schemas for user-related types
 */

export const UserSchema = Type.Object({
  id: Type.String(),
  email: Type.String({ format: 'email' }),
  username: Type.String({ minLength: 3, maxLength: 20 }),
  passwordHash: Type.String(),
  createdAt: Type.Integer(),
  updatedAt: Type.Integer(),
})

export const PublicUserSchema = Type.Object({
  id: Type.String(),
  email: Type.String({ format: 'email' }),
  username: Type.String(),
  createdAt: Type.Integer(),
})

export const RegisterBodySchema = Type.Object({
  email: Type.String({
    format: 'email',
    error: 'Invalid email format',
  }),
  username: Type.String({
    minLength: 3,
    maxLength: 20,
    pattern: '^[a-zA-Z0-9_-]+$',
    error: 'Username must be 3-20 characters and contain only letters, numbers, underscores, and hyphens',
  }),
  password: Type.String({
    minLength: 8,
    error: 'Password must be at least 8 characters',
  }),
})

export const LoginBodySchema = Type.Object({
  email: Type.String({
    format: 'email',
    error: 'Invalid email format',
  }),
  password: Type.String({
    minLength: 1,
    error: 'Password is required',
  }),
})

export const AuthResponseSchema = Type.Object({
  user: PublicUserSchema,
  token: Type.String(),
  refreshToken: Type.String(),
})
