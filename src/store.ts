import type { Storage } from 'unstorage'
import type { GameState } from './engine/balda'
import { consola } from 'consola'
import { map, sift } from 'radash'
import { createStorage } from 'unstorage'
import fsDriver from 'unstorage/drivers/fs'

const storageDir = process.env.STORAGE_DIR || './data/games'

/**
 * Persistent game store using unstorage with filesystem driver
 * Data is stored in JSON files under STORAGE_DIR (default: ./data/games)
 */
export class GameStore {
  private storage: Storage<GameState>

  constructor() {
    this.storage = createStorage<GameState>({
      driver: fsDriver({
        base: storageDir,
      }),
    })
    consola.info(`Game storage initialized at: ${storageDir}`)
  }

  async getAll(): Promise<GameState[]> {
    const keys = await this.storage.getKeys()
    const games = await map(keys, async key => await this.storage.getItem(key))
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

export const store = new GameStore()
