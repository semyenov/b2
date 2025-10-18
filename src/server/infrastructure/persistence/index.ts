import type { IGameStore } from './interface'
import { consola } from 'consola'

const useDatabaseStorage = Boolean(process.env['DATABASE_URL'])

/**
 * Initialize the appropriate game store based on environment configuration
 * - If DATABASE_URL is set, use PostgreSQL storage
 * - Otherwise, fall back to file-based storage
 */
async function initializeStore(): Promise<IGameStore> {
  if (useDatabaseStorage) {
    consola.info('Using PostgreSQL storage (DATABASE_URL detected)')
    // Dynamic import to avoid loading PostgreSQL dependencies when not needed
    const { postgresStore } = await import('./postgres/gameStore')
    return postgresStore
  }
  else {
    consola.warn('Using file-based storage (DATABASE_URL not set). Consider migrating to PostgreSQL for production.')
    const { FileGameStore } = await import('./file/gameStore')
    return new FileGameStore()
  }
}

// Export the initialized store singleton
export const store = await initializeStore()

// Re-export interface for convenience
export type { IGameStore } from './interface'
