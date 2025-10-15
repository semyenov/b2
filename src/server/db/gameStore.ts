import type { AppliedMove, GameState } from '../engine/balda'
import { consola } from 'consola'
import { desc, eq } from 'drizzle-orm'
import { db } from './client'
import { gamePlayers, games, gameWords, moves } from './schema'

/**
 * PostgreSQL-based game store using Drizzle ORM with normalized schema
 * Uses JOINs to reconstruct GameState from relational tables
 */
export class PostgresGameStore {
  /**
   * Get all games from the database (with full state reconstruction)
   */
  async getAll(): Promise<GameState[]> {
    try {
      const allGames = await db.select().from(games)
      const gameStates: GameState[] = []

      for (const game of allGames) {
        const state = await this.get(game.id)
        if (state) {
          gameStates.push(state)
        }
      }

      return gameStates
    }
    catch (error) {
      consola.error('Failed to get all games:', error)
      throw error
    }
  }

  /**
   * Get a single game by ID with all related data (players, moves, words)
   */
  async get(id: string): Promise<GameState | null> {
    try {
      // Get game record
      const [game] = await db
        .select()
        .from(games)
        .where(eq(games.id, id))
        .limit(1)

      if (!game) {
        return null
      }

      // Get players ordered by playerIndex
      const players = await db
        .select()
        .from(gamePlayers)
        .where(eq(gamePlayers.gameId, id))
        .orderBy(gamePlayers.playerIndex)

      // Get moves ordered by moveNumber
      const gameMoves = await db
        .select({
          id: moves.id,
          gamePlayerId: moves.gamePlayerId,
          positionRow: moves.positionRow,
          positionCol: moves.positionCol,
          letter: moves.letter,
          word: moves.word,
          score: moves.score,
          moveNumber: moves.moveNumber,
          createdAt: moves.createdAt,
        })
        .from(moves)
        .where(eq(moves.gameId, id))
        .orderBy(moves.moveNumber)

      // Get used words
      const words = await db
        .select({ word: gameWords.word })
        .from(gameWords)
        .where(eq(gameWords.gameId, id))

      // Reconstruct GameState
      return this.reconstructGameState(game, players, gameMoves, words)
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
   * Save or update a game (handles normalized structure)
   * This is a complex operation that updates multiple tables in a transaction
   */
  async set(game: GameState): Promise<void> {
    try {
      await db.transaction(async (tx) => {
        const exists = await this.has(game.id)

        if (exists) {
          // Update existing game
          await tx
            .update(games)
            .set({
              size: game.size,
              board: game.board,
              currentPlayerIndex: game.currentPlayerIndex,
              updatedAt: new Date(),
              status: this.calculateStatus(game),
            })
            .where(eq(games.id, game.id))

          // For updates, we need to sync players, moves, and words
          // This is complex - for now, we'll handle moves incrementally
          await this.syncMovesForGame(tx, game)
        }
        else {
          // Extract base word from board
          const baseWord = this.extractBaseWord(game.board)

          // Insert new game
          await tx.insert(games).values({
            id: game.id,
            size: game.size,
            board: game.board,
            baseWord,
            status: this.calculateStatus(game),
            currentPlayerIndex: game.currentPlayerIndex,
            createdAt: new Date(game.createdAt),
            updatedAt: new Date(),
          })

          // Insert players
          await this.createPlayersForGame(tx, game)

          // Insert moves (if any)
          await this.syncMovesForGame(tx, game)
        }
      })
    }
    catch (error) {
      consola.error(`Failed to save game ${game.id}:`, error)
      throw error
    }
  }

  /**
   * Delete a game by ID (cascade deletes players, moves, words)
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

  /* ============================================ */
  /* Private Helper Methods */
  /* ============================================ */

  /**
   * Reconstruct GameState from normalized database rows
   */
  private reconstructGameState(
    game: typeof games.$inferSelect,
    players: Array<typeof gamePlayers.$inferSelect>,
    gameMoves: Array<{
      id: string
      gamePlayerId: string
      positionRow: number
      positionCol: number
      letter: string
      word: string
      score: number
      moveNumber: number
      createdAt: Date
    }>,
    words: Array<{ word: string }>,
  ): GameState {
    // Build player ID to name mapping
    const playerIdToName = new Map<string, string>()
    const playerNames: string[] = []
    const aiPlayerNames: string[] = []

    for (const player of players) {
      const name = player.guestName ?? `Player ${player.playerIndex + 1}`
      playerIdToName.set(player.id, name)
      playerNames.push(name)

      if (player.isAI) {
        aiPlayerNames.push(name)
      }
    }

    // Reconstruct moves with player names
    const appliedMoves: AppliedMove[] = gameMoves.map((move) => {
      const playerName = playerIdToName.get(move.gamePlayerId) ?? 'Unknown'

      return {
        playerId: playerName,
        position: {
          row: move.positionRow,
          col: move.positionCol,
        },
        letter: move.letter,
        word: move.word,
        appliedAt: move.createdAt.getTime(),
      }
    })

    // Calculate scores from moves
    const scores: Record<string, number> = {}
    for (const playerName of playerNames) {
      scores[playerName] = 0
    }

    for (const move of gameMoves) {
      const playerName = playerIdToName.get(move.gamePlayerId)
      if (playerName && scores[playerName] !== undefined) {
        scores[playerName] += move.score
      }
    }

    return {
      id: game.id,
      size: game.size,
      board: game.board as (string | null)[][],
      players: playerNames,
      aiPlayers: aiPlayerNames,
      currentPlayerIndex: game.currentPlayerIndex,
      moves: appliedMoves,
      createdAt: game.createdAt.getTime(),
      scores,
      usedWords: words.map(w => w.word),
    }
  }

  /**
   * Create player records for a new game
   */
  private async createPlayersForGame(tx: any, game: GameState): Promise<Map<string, string>> {
    const playerNameToId = new Map<string, string>()

    for (let i = 0; i < game.players.length; i++) {
      const playerName = game.players[i]
      if (!playerName)
        continue

      const isAI = game.aiPlayers.includes(playerName)

      const [inserted] = await tx.insert(gamePlayers).values({
        gameId: game.id,
        userId: null, // Guest players for now
        guestName: playerName,
        playerIndex: i,
        isAI,
      }).returning({ id: gamePlayers.id })

      if (inserted) {
        playerNameToId.set(playerName, inserted.id)
      }
    }

    return playerNameToId
  }

  /**
   * Sync moves for a game (insert new moves only)
   */
  private async syncMovesForGame(tx: any, game: GameState): Promise<void> {
    // Get existing move count for this game
    const existingMoves = await tx
      .select({ moveNumber: moves.moveNumber })
      .from(moves)
      .where(eq(moves.gameId, game.id))
      .orderBy(desc(moves.moveNumber))
      .limit(1)

    const lastMoveNumber = existingMoves[0]?.moveNumber ?? 0

    // Get player name to ID mapping
    const players = await tx
      .select()
      .from(gamePlayers)
      .where(eq(gamePlayers.gameId, game.id))

    const playerNameToId = new Map<string, string>()
    for (const player of players) {
      const name = player.guestName ?? `Player ${player.playerIndex + 1}`
      playerNameToId.set(name, player.id)
    }

    // Insert only new moves (after lastMoveNumber)
    const newMoves = game.moves.slice(lastMoveNumber)

    for (let i = 0; i < newMoves.length; i++) {
      const move = newMoves[i]
      if (!move)
        continue

      const gamePlayerId = playerNameToId.get(move.playerId)
      if (!gamePlayerId) {
        consola.warn(`Player "${move.playerId}" not found for game ${game.id}`)
        continue
      }

      // Calculate score from move
      const score = this.calculateMoveScore(move.word)

      // Insert move
      const [insertedMove] = await tx.insert(moves).values({
        gameId: game.id,
        gamePlayerId,
        positionRow: move.position.row,
        positionCol: move.position.col,
        letter: move.letter,
        word: move.word,
        score,
        moveNumber: lastMoveNumber + i + 1,
        createdAt: new Date(move.appliedAt),
      }).returning({ id: moves.id })

      // Insert game_word entry
      if (insertedMove) {
        await tx.insert(gameWords).values({
          gameId: game.id,
          word: move.word,
          moveId: insertedMove.id,
        })
      }
    }
  }

  /**
   * Calculate move score based on word letters
   * (Copied from migration script for consistency)
   */
  private calculateMoveScore(word: string): number {
    const LETTER_SCORES: Record<string, number> = {
      // Common Russian letters
      А: 1,
      Е: 1,
      И: 1,
      Н: 1,
      О: 1,
      Р: 1,
      С: 1,
      Т: 1,
      // Medium frequency Russian letters
      В: 2,
      Д: 2,
      К: 2,
      Л: 2,
      М: 2,
      П: 2,
      У: 2,
      Я: 2,
      // Less common Russian letters
      Б: 3,
      Г: 3,
      Ж: 3,
      З: 3,
      Й: 3,
      Х: 3,
      Ц: 3,
      Ч: 3,
      // Rare Russian letters
      Ё: 4,
      Ш: 4,
      Щ: 4,
      Ъ: 4,
      Ы: 4,
      Ь: 4,
      Э: 4,
      Ю: 4,
      Ф: 4,
      // Latin letters
      A: 2,
      B: 2,
      C: 2,
      D: 2,
      E: 2,
      F: 2,
      G: 2,
      H: 2,
      I: 2,
      J: 2,
      K: 2,
      L: 2,
      M: 2,
      N: 2,
      O: 2,
      P: 2,
      Q: 3,
      R: 2,
      S: 2,
      T: 2,
      U: 2,
      V: 2,
      W: 3,
      X: 3,
      Y: 3,
      Z: 3,
    }

    let score = 0
    for (const letter of word.toUpperCase()) {
      score += LETTER_SCORES[letter] ?? 1
    }
    return score
  }

  /**
   * Extract base word from board center row
   */
  private extractBaseWord(board: (string | null)[][]): string {
    const size = board.length
    const centerRow = Math.floor(size / 2)
    const row = board[centerRow]

    if (!row) {
      throw new Error('Invalid board: missing center row')
    }

    const letters: string[] = []
    for (const cell of row) {
      if (cell !== null) {
        letters.push(cell)
      }
    }

    if (letters.length === 0) {
      throw new Error('No base word found in center row')
    }

    return letters.join('')
  }

  /**
   * Calculate game status based on moves and board state
   */
  private calculateStatus(game: GameState): 'waiting' | 'in_progress' | 'finished' {
    if (game.moves.length === 0) {
      return 'waiting'
    }

    const totalCells = game.size * game.size
    const filledCells = game.board.flat().filter(cell => cell !== null).length
    const fillPercentage = filledCells / totalCells

    if (fillPercentage > 0.9) {
      return 'finished'
    }

    return 'in_progress'
  }
}

// Export a singleton instance
export const postgresStore = new PostgresGameStore()
