import type { InferInsertModel, InferSelectModel } from 'drizzle-orm'
import { index, integer, jsonb, pgTable, text, timestamp, uuid } from 'drizzle-orm/pg-core'

/**
 * Games table - stores game state with board, players, moves, and scores
 */
export const games = pgTable('games', {
  id: uuid('id').primaryKey(),
  size: integer('size').notNull(),
  board: jsonb('board').notNull().$type<(string | null)[][]>(),
  players: jsonb('players').notNull().$type<string[]>(),
  aiPlayers: jsonb('ai_players').notNull().$type<string[]>(),
  currentPlayerIndex: integer('current_player_index').notNull(),
  moves: jsonb('moves').notNull().$type<Array<{
    playerId: string
    position: { row: number, col: number }
    letter: string
    word: string
    appliedAt: number
  }>>(),
  scores: jsonb('scores').notNull().$type<Record<string, number>>(),
  usedWords: jsonb('used_words').notNull().$type<string[]>(),
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow(),
}, table => ({
  createdAtIdx: index('games_created_at_idx').on(table.createdAt),
  updatedAtIdx: index('games_updated_at_idx').on(table.updatedAt),
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

/**
 * Users table - for future authentication implementation
 * Currently not used, but included for schema completeness
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

// Type exports for type-safe inserts and selects
export type Game = InferSelectModel<typeof games>
export type NewGame = InferInsertModel<typeof games>
export type Word = InferSelectModel<typeof words>
export type NewWord = InferInsertModel<typeof words>
export type User = InferSelectModel<typeof users>
export type NewUser = InferInsertModel<typeof users>
