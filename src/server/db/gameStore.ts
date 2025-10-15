import type { AppliedMove, GameState } from '../engine/balda'
import { consola } from 'consola'
import { and, desc, eq, inArray } from 'drizzle-orm'
import { calculateWordScore, normalizeWord } from '../engine/balda'
import { db } from './client'
import { OptimisticLockError, withRetry, wrapDatabaseOperation } from './errors'
import { gamePlayers, games, gameWords, moves } from './schema'

// Type for Drizzle transaction - extracted from db.transaction callback parameter
type DbTransaction = Parameters<Parameters<typeof db.transaction>[0]>[0]

/**
 * PostgreSQL-based game store using Drizzle ORM with normalized schema
 * Uses JOINs to reconstruct GameState from relational tables
 */
export class PostgresGameStore {
  /**
   * Get all games from the database (with full state reconstruction)
   * Optimized to fetch all data in batches instead of N+1 queries
   */
  async getAll(): Promise<GameState[]> {
    return wrapDatabaseOperation('getAll', async () => {
      // Fetch all games
      const allGames = await db.select().from(games)

      if (allGames.length === 0) {
        return []
      }

      const gameIds = allGames.map(g => g.id)

      // Fetch ALL players for all games in one query
      const allPlayers = await db
        .select()
        .from(gamePlayers)
        .where(inArray(gamePlayers.gameId, gameIds))
        .orderBy(gamePlayers.playerIndex)

      // Fetch ALL moves for all games in one query
      const allMoves = await db
        .select({
          gameId: moves.gameId,
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
        .where(inArray(moves.gameId, gameIds))
        .orderBy(moves.moveNumber)

      // Fetch ALL words for all games in one query
      const allWords = await db
        .select({
          gameId: gameWords.gameId,
          word: gameWords.word,
        })
        .from(gameWords)
        .where(inArray(gameWords.gameId, gameIds))

      // Group data by game ID
      const playersByGame = new Map<string, Array<typeof gamePlayers.$inferSelect>>()
      const movesByGame = new Map<string, typeof allMoves>()
      const wordsByGame = new Map<string, Array<{ word: string }>>()

      for (const player of allPlayers) {
        if (!playersByGame.has(player.gameId)) {
          playersByGame.set(player.gameId, [])
        }
        playersByGame.get(player.gameId)?.push(player)
      }

      for (const move of allMoves) {
        if (!movesByGame.has(move.gameId)) {
          movesByGame.set(move.gameId, [])
        }
        movesByGame.get(move.gameId)?.push(move)
      }

      for (const word of allWords) {
        if (!wordsByGame.has(word.gameId)) {
          wordsByGame.set(word.gameId, [])
        }
        wordsByGame.get(word.gameId)?.push({ word: word.word })
      }

      // Reconstruct all game states
      const gameStates: GameState[] = []
      for (const game of allGames) {
        const players = playersByGame.get(game.id) ?? []
        const gameMoves = movesByGame.get(game.id) ?? []
        const words = wordsByGame.get(game.id) ?? []

        const state = this.reconstructGameState(game, players, gameMoves, words)
        gameStates.push(state)
      }

      return gameStates
    })
  }

  /**
   * Get a single game by ID with all related data (players, moves, words)
   */
  async get(id: string): Promise<GameState | null> {
    return wrapDatabaseOperation('get', async () => {
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
    }, { gameId: id })
  }

  /**
   * Check if a game exists
   */
  async has(id: string): Promise<boolean> {
    return wrapDatabaseOperation('has', async () => {
      const result = await db
        .select({ id: games.id })
        .from(games)
        .where(eq(games.id, id))
        .limit(1)

      return result.length > 0
    }, { gameId: id })
  }

  /**
   * Save or update a game (handles normalized structure)
   * This is a complex operation that updates multiple tables in a transaction
   * Uses retry logic for transient failures (deadlocks, serialization errors)
   */
  async set(game: GameState): Promise<void> {
    return wrapDatabaseOperation(
      'set',
      () => withRetry(
        async () => {
          await db.transaction(async (tx) => {
            // Check if game exists WITHIN the transaction for proper isolation
            const existingGame = await tx
              .select({ id: games.id })
              .from(games)
              .where(eq(games.id, game.id))
              .limit(1)

            const exists = existingGame.length > 0

            if (exists) {
              // Update existing game with optimistic locking
              const result = await tx
                .update(games)
                .set({
                  size: game.size,
                  board: game.board,
                  currentPlayerIndex: game.currentPlayerIndex,
                  updatedAt: new Date(),
                  status: this.calculateStatus(game),
                  version: game.version + 1, // Increment version
                })
                .where(and(
                  eq(games.id, game.id),
                  eq(games.version, game.version), // Optimistic lock check
                ))
                .returning({ id: games.id })

              // Check if update succeeded (version matched)
              if (result.length === 0) {
                throw new OptimisticLockError(
                  `Game ${game.id} was modified by another process`,
                  game.id,
                  game.version,
                )
              }

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
                version: 1, // Initial version
                createdAt: new Date(game.createdAt),
                updatedAt: new Date(),
              })

              // Insert players
              await this.createPlayersForGame(tx, game)

              // Insert base word into game_words table (Issue #2 fix)
              // Base word has no associated move, so moveId is null
              await tx.insert(gameWords).values({
                gameId: game.id,
                word: baseWord,
                moveId: null,
              })

              // Insert moves (if any)
              await this.syncMovesForGame(tx, game)
            }
          })
        },
        { maxAttempts: 3, initialDelay: 100 },
      ),
      { gameId: game.id },
    )
  }

  /**
   * Delete a game by ID (cascade deletes players, moves, words)
   */
  async delete(id: string): Promise<void> {
    await wrapDatabaseOperation(
      'delete',
      () => db.delete(games).where(eq(games.id, id)),
      { gameId: id },
    )
  }

  /**
   * Clear all games (use with caution!)
   */
  async clear(): Promise<void> {
    return wrapDatabaseOperation(
      'clear',
      async () => {
        await db.delete(games)
        consola.warn('All games cleared from database')
      },
    )
  }

  /**
   * Count total number of games
   */
  async count(): Promise<number> {
    return wrapDatabaseOperation('count', async () => {
      const result = await db.select().from(games)
      return result.length
    })
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

    // Reconstruct usedWords: base word + words from moves
    // Base word is always used (it's the starting word on the board)
    const usedWords = [game.baseWord, ...words.map(w => w.word)]

    return {
      id: game.id,
      size: game.size,
      baseWord: game.baseWord || '',
      board: game.board as (string | null)[][],
      players: playerNames,
      aiPlayers: aiPlayerNames,
      currentPlayerIndex: game.currentPlayerIndex,
      moves: appliedMoves,
      createdAt: game.createdAt.getTime(),
      scores,
      usedWords,
      version: game.version, // Optimistic locking version
    }
  }

  /**
   * Create player records for a new game
   */
  private async createPlayersForGame(tx: DbTransaction, game: GameState): Promise<Map<string, string>> {
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
  private async syncMovesForGame(tx: DbTransaction, game: GameState): Promise<void> {
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
      const score = calculateWordScore(move.word)

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
   * Extract base word from board center row
   * Returns normalized (uppercase) word to match game logic expectations
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

    // CRITICAL: Normalize the base word to match game logic (Issue #1)
    return normalizeWord(letters.join(''))
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
