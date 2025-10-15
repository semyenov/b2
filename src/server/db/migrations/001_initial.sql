-- Initial schema migration for Balda game
-- Creates tables for games, words dictionary, and users

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Games table
CREATE TABLE IF NOT EXISTS games (
  id UUID PRIMARY KEY,
  size INTEGER NOT NULL,
  board JSONB NOT NULL,
  players JSONB NOT NULL,
  ai_players JSONB NOT NULL,
  current_player_index INTEGER NOT NULL,
  moves JSONB NOT NULL,
  scores JSONB NOT NULL,
  used_words JSONB NOT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP NOT NULL DEFAULT NOW()
);

-- Create indexes for games table
CREATE INDEX IF NOT EXISTS games_created_at_idx ON games(created_at);
CREATE INDEX IF NOT EXISTS games_updated_at_idx ON games(updated_at);

-- Words table for dictionary
CREATE TABLE IF NOT EXISTS words (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  word TEXT NOT NULL,
  language TEXT NOT NULL DEFAULT 'ru',
  created_at TIMESTAMP NOT NULL DEFAULT NOW()
);

-- Create indexes for words table
CREATE INDEX IF NOT EXISTS words_word_idx ON words(word);
CREATE INDEX IF NOT EXISTS words_language_idx ON words(language);
CREATE INDEX IF NOT EXISTS words_word_language_idx ON words(word, language);

-- Users table (for future authentication)
CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  username TEXT NOT NULL UNIQUE,
  email TEXT NOT NULL UNIQUE,
  password_hash TEXT NOT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP NOT NULL DEFAULT NOW()
);

-- Create indexes for users table
CREATE INDEX IF NOT EXISTS users_username_idx ON users(username);
CREATE INDEX IF NOT EXISTS users_email_idx ON users(email);

-- Function to automatically update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger for games table
CREATE TRIGGER update_games_updated_at
  BEFORE UPDATE ON games
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Trigger for users table
CREATE TRIGGER update_users_updated_at
  BEFORE UPDATE ON users
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();
