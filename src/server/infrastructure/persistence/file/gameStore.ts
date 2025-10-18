import type { Storage } from 'unstorage'
import type { GameState } from '../../../domain/game/engine'
import type { IGameStore } from '../interface'
import { consola } from 'consola'
import { sift } from 'radash'
import { createStorage } from 'unstorage'
import fsDriver from 'unstorage/drivers/fs'

// TypeScript requires bracket notation for process.env access with noUncheckedIndexedAccess
const storageDir = process.env['STORAGE_DIR'] || './data/games'

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
