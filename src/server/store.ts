import type { Storage } from 'unstorage'
import type { GameState } from './engine/balda'
import { consola } from 'consola'
import { sift } from 'radash'
import { createStorage } from 'unstorage'
import fsDriver from 'unstorage/drivers/fs'

const storageDir = process.env.STORAGE_DIR || './data/games'
const useDatabaseStorage = Boolean(process.env.DATABASE_URL)

/**
 * Game store interface - supports both file-based and PostgreSQL storage
 */
export interface IGameStore {
  getAll: () => Promise<GameState[]>
  get: (id: string) => Promise<GameState | null>
  set: (game: GameState) => Promise<void>
  has: (id: string) => Promise<boolean>
  delete: (id: string) => Promise<void>
  clear: () => Promise<void>
  count: () => Promise<number>
  filter: (predicate: (game: GameState) => boolean) => Promise<GameState[]>
}

/**
 * File-based game store using unstorage with filesystem driver
 * Data is stored in JSON files under STORAGE_DIR (default: ./data/games)
 * @deprecated Use PostgreSQL storage for production
 */
export class FileGameStore implements IGameStore {
  private storage: Storage<GameState>

  constructor() {
    this.storage = createStorage<GameState>({
      driver: fsDriver({
        base: storageDir,
      }),
    })
    consola.info(`File-based game storage initialized at: ${storageDir}`)
  }

  async getAll(): Promise<GameState[]> {
    const keys = await this.storage.getKeys()
    // Use Promise.all for parallel execution instead of sequential map
    const games = await Promise.all(keys.map(key => this.storage.getItem(key)))
    return sift(games)
  }

  async get(id: string): Promise<GameState | null> {
    return await this.storage.getItem(id)
  }

  async set(game: GameState): Promise<void> {
    await this.storage.setItem(game.id, game)
  }

  async has(id: string): Promise<boolean> {
    return await this.storage.hasItem(id)
  }

  async delete(id: string): Promise<void> {
    await this.storage.removeItem(id)
  }

  async clear(): Promise<void> {
    await this.storage.clear()
  }

  async count(): Promise<number> {
    const keys = await this.storage.getKeys()
    return keys.length
  }

  /**
   * Get games filtered by a predicate function
   */
  async filter(predicate: (game: GameState) => boolean): Promise<GameState[]> {
    const all = await this.getAll()
    return all.filter(predicate)
  }
}

/**
 * Initialize the appropriate game store based on environment configuration
 * - If DATABASE_URL is set, use PostgreSQL storage
 * - Otherwise, fall back to file-based storage
 */
async function initializeStore(): Promise<IGameStore> {
  if (useDatabaseStorage) {
    consola.info('Using PostgreSQL storage (DATABASE_URL detected)')
    // Dynamic import to avoid loading PostgreSQL dependencies when not needed
    const { postgresStore } = await import('./db/gameStore')
    return postgresStore
  }
  else {
    consola.warn('Using file-based storage (DATABASE_URL not set). Consider migrating to PostgreSQL for production.')
    return new FileGameStore()
  }
}

export const store = await initializeStore()

// Export legacy class name for backwards compatibility
export const GameStore = FileGameStore
