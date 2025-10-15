#!/usr/bin/env bun
/**
 * Rollback Script - Normalized Schema → Denormalized JSONB
 *
 * This script allows rolling back to the old denormalized schema if needed.
 * USE WITH CAUTION - This will drop the normalized tables!
 *
 * Usage:
 *   bun run scripts/rollback-normalized-db.ts [--confirm]
 *
 * IMPORTANT:
 * - Requires --confirm flag to execute (safety measure)
 * - Will NOT restore old JSONB columns (they should still exist)
 * - Only drops the new normalized tables (game_players, moves, game_words)
 * - Make sure you have a database backup before running!
 */

import { consola } from 'consola'
import { db } from '../src/server/db/client'

async function rollback() {
  const args = process.argv.slice(2)
  const confirmed = args.includes('--confirm')

  if (!confirmed) {
    consola.error('❌ Rollback requires confirmation!')
    consola.info('This operation will drop the normalized tables (game_players, moves, game_words)')
    consola.info('Run with --confirm flag to proceed:')
    consola.info('   bun run scripts/rollback-normalized-db.ts --confirm')
    process.exit(1)
  }

  consola.box('⚠️  DATABASE ROLLBACK ⚠️\n\nThis will drop normalized tables:\n• game_players\n• moves\n• game_words\n\nPress Ctrl+C now to cancel, or wait 5 seconds...')

  // 5 second delay to allow cancellation
  await new Promise(resolve => setTimeout(resolve, 5000))

  try {
    consola.start('Rolling back database schema...')

    // Drop tables in reverse dependency order
    await db.execute('DROP TABLE IF EXISTS game_words CASCADE')
    consola.success('✓ Dropped game_words table')

    await db.execute('DROP TABLE IF EXISTS moves CASCADE')
    consola.success('✓ Dropped moves table')

    await db.execute('DROP TABLE IF EXISTS game_players CASCADE')
    consola.success('✓ Dropped game_players table')

    // Remove new columns from games table
    await db.execute('ALTER TABLE games DROP COLUMN IF EXISTS base_word')
    await db.execute('ALTER TABLE games DROP COLUMN IF EXISTS status')
    await db.execute('ALTER TABLE games DROP COLUMN IF EXISTS finished_at')
    consola.success('✓ Removed new columns from games table')

    consola.box('✅ Rollback complete!\n\nNormalized tables have been dropped.\nOld JSONB columns should still be intact.\n\nVerify your database state before proceeding.')
  }
  catch (error) {
    consola.error('Rollback failed:', error)
    process.exit(1)
  }
}

// Run rollback
rollback()
  .then(() => process.exit(0))
  .catch((error) => {
    consola.error('Unexpected error:', error)
    process.exit(1)
  })
