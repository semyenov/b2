import type { GameState } from '../../domain/game/engine'

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
