/**
 * Test environment setup
 * This file is loaded before all tests
 */

import { afterAll, beforeAll } from 'bun:test'
// Create test storage directory
import { mkdir } from 'node:fs/promises'

import { resolve } from 'node:path' // Use test dictionary

// Set test environment variables
process.env['NODE_ENV'] = 'test'
process.env['PORT'] = '3099' // Use different port for tests
process.env['STORAGE_DIR'] = './test-data/games' // Use separate storage for tests
process.env['DICT_PATH'] = resolve('./test/fixtures/test-dictionary.txt')

// Disable DATABASE_URL for tests to use file-based storage
delete process.env['DATABASE_URL']

beforeAll(async () => {
  try {
    await mkdir('./test-data/games', { recursive: true })

    // Load configuration for tests
    const { loadConfig } = await import('../src/server/config')
    await loadConfig()
  }
  catch (error) {
    console.error('Failed to initialize test environment:', error)
    throw error
  }
})

afterAll(async () => {
  // Clean up test data
  try {
    const { rm } = await import('node:fs/promises')
    await rm('./test-data', { recursive: true, force: true })
  }
  catch {
    // Ignore cleanup errors
  }
})
