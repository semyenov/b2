#!/usr/bin/env bun
/**
 * Migration script to transfer games from file-based storage to PostgreSQL
 * Usage: bun run scripts/migrate-to-postgres.ts
 */

import type { GameState } from '../src/server/engine/balda'
import { readdir, readFile, stat } from 'node:fs/promises'
import { consola } from 'consola'
import { checkDatabaseConnection, db } from '../src/server/db/client'
import { games } from '../src/server/db/schema'

const storageDir = process.env.STORAGE_DIR || './data/games'

interface MigrationStats {
  total: number
  success: number
  failed: number
  skipped: number
  errors: Array<{ file: string, error: string }>
}

async function checkStorageDirectory(): Promise<boolean> {
  try {
    const stats = await stat(storageDir)
    return stats.isDirectory()
  }
  catch {
    return false
  }
}

async function migrateGame(game: GameState): Promise<void> {
  await db.insert(games).values({
    id: game.id,
    size: game.size,
    board: game.board,
    players: game.players,
    aiPlayers: game.aiPlayers || [],
    currentPlayerIndex: game.currentPlayerIndex,
    moves: game.moves,
    scores: game.scores,
    usedWords: game.usedWords,
    createdAt: new Date(game.createdAt),
    updatedAt: new Date(),
  })
}

async function migrate(): Promise<void> {
  consola.start('Starting migration from file storage to PostgreSQL...')

  // Check database connection
  const dbConnected = await checkDatabaseConnection()
  if (!dbConnected) {
    consola.error('Cannot connect to database. Please ensure PostgreSQL is running and DATABASE_URL is set.')
    process.exit(1)
  }

  // Check if storage directory exists
  const storageExists = await checkStorageDirectory()
  if (!storageExists) {
    consola.warn(`Storage directory not found: ${storageDir}`)
    consola.info('No files to migrate. Exiting.')
    return
  }

  const stats: MigrationStats = {
    total: 0,
    success: 0,
    failed: 0,
    skipped: 0,
    errors: [],
  }

  try {
    // Read all files from storage directory
    const files = await readdir(storageDir)
    const gameFiles = files.filter(file => !file.startsWith('.'))

    stats.total = gameFiles.length
    consola.info(`Found ${stats.total} game files to migrate`)

    for (const file of gameFiles) {
      try {
        const filePath = `${storageDir}/${file}`
        const content = await readFile(filePath, 'utf-8')

        // Parse game data
        const game = JSON.parse(content) as GameState

        // Validate essential fields
        if (!game.id || !game.board || !game.players) {
          consola.warn(`Skipping invalid game file: ${file}`)
          stats.skipped++
          continue
        }

        // Migrate to PostgreSQL
        await migrateGame(game)

        stats.success++
        consola.success(`Migrated game: ${game.id} (${game.players.join(' vs ')})`)
      }
      catch (error) {
        stats.failed++
        const errorMessage = error instanceof Error ? error.message : String(error)
        stats.errors.push({ file, error: errorMessage })
        consola.error(`Failed to migrate ${file}: ${errorMessage}`)
      }
    }

    // Print migration summary
    consola.box(
      `Migration Summary:

Total files: ${stats.total}
✅ Success: ${stats.success}
❌ Failed: ${stats.failed}
⏭️  Skipped: ${stats.skipped}`,
    )

    if (stats.errors.length > 0) {
      consola.warn('\nErrors encountered:')
      stats.errors.forEach(({ file, error }) => {
        consola.error(`  ${file}: ${error}`)
      })
    }

    if (stats.success > 0) {
      consola.success(`\n🎉 Successfully migrated ${stats.success} games to PostgreSQL!`)
      consola.info('\nYou can now update your .env file to use DATABASE_URL instead of STORAGE_DIR')
      consola.info('Backup recommendation: Keep your ./data/games directory as a backup until you verify the migration')
    }
  }
  catch (error) {
    consola.error('Migration failed:', error)
    process.exit(1)
  }
}

// Run migration
migrate()
  .then(() => {
    process.exit(0)
  })
  .catch((error) => {
    consola.error('Unexpected error:', error)
    process.exit(1)
  })
