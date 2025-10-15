#!/usr/bin/env bun
/**
 * Data Migration Script - Denormalized JSONB → Normalized Relational
 *
 * Transforms existing games from denormalized JSONB structure to normalized tables:
 * - players/aiPlayers → game_players table
 * - moves JSONB array → moves table
 * - usedWords array → game_words table
 * - Extract baseWord from board
 * - Calculate game status
 *
 * Usage:
 *   bun run scripts/migrate-to-normalized-db.ts [--dry-run]
 *
 * IMPORTANT: Run AFTER applying the SQL migration (drizzle/0001_normalized_schema.sql)
 */

import { consola } from 'consola'
import { eq } from 'drizzle-orm'
import { db } from '../src/server/db/client'
import { gamePlayers, games, gameWords, moves } from '../src/server/db/schema'

interface OldGameState {
  id: string
  size: number
  board: (string | null)[][]
  players: string[]
  aiPlayers: string[]
  currentPlayerIndex: number
  moves: Array<{
    playerId: string
    position: { row: number, col: number }
    letter: string
    word: string
    appliedAt: number
  }>
  scores: Record<string, number>
  usedWords: string[]
  createdAt: Date
  updatedAt: Date
}

interface MigrationStats {
  totalGames: number
  migratedGames: number
  totalPlayers: number
  totalMoves: number
  totalWords: number
  errors: Array<{ gameId: string, error: string }>
}

/**
 * Extract base word from board (center row)
 */
function extractBaseWord(board: (string | null)[][]): string {
  const size = board.length
  const centerRow = Math.floor(size / 2)
  const row = board[centerRow]

  if (!row) {
    throw new Error('Invalid board: missing center row')
  }

  // Find continuous letters in center row
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
 * Determine game status based on move count and player configuration
 */
function calculateGameStatus(game: OldGameState): 'waiting' | 'in_progress' | 'finished' {
  // If no moves yet, game is waiting
  if (game.moves.length === 0) {
    return 'waiting'
  }

  // Simple heuristic: if board is nearly full, game is likely finished
  const totalCells = game.size * game.size
  const filledCells = game.board.flat().filter(cell => cell !== null).length
  const fillPercentage = filledCells / totalCells

  // Consider game finished if >90% full (can be adjusted)
  if (fillPercentage > 0.9) {
    return 'finished'
  }

  return 'in_progress'
}

/**
 * Calculate score for a word based on letter rarity
 * Copied from src/shared/constants/scoring.ts
 */
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

function calculateWordScore(word: string): number {
  let score = 0
  for (const letter of word.toUpperCase()) {
    score += LETTER_SCORES[letter] ?? 1
  }
  return score
}

/**
 * Migrate a single game from old structure to new normalized structure
 */
async function migrateGame(oldGame: OldGameState, dryRun: boolean): Promise<{
  playersCreated: number
  movesCreated: number
  wordsCreated: number
}> {
  const stats = {
    playersCreated: 0,
    movesCreated: 0,
    wordsCreated: 0,
  }

  try {
    // Extract base word from board
    const baseWord = extractBaseWord(oldGame.board)
    const status = calculateGameStatus(oldGame)

    consola.info(`  Game ${oldGame.id.slice(0, 8)}... - Status: ${status}, Base word: ${baseWord}`)

    if (!dryRun) {
      // Update game with new fields
      await db.update(games)
        .set({
          baseWord,
          status,
          finishedAt: status === 'finished' ? new Date() : null,
        })
        .where(eq(games.id, oldGame.id))
    }

    // Create game_players records
    const playerIdMap = new Map<string, string>() // oldPlayerId -> gamePlayerId

    for (let i = 0; i < oldGame.players.length; i++) {
      const playerName = oldGame.players[i]
      if (!playerName)
        continue

      const isAI = oldGame.aiPlayers.includes(playerName)

      if (!dryRun) {
        const [inserted] = await db.insert(gamePlayers).values({
          gameId: oldGame.id,
          userId: null, // No user association yet (all are guests)
          guestName: playerName,
          playerIndex: i,
          isAI,
        }).returning({ id: gamePlayers.id })

        if (inserted) {
          playerIdMap.set(playerName, inserted.id)
        }
      }
      else {
        // In dry-run, generate fake ID
        playerIdMap.set(playerName, `fake-${i}`)
      }

      stats.playersCreated++
    }

    // Create moves records
    for (let i = 0; i < oldGame.moves.length; i++) {
      const oldMove = oldGame.moves[i]
      if (!oldMove)
        continue

      const gamePlayerId = playerIdMap.get(oldMove.playerId)
      if (!gamePlayerId) {
        consola.warn(`  ⚠️  Move ${i + 1}: Player "${oldMove.playerId}" not found in game players`)
        continue
      }

      const score = calculateWordScore(oldMove.word)

      if (!dryRun) {
        const [insertedMove] = await db.insert(moves).values({
          gameId: oldGame.id,
          gamePlayerId,
          positionRow: oldMove.position.row,
          positionCol: oldMove.position.col,
          letter: oldMove.letter,
          word: oldMove.word,
          score,
          moveNumber: i + 1,
          createdAt: new Date(oldMove.appliedAt),
        }).returning({ id: moves.id })

        // Create game_words entry for this move
        if (insertedMove) {
          await db.insert(gameWords).values({
            gameId: oldGame.id,
            word: oldMove.word,
            moveId: insertedMove.id,
          })
          stats.wordsCreated++
        }
      }
      else {
        stats.wordsCreated++
      }

      stats.movesCreated++
    }

    consola.success(`  ✓ Migrated: ${stats.playersCreated} players, ${stats.movesCreated} moves, ${stats.wordsCreated} words`)
  }
  catch (error) {
    const errorMsg = error instanceof Error ? error.message : String(error)
    throw new Error(`Failed to migrate game ${oldGame.id}: ${errorMsg}`)
  }

  return stats
}

/**
 * Main migration function
 */
async function migrate() {
  const args = process.argv.slice(2)
  const dryRun = args.includes('--dry-run')

  consola.box(`Database Migration: JSONB → Normalized Schema\n\nMode: ${dryRun ? '🔍 DRY RUN (no changes)' : '✍️  LIVE (will modify database)'}`)

  const stats: MigrationStats = {
    totalGames: 0,
    migratedGames: 0,
    totalPlayers: 0,
    totalMoves: 0,
    totalWords: 0,
    errors: [],
  }

  try {
    // Check if new tables exist
    const tableCheck = await db.execute(`
      SELECT table_name
      FROM information_schema.tables
      WHERE table_schema = 'public'
        AND table_name IN ('game_players', 'moves', 'game_words')
    `)

    const tableCheckResults = Array.from(tableCheck)
    if (tableCheckResults.length < 3) {
      consola.error('❌ New tables not found! Please run the SQL migration first:')
      consola.info('   bun run db:push  OR  psql < drizzle/0001_normalized_schema.sql')
      process.exit(1)
    }

    // Fetch all games with old JSONB structure
    consola.start('Fetching games from database...')

    // We need to use raw query since the schema no longer has the old JSONB columns
    const result = await db.execute(`
      SELECT
        id::text,
        size,
        board,
        players,
        ai_players as "aiPlayers",
        current_player_index as "currentPlayerIndex",
        moves,
        scores,
        used_words as "usedWords",
        created_at as "createdAt",
        updated_at as "updatedAt"
      FROM games
      WHERE base_word IS NULL  -- Only migrate games not yet migrated
    `)

    const oldGames = Array.from(result) as unknown as OldGameState[]
    stats.totalGames = oldGames.length

    if (stats.totalGames === 0) {
      consola.success('✅ No games to migrate (all games already migrated or no games exist)')
      return
    }

    consola.info(`Found ${stats.totalGames} games to migrate\n`)

    // Migrate each game
    for (const game of oldGames) {
      try {
        const gameStats = await migrateGame(game, dryRun)

        stats.migratedGames++
        stats.totalPlayers += gameStats.playersCreated
        stats.totalMoves += gameStats.movesCreated
        stats.totalWords += gameStats.wordsCreated
      }
      catch (error) {
        const errorMsg = error instanceof Error ? error.message : String(error)
        stats.errors.push({ gameId: game.id, error: errorMsg })
        consola.error(`  ❌ ${errorMsg}`)
      }
    }

    // Print summary
    console.log()
    consola.box(`
Migration Summary:

📊 Games:
  • Total: ${stats.totalGames}
  • Migrated: ${stats.migratedGames}
  • Failed: ${stats.errors.length}

👥 Players: ${stats.totalPlayers}
♟️  Moves: ${stats.totalMoves}
📝 Words: ${stats.totalWords}

${stats.errors.length > 0 ? `\n⚠️  Errors:\n${stats.errors.map(e => `  • ${e.gameId}: ${e.error}`).join('\n')}` : ''}

${dryRun ? '🔍 DRY RUN - No changes made\nRun without --dry-run to apply migration' : '✅ Migration complete!'}
    `)

    if (!dryRun && stats.migratedGames > 0) {
      consola.info('\n📌 Next steps:')
      consola.info('   1. Verify migrated data: bun run scripts/db-viewer.ts')
      consola.info('   2. Test application functionality')
      consola.info('   3. Once verified, you can drop old JSONB columns:')
      consola.info('      ALTER TABLE games DROP COLUMN players, ai_players, moves, scores, used_words;')
    }
  }
  catch (error) {
    consola.error('Migration failed:', error)
    process.exit(1)
  }
}

// Run migration
migrate()
  .then(() => process.exit(0))
  .catch((error) => {
    consola.error('Unexpected error:', error)
    process.exit(1)
  })
