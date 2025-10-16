/**
 * PostgreSQL-based user service
 * Replaces file-based storage with database persistence
 */

import type { User } from '../models/user'
import bcrypt from 'bcryptjs'
import { eq } from 'drizzle-orm'
import { db } from '../db/client'
import { UniqueViolationError, wrapDatabaseOperation } from '../db/errors'
import { users } from '../db/schema'

/**
 * Convert database user to application user model
 * Database uses Date objects, model uses timestamps
 */
function dbUserToModel(dbUser: typeof users.$inferSelect): User {
  return {
    id: dbUser.id,
    email: dbUser.email,
    username: dbUser.username,
    passwordHash: dbUser.passwordHash,
    createdAt: dbUser.createdAt.getTime(),
    updatedAt: dbUser.updatedAt.getTime(),
  }
}

/**
 * User service - handles user CRUD operations with PostgreSQL
 */
export const userService = {
  /**
   * Create a new user
   */
  async create(email: string, username: string, password: string): Promise<User> {
    return wrapDatabaseOperation(
      'user.create',
      async () => {
        // Check if user with this email already exists
        const existingUserByEmail = await this.findByEmail(email)
        if (existingUserByEmail) {
          throw new UniqueViolationError('User with this email already exists')
        }

        // Check if user with this username already exists
        const existingUserByUsername = await this.findByUsername(username)
        if (existingUserByUsername) {
          throw new UniqueViolationError('User with this username already exists')
        }

        // Hash password
        const saltRounds = 12
        const passwordHash = await bcrypt.hash(password, saltRounds)

        // Insert user into database
        const [newUser] = await db
          .insert(users)
          .values({
            email: email.toLowerCase(),
            username,
            passwordHash,
          })
          .returning()

        if (!newUser) {
          throw new Error('Failed to create user')
        }

        return dbUserToModel(newUser)
      },
      { email, username },
    )
  },

  /**
   * Find user by ID
   */
  async findById(id: string): Promise<User | null> {
    return wrapDatabaseOperation(
      'user.findById',
      async () => {
        const [user] = await db
          .select()
          .from(users)
          .where(eq(users.id, id))
          .limit(1)

        if (!user) {
          return null
        }

        return dbUserToModel(user)
      },
      { userId: id },
    )
  },

  /**
   * Find user by email
   */
  async findByEmail(email: string): Promise<User | null> {
    return wrapDatabaseOperation(
      'user.findByEmail',
      async () => {
        const [user] = await db
          .select()
          .from(users)
          .where(eq(users.email, email.toLowerCase()))
          .limit(1)

        if (!user) {
          return null
        }

        return dbUserToModel(user)
      },
      { email },
    )
  },

  /**
   * Find user by username
   */
  async findByUsername(username: string): Promise<User | null> {
    return wrapDatabaseOperation(
      'user.findByUsername',
      async () => {
        const [user] = await db
          .select()
          .from(users)
          .where(eq(users.username, username))
          .limit(1)

        if (!user) {
          return null
        }

        return dbUserToModel(user)
      },
      { username },
    )
  },

  /**
   * Verify user password
   */
  async verifyPassword(user: User, password: string): Promise<boolean> {
    return await bcrypt.compare(password, user.passwordHash)
  },

  /**
   * Update user
   */
  async update(id: string, updates: Partial<Omit<User, 'id' | 'createdAt'>>): Promise<User | null> {
    return wrapDatabaseOperation(
      'user.update',
      async () => {
        // Prepare database updates (exclude timestamp fields that should be auto-managed)
        const dbUpdates: Partial<typeof users.$inferInsert> = {}

        if (updates.email !== undefined) {
          dbUpdates.email = updates.email.toLowerCase()
        }
        if (updates.username !== undefined) {
          dbUpdates.username = updates.username
        }
        if (updates.passwordHash !== undefined) {
          dbUpdates.passwordHash = updates.passwordHash
        }

        // Always update the updatedAt timestamp
        dbUpdates.updatedAt = new Date()

        const [updatedUser] = await db
          .update(users)
          .set(dbUpdates)
          .where(eq(users.id, id))
          .returning()

        if (!updatedUser) {
          return null
        }

        return dbUserToModel(updatedUser)
      },
      { userId: id },
    )
  },

  /**
   * Delete user
   */
  async delete(id: string): Promise<boolean> {
    return wrapDatabaseOperation(
      'user.delete',
      async () => {
        const result = await db
          .delete(users)
          .where(eq(users.id, id))
          .returning({ id: users.id })

        return result.length > 0
      },
      { userId: id },
    )
  },

  /**
   * Get all users (admin only)
   */
  async getAll(): Promise<User[]> {
    return wrapDatabaseOperation(
      'user.getAll',
      async () => {
        const allUsers = await db.select().from(users)
        return allUsers.map(dbUserToModel)
      },
    )
  },

  /**
   * Update user password (with hashing)
   */
  async updatePassword(id: string, newPassword: string): Promise<User | null> {
    const saltRounds = 12
    const passwordHash = await bcrypt.hash(newPassword, saltRounds)

    return this.update(id, { passwordHash })
  },
}
