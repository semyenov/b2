/**
 * DEPRECATED: File-based user service
 *
 * This file is deprecated and should not be used in new code.
 * Use '../services/userPostgres' instead for PostgreSQL-based storage.
 *
 * To migrate existing users from file storage to PostgreSQL:
 *   bun run migrate:users
 *
 * This file is kept for reference and migration purposes only.
 */

import type { User } from '../models/user'
import bcrypt from 'bcryptjs'
import { createStorage } from 'unstorage'
import fsDriver from 'unstorage/drivers/fs'

// User storage using unstorage with file-system backend (DEPRECATED)
const storage = createStorage({
  driver: fsDriver({
    // TypeScript requires bracket notation for process.env access with noUncheckedIndexedAccess
    base: process.env['STORAGE_DIR'] ?? './data/users',
  }),
})

/**
 * @deprecated Use userService from '../services/userPostgres' instead
 * User service - handles user CRUD operations (FILE-BASED - DEPRECATED)
 */
export const userService = {
  /**
   * Create a new user
   */
  async create(email: string, username: string, password: string): Promise<User> {
    // Check if user with this email already exists
    const existingUserByEmail = await this.findByEmail(email)
    if (existingUserByEmail) {
      throw new Error('User with this email already exists')
    }

    // Check if user with this username already exists
    const existingUserByUsername = await this.findByUsername(username)
    if (existingUserByUsername) {
      throw new Error('User with this username already exists')
    }

    // Hash password
    const saltRounds = 12
    const passwordHash = await bcrypt.hash(password, saltRounds)

    // Create user object
    const now = Date.now()
    const user: User = {
      id: crypto.randomUUID(),
      email: email.toLowerCase(),
      username,
      passwordHash,
      createdAt: now,
      updatedAt: now,
    }

    // Store user
    await storage.setItem(user.id, user)

    // Also store email-to-id and username-to-id mappings for quick lookups
    await storage.setItem(`email:${user.email}`, user.id)
    await storage.setItem(`username:${user.username}`, user.id)

    return user
  },

  /**
   * Find user by ID
   */
  async findById(id: string): Promise<User | null> {
    return await storage.getItem<User>(id)
  },

  /**
   * Find user by email
   */
  async findByEmail(email: string): Promise<User | null> {
    const userId = await storage.getItem<string>(`email:${email.toLowerCase()}`)
    if (!userId)
      return null
    return await storage.getItem<User>(userId)
  },

  /**
   * Find user by username
   */
  async findByUsername(username: string): Promise<User | null> {
    const userId = await storage.getItem<string>(`username:${username}`)
    if (!userId)
      return null
    return await storage.getItem<User>(userId)
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
    const user = await this.findById(id)
    if (!user)
      return null

    const updatedUser: User = {
      ...user,
      ...updates,
      updatedAt: Date.now(),
    }

    await storage.setItem(id, updatedUser)
    return updatedUser
  },

  /**
   * Delete user
   */
  async delete(id: string): Promise<boolean> {
    const user = await this.findById(id)
    if (!user)
      return false

    // Remove user data
    await storage.removeItem(id)
    await storage.removeItem(`email:${user.email}`)
    await storage.removeItem(`username:${user.username}`)

    return true
  },

  /**
   * Get all users (admin only)
   */
  async getAll(): Promise<User[]> {
    const keys = await storage.getKeys()
    const userIds = keys.filter(key => !key.includes(':'))

    const users = await Promise.all(
      userIds.map(async (id) => {
        const user = await storage.getItem<User>(id)
        return user
      }),
    )

    return users.filter((u): u is User => u !== null)
  },
}
