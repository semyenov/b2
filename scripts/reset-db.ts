#!/usr/bin/env bun
/**
 * Reset Database Script
 * Drops and recreates the database, then applies migrations
 *
 * Usage:
 *   bun run scripts/reset-db.ts [--confirm]
 */

import { consola } from 'consola'
import postgres from 'postgres'

async function resetDatabase() {
  const args = process.argv.slice(2)
  const confirmed = args.includes('--confirm')

  if (!confirmed) {
    consola.error('❌ Database reset requires confirmation!')
    consola.info('This operation will DROP and RECREATE the database!')
    consola.info('Run with --confirm flag to proceed:')
    consola.info('   bun run scripts/reset-db.ts --confirm')
    process.exit(1)
  }

  const dbUrl = process.env['DATABASE_URL'] || 'postgresql://balda:balda@localhost:5432/balda'
  const postgresUrl = dbUrl.replace(/\/[^/]+$/, '/postgres') // Connect to postgres db

  consola.box('⚠️  DATABASE RESET ⚠️\n\nThis will DROP the balda database!\n\nPress Ctrl+C now to cancel, or wait 3 seconds...')

  await new Promise(resolve => setTimeout(resolve, 3000))

  try {
    // Connect to postgres database to drop/create balda
    const sql = postgres(postgresUrl, { max: 1 })

    consola.start('Terminating active connections...')
    await sql.unsafe(`
      SELECT pg_terminate_backend(pg_stat_activity.pid)
      FROM pg_stat_activity
      WHERE pg_stat_activity.datname = 'balda'
        AND pid <> pg_backend_pid()
    `)
    consola.success('✓ Active connections terminated')

    consola.start('Dropping database...')
    await sql.unsafe('DROP DATABASE IF EXISTS balda')
    consola.success('✓ Database dropped')

    consola.start('Creating database...')
    await sql.unsafe('CREATE DATABASE balda')
    consola.success('✓ Database created')

    await sql.end()

    consola.box('✅ Database reset complete!\n\nNext steps:\n  1. Apply migrations: bun run db:push\n  2. (Optional) Migrate data: bun run migrate:normalize')
  }
  catch (error) {
    consola.error('Database reset failed:', error)
    process.exit(1)
  }
}

resetDatabase()
  .then(() => process.exit(0))
  .catch((error) => {
    consola.error('Unexpected error:', error)
    process.exit(1)
  })
