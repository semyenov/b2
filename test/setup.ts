/**
 * Test environment setup
 * This file is loaded before all tests
 */

// Create test storage directory
import { mkdir } from 'node:fs/promises'
import { resolve } from 'node:path' // Use test dictionary

import { afterAll, beforeAll } from 'bun:test'

// Set test environment variables
process.env['NODE_ENV'] = 'test'
process.env['PORT'] = '3099' // Use different port for tests
process.env['STORAGE_DIR'] = './test-data/games' // Use separate storage for tests
process.env['DICT_PATH'] = resolve('./test/fixtures/test-dictionary.txt')

beforeAll(async () => {
  try {
    await mkdir('./test-data/games', { recursive: true })
  }
  catch {
    // Directory might already exist
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
