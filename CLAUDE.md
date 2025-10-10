# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is a **Balda** word game server built with Bun and Elysia. Balda is a word-building game where players take turns adding a single letter to a grid and forming new words using the placed letters.

## Development Commands

- **Start dev server**: `bun run dev` (watches for changes, starts on port 3000 or PORT env var)
- **Run directly**: `bun run src/index.ts`
- **Lint code**: `bun run lint` (check for linting issues)
- **Lint and fix**: `bun run lint:fix` (auto-fix linting issues)

## Architecture

### Core Game Engine (`src/engine/balda.ts`)

The central game logic module containing all core types and algorithms:

- **Game state**: Board representation as `Letter[][]` (null = empty cell), player tracking, scoring, move history
- **Move validation**: Multi-step validation including turn order, dictionary lookup, adjacency checks, path finding, and word uniqueness
- **Path finding**: DFS-based `existsPathForWord()` validates that a word can be traced orthogonally through the board, ensuring the newly placed letter is included in the path
- **Word placement**: `findPlacementsForWord()` returns all valid (position, letter) combinations for placing a given word

### Dictionary System (`src/dictionary.ts`)

Implements two dictionary modes:

- **TrieDictionary**: Prefix tree for efficient word/prefix lookups, tracks alphabet and letter frequency for hint generation
- **AllowAllSizedDictionary**: Permissive fallback accepting any non-empty word
- Loads from file via `DICT_PATH` env var (expects one word per line, filters to alpha-only)
- The `SizedDictionary` interface extends base `Dictionary` with `hasPrefix()`, `getAlphabet()`, and `getLetterFrequency()`

### AI Word Suggestions (`src/engine/suggest.ts`)

The `/games/:id/suggest` endpoint provides AI move suggestions:

- Tries all alphabet letters at every valid empty cell adjacent to existing letters
- For each placement, enumerates possible words using `collectCandidateStrings()` (DFS up to length 8)
- Validates paths with `existsPathForWord()` and checks dictionary
- Scores suggestions by word length + letter rarity (inverse frequency)
- Returns top N suggestions sorted by score

### WebSocket Broadcasting (`src/wsHub.ts`)

Manages real-time game state updates:

- Maps game IDs to sets of connected WebSocket clients
- `broadcastGame()` sends updated game state to all clients watching a game after each move
- Clients connect via `/games/:id/ws` (defined in `src/index.ts`)

### HTTP API (`src/routes.ts`)

REST endpoints registered via `registerRoutes()`:

- `POST /games` - Create new game with size, baseWord, players
- `GET /games/:id` - Get current game state
- `POST /games/:id/move` - Submit move (validates, updates state, broadcasts via WebSocket)
- `GET /games/:id/placements` - Find all valid placements for a word
- `GET /games/:id/suggest` - Get AI move suggestions
- `GET /dictionary` - Dictionary metadata

All request/response schemas defined in `src/schemas.ts` using TypeBox for Elysia validation.

### State Management (`src/store.ts`)

Persistent game storage using `unstorage` with filesystem driver. Games are saved as JSON files in `STORAGE_DIR` (default: `./data/games`). The store provides async methods for CRUD operations and supports filtering games by predicate functions.

## Key Implementation Details

- **TypeBox schemas** (`src/schemas.ts`): Define all API contracts for Elysia's runtime validation
- **Move mutation**: `applyMove()` mutates the game state directly; on validation failure, tentative changes are reverted
- **Normalization**: All words/letters normalized to uppercase; supports Cyrillic alphabet (А-Я) in addition to Latin
- **WebSocket integration**: Server-initiated only; clients connect and receive broadcast updates after POST moves
- **Dictionary lazy loading**: Routes lazily initialize dictionary on first use via `getDictionary()` promise cache
- **Code style**: Uses @antfu/eslint-config for consistent code formatting and linting (single quotes, 2-space indentation)

## Environment Variables

- `PORT` - HTTP server port (default: 3000)
- `DICT_PATH` - Path to dictionary file (optional; uses AllowAllDictionary if unset)
- `STORAGE_DIR` - Game storage directory (default: `./data/games`)
- `NODE_ENV` - Set to `production` to hide detailed error messages in responses
