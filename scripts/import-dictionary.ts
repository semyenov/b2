#!/usr/bin/env bun
/**
 * Import dictionary words from file into PostgreSQL
 * Usage: bun run scripts/import-dictionary.ts [dictionary-path] [language]
 */

import { readFile } from 'node:fs/promises'
import { loadConfig } from '@shared/config/server'
import { consola } from 'consola'
import { sift } from 'radash'
import { checkDatabaseConnection, db } from '../src/server/db/client'
import { words } from '../src/server/db/schema'

const DEFAULT_DICT_PATH = './data/dictionaries/russian.txt'
const DEFAULT_LANGUAGE = 'ru'

interface ImportStats {
  total: number
  inserted: number
  skipped: number
  errors: number
}

async function importDictionary(
  filePath: string = DEFAULT_DICT_PATH,
  language: string = DEFAULT_LANGUAGE,
): Promise<void> {
  consola.start(`Importing dictionary from ${filePath} (language: ${language})...`)

  // Load configuration
  await loadConfig()

  // Check database connection
  const connected = await checkDatabaseConnection()
  if (!connected) {
    consola.error('Cannot connect to database. Please ensure PostgreSQL is running and DATABASE_URL is set.')
    process.exit(1)
  }

  const stats: ImportStats = {
    total: 0,
    inserted: 0,
    skipped: 0,
    errors: 0,
  }

  try {
    // Read dictionary file
    const text = await readFile(filePath, 'utf-8')
    const lines = text.split(/\r?\n/g)

    // Validate and normalize words
    const validWords = sift(
      lines.map((line) => {
        const word = line.trim().toUpperCase()
        // Skip empty words or words with spaces/digits
        return word && /^[A-ZА-ЯЁ]+$/.test(word) ? word : null
      }),
    )

    stats.total = validWords.length
    consola.info(`Found ${stats.total} valid words to import`)

    // Batch insert for performance
    const BATCH_SIZE = 500
    const batches = Math.ceil(validWords.length / BATCH_SIZE)

    for (let i = 0; i < batches; i++) {
      const start = i * BATCH_SIZE
      const end = Math.min(start + BATCH_SIZE, validWords.length)
      const batch = validWords.slice(start, end)

      try {
        // Use ON CONFLICT DO NOTHING to skip duplicates
        await db
          .insert(words)
          .values(batch.map(word => ({ word, language })))
          .onConflictDoNothing()

        stats.inserted += batch.length
        consola.info(`Progress: ${stats.inserted}/${stats.total} words (${Math.round((stats.inserted / stats.total) * 100)}%)`)
      }
      catch (error) {
        consola.error(`Failed to insert batch ${i + 1}:`, error)
        stats.errors += batch.length
      }
    }

    // Print summary
    consola.box(
      `Import Summary:

Total words: ${stats.total}
✅ Inserted: ${stats.inserted}
⏭️  Skipped: ${stats.skipped}
❌ Errors: ${stats.errors}`,
    )

    if (stats.inserted > 0) {
      consola.success(`\n🎉 Successfully imported ${stats.inserted} words into PostgreSQL!`)
      consola.info('\nDictionary is now available for database-backed lookups')
    }
  }
  catch (error) {
    consola.error('Import failed:', error)
    process.exit(1)
  }
}

// Parse command line arguments
const dictPath = process.argv[2] || DEFAULT_DICT_PATH
const language = process.argv[3] || DEFAULT_LANGUAGE

// Run import
importDictionary(dictPath, language)
  .then(() => {
    process.exit(0)
  })
  .catch((error) => {
    consola.error('Unexpected error:', error)
    process.exit(1)
  })
