import type { InferInsertModel, InferSelectModel } from 'drizzle-orm'
import { boolean, index, integer, jsonb, pgTable, text, timestamp, unique, uuid } from 'drizzle-orm/pg-core'

/**
 * Users table - for authentication
 * Must be defined before gamePlayers to avoid circular reference
 */
export const users = pgTable('users', {
  id: uuid('id').primaryKey().defaultRandom(),
  username: text('username').notNull().unique(),
  email: text('email').notNull().unique(),
  passwordHash: text('password_hash').notNull(),
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow(),
}, table => ({
  usernameIdx: index('users_username_idx').on(table.username),
  emailIdx: index('users_email_idx').on(table.email),
}))

/**
 * Games table - stores core game state
 * Normalized: players, moves, and words moved to separate tables
 */
export const games = pgTable('games', {
  id: uuid('id').primaryKey(),
  size: integer('size').notNull(),
  board: jsonb('board').notNull().$type<(string | null)[][]>(),
  baseWord: text('base_word').notNull(), // Extracted from board center
  status: text('status').notNull().default('in_progress').$type<'waiting' | 'in_progress' | 'finished'>(),
  currentPlayerIndex: integer('current_player_index').notNull().default(0),
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow(),
  finishedAt: timestamp('finished_at'), // Nullable - set when game ends
}, table => ({
  createdAtIdx: index('games_created_at_idx').on(table.createdAt),
  updatedAtIdx: index('games_updated_at_idx').on(table.updatedAt),
  statusIdx: index('games_status_idx').on(table.status),
}))

/**
 * Game players - junction table for games and players
 * Supports both registered users and guest players
 */
export const gamePlayers = pgTable('game_players', {
  id: uuid('id').primaryKey().defaultRandom(),
  gameId: uuid('game_id').notNull().references(() => games.id, { onDelete: 'cascade' }),
  userId: uuid('user_id').references(() => users.id, { onDelete: 'set null' }), // Nullable for guest players
  guestName: text('guest_name'), // For non-registered players
  playerIndex: integer('player_index').notNull(), // Order in game: 0, 1, 2...
  isAI: boolean('is_ai').notNull().default(false),
  createdAt: timestamp('created_at').notNull().defaultNow(),
}, table => ({
  gameIdIdx: index('game_players_game_id_idx').on(table.gameId),
  userIdIdx: index('game_players_user_id_idx').on(table.userId),
  // Ensure unique player index per game
  uniqueGamePlayerIdx: unique('game_players_game_id_player_index_unique').on(table.gameId, table.playerIndex),
}))

/**
 * Moves table - normalized move history
 * Each row represents a single move in a game
 */
export const moves = pgTable('moves', {
  id: uuid('id').primaryKey().defaultRandom(),
  gameId: uuid('game_id').notNull().references(() => games.id, { onDelete: 'cascade' }),
  gamePlayerId: uuid('game_player_id').notNull().references(() => gamePlayers.id, { onDelete: 'cascade' }),
  positionRow: integer('position_row').notNull(), // Separate columns for indexing
  positionCol: integer('position_col').notNull(),
  letter: text('letter').notNull(),
  word: text('word').notNull(),
  score: integer('score').notNull(), // Points earned for this move
  moveNumber: integer('move_number').notNull(), // Sequence in game: 1, 2, 3...
  createdAt: timestamp('created_at').notNull().defaultNow(),
}, table => ({
  gameIdIdx: index('moves_game_id_idx').on(table.gameId),
  gamePlayerIdIdx: index('moves_game_player_id_idx').on(table.gamePlayerId),
  gameMoveNumberIdx: index('moves_game_id_move_number_idx').on(table.gameId, table.moveNumber),
  positionIdx: index('moves_position_idx').on(table.positionRow, table.positionCol),
}))

/**
 * Game words - tracks words used in each game
 * Normalized from usedWords JSONB array
 */
export const gameWords = pgTable('game_words', {
  id: uuid('id').primaryKey().defaultRandom(),
  gameId: uuid('game_id').notNull().references(() => games.id, { onDelete: 'cascade' }),
  word: text('word').notNull(),
  moveId: uuid('move_id').notNull().references(() => moves.id, { onDelete: 'cascade' }), // Which move created this word
  createdAt: timestamp('created_at').notNull().defaultNow(),
}, table => ({
  gameIdIdx: index('game_words_game_id_idx').on(table.gameId),
  wordIdx: index('game_words_word_idx').on(table.word),
  moveIdIdx: index('game_words_move_id_idx').on(table.moveId),
}))

/**
 * Words table - stores dictionary words for efficient lookups
 * Used for dictionary validation and optimization
 */
export const words = pgTable('words', {
  id: uuid('id').primaryKey().defaultRandom(),
  word: text('word').notNull(),
  language: text('language').notNull().default('ru'),
  createdAt: timestamp('created_at').notNull().defaultNow(),
}, table => ({
  wordIdx: index('words_word_idx').on(table.word),
  languageIdx: index('words_language_idx').on(table.language),
  // Compound index for language + word lookups
  wordLanguageIdx: index('words_word_language_idx').on(table.word, table.language),
}))

// Type exports for type-safe inserts and selects

// Games
export type Game = InferSelectModel<typeof games>
export type NewGame = InferInsertModel<typeof games>

// Game Players
export type GamePlayer = InferSelectModel<typeof gamePlayers>
export type NewGamePlayer = InferInsertModel<typeof gamePlayers>

// Moves
export type Move = InferSelectModel<typeof moves>
export type NewMove = InferInsertModel<typeof moves>

// Game Words
export type GameWord = InferSelectModel<typeof gameWords>
export type NewGameWord = InferInsertModel<typeof gameWords>

// Dictionary Words
export type Word = InferSelectModel<typeof words>
export type NewWord = InferInsertModel<typeof words>

// Users
export type User = InferSelectModel<typeof users>
export type NewUser = InferInsertModel<typeof users>
