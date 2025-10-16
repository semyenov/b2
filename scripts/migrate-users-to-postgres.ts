#!/usr/bin/env bun

/**
 * Migration script: File-based user storage → PostgreSQL
 *
 * This script migrates users from the old file-based storage (unstorage)
 * to the new PostgreSQL-based storage system.
 *
 * Usage:
 *   bun run scripts/migrate-users-to-postgres.ts
 *
 * Prerequisites:
 *   - DATABASE_URL environment variable must be set
 *   - PostgreSQL database must be running
 *   - Drizzle migrations must be applied (bun run db:migrate)
 */

import { consola } from 'consola'
import { createStorage } from 'unstorage'
import fsDriver from 'unstorage/drivers/fs'
import { db } from '../src/server/db/client'
import { users } from '../src/server/db/schema'

interface LegacyUser {
  id: string
  email: string
  username: string
  passwordHash: string
  createdAt: number
  updatedAt: number
}

async function main() {
  consola.start('Starting user migration from file storage to PostgreSQL...')

  // Check if DATABASE_URL is set
  if (!process.env['DATABASE_URL']) {
    consola.error('DATABASE_URL environment variable is not set!')
    consola.info('Please set DATABASE_URL and try again.')
    consola.info('Example: DATABASE_URL=postgresql://user:password@localhost:5432/balda')
    process.exit(1)
  }

  // Create file storage instance (read-only)
  const storageDir = process.env['STORAGE_DIR'] ?? './data/users'
  consola.info(`Reading users from: ${storageDir}`)

  const storage = createStorage({
    driver: fsDriver({
      base: storageDir,
    }),
  })

  try {
    // Get all keys from file storage
    const keys = await storage.getKeys()
    consola.info(`Found ${keys.length} total keys in storage`)

    // Filter for user IDs (not email: or username: mappings)
    const userIds = keys.filter(key => !key.includes(':'))
    consola.info(`Found ${userIds.length} users to migrate`)

    if (userIds.length === 0) {
      consola.success('No users found to migrate. Exiting.')
      return
    }

    // Fetch all users from file storage
    const legacyUsers: LegacyUser[] = []
    for (const id of userIds) {
      const user = await storage.getItem<LegacyUser>(id)
      if (user) {
        legacyUsers.push(user)
      }
    }

    consola.info(`Successfully loaded ${legacyUsers.length} users from file storage`)

    // Check which users already exist in PostgreSQL
    const existingEmails = new Set<string>()
    const existingUsernames = new Set<string>()

    const existingUsers = await db.select({ email: users.email, username: users.username }).from(users)
    for (const user of existingUsers) {
      existingEmails.add(user.email.toLowerCase())
      existingUsernames.add(user.username)
    }

    consola.info(`Found ${existingUsers.length} existing users in PostgreSQL`)

    // Migrate users
    let migratedCount = 0
    let skippedCount = 0
    const errors: Array<{ user: string, error: string }> = []

    for (const legacyUser of legacyUsers) {
      // Check for conflicts
      if (existingEmails.has(legacyUser.email.toLowerCase())) {
        consola.warn(`Skipping user ${legacyUser.username} - email already exists: ${legacyUser.email}`)
        skippedCount++
        continue
      }

      if (existingUsernames.has(legacyUser.username)) {
        consola.warn(`Skipping user ${legacyUser.username} - username already exists`)
        skippedCount++
        continue
      }

      try {
        // Insert user into PostgreSQL
        // Convert timestamp (number) to Date
        await db.insert(users).values({
          id: legacyUser.id,
          email: legacyUser.email.toLowerCase(),
          username: legacyUser.username,
          passwordHash: legacyUser.passwordHash,
          createdAt: new Date(legacyUser.createdAt),
          updatedAt: new Date(legacyUser.updatedAt),
        })

        consola.success(`✓ Migrated user: ${legacyUser.username} (${legacyUser.email})`)
        migratedCount++

        // Add to existing sets to prevent duplicates in the same run
        existingEmails.add(legacyUser.email.toLowerCase())
        existingUsernames.add(legacyUser.username)
      }
      catch (error) {
        const errorMsg = error instanceof Error ? error.message : String(error)
        consola.error(`✗ Failed to migrate user ${legacyUser.username}: ${errorMsg}`)
        errors.push({
          user: `${legacyUser.username} (${legacyUser.email})`,
          error: errorMsg,
        })
      }
    }

    // Summary
    consola.box(`
Migration Summary
─────────────────
Total users found: ${legacyUsers.length}
Successfully migrated: ${migratedCount}
Skipped (already exists): ${skippedCount}
Errors: ${errors.length}
    `)

    if (errors.length > 0) {
      consola.warn('Errors encountered:')
      for (const { user, error } of errors) {
        consola.error(`  - ${user}: ${error}`)
      }
    }

    if (migratedCount > 0) {
      consola.success(`Migration completed! ${migratedCount} users migrated successfully.`)
      consola.info('\nNext steps:')
      consola.info('1. Verify the migrated users in PostgreSQL')
      consola.info('2. Test user authentication with the new system')
      consola.info('3. If everything works, you can remove the old file storage directory')
      consola.info(`   Directory: ${storageDir}`)
    }
    else {
      consola.info('No users were migrated.')
    }
  }
  catch (error) {
    consola.error('Migration failed with error:', error)
    process.exit(1)
  }
}

// Run migration
main().catch((error) => {
  consola.fatal('Unhandled error:', error)
  process.exit(1)
})
