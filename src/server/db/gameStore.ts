import type { GameState } from '../engine/balda'
import { consola } from 'consola'
import { eq } from 'drizzle-orm'
import { db } from './client'
import { games } from './schema'

/**
 * PostgreSQL-based game store using Drizzle ORM
 * Replaces the file-based storage with database persistence
 */
export class PostgresGameStore {
  /**
   * Get all games from the database
   */
  async getAll(): Promise<GameState[]> {
    try {
      const result = await db.select().from(games)
      return result.map(row => this.rowToGameState(row))
    }
    catch (error) {
      consola.error('Failed to get all games:', error)
      throw error
    }
  }

  /**
   * Get a single game by ID
   */
  async get(id: string): Promise<GameState | null> {
    try {
      const result = await db
        .select()
        .from(games)
        .where(eq(games.id, id))
        .limit(1)

      if (result.length === 0) {
        return null
      }

      return this.rowToGameState(result[0])
    }
    catch (error) {
      consola.error(`Failed to get game ${id}:`, error)
      throw error
    }
  }

  /**
   * Check if a game exists
   */
  async has(id: string): Promise<boolean> {
    try {
      const result = await db
        .select({ id: games.id })
        .from(games)
        .where(eq(games.id, id))
        .limit(1)

      return result.length > 0
    }
    catch (error) {
      consola.error(`Failed to check if game ${id} exists:`, error)
      throw error
    }
  }

  /**
   * Save or update a game
   */
  async set(game: GameState): Promise<void> {
    try {
      const exists = await this.has(game.id)

      if (exists) {
        // Update existing game
        await db
          .update(games)
          .set({
            size: game.size,
            board: game.board,
            players: game.players,
            aiPlayers: game.aiPlayers,
            currentPlayerIndex: game.currentPlayerIndex,
            moves: game.moves,
            scores: game.scores,
            usedWords: game.usedWords,
            updatedAt: new Date(),
          })
          .where(eq(games.id, game.id))
      }
      else {
        // Insert new game
        await db.insert(games).values({
          id: game.id,
          size: game.size,
          board: game.board,
          players: game.players,
          aiPlayers: game.aiPlayers,
          currentPlayerIndex: game.currentPlayerIndex,
          moves: game.moves,
          scores: game.scores,
          usedWords: game.usedWords,
          createdAt: new Date(game.createdAt),
          updatedAt: new Date(),
        })
      }
    }
    catch (error) {
      consola.error(`Failed to save game ${game.id}:`, error)
      throw error
    }
  }

  /**
   * Delete a game by ID
   */
  async delete(id: string): Promise<void> {
    try {
      await db.delete(games).where(eq(games.id, id))
    }
    catch (error) {
      consola.error(`Failed to delete game ${id}:`, error)
      throw error
    }
  }

  /**
   * Clear all games (use with caution!)
   */
  async clear(): Promise<void> {
    try {
      await db.delete(games)
      consola.warn('All games cleared from database')
    }
    catch (error) {
      consola.error('Failed to clear games:', error)
      throw error
    }
  }

  /**
   * Count total number of games
   */
  async count(): Promise<number> {
    try {
      const result = await db.select().from(games)
      return result.length
    }
    catch (error) {
      consola.error('Failed to count games:', error)
      throw error
    }
  }

  /**
   * Get games filtered by a predicate function
   */
  async filter(predicate: (game: GameState) => boolean): Promise<GameState[]> {
    const all = await this.getAll()
    return all.filter(predicate)
  }

  /**
   * Convert database row to GameState
   */
  private rowToGameState(row: typeof games.$inferSelect): GameState {
    return {
      id: row.id,
      size: row.size,
      board: row.board as (string | null)[][],
      players: row.players as string[],
      aiPlayers: row.aiPlayers as string[],
      currentPlayerIndex: row.currentPlayerIndex,
      moves: row.moves as Array<{
        playerId: string
        position: { row: number, col: number }
        letter: string
        word: string
        appliedAt: number
      }>,
      createdAt: row.createdAt.getTime(),
      scores: row.scores as Record<string, number>,
      usedWords: row.usedWords as string[],
    }
  }
}

// Export a singleton instance
export const postgresStore = new PostgresGameStore()
