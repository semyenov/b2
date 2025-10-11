# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

A **Balda** word game implementation with a Bun/Elysia backend server and React Ink CLI frontend. Balda is a word-building game where players take turns adding a single letter to a grid and forming new words using the placed letters.

## Development Commands

- `bun run dev` - Start backend server with hot reload (port 3000)
- `bun run cli` - Launch interactive CLI frontend (requires server running)
- `bun run check` - Type-check the codebase (TypeScript noEmit)
- `bun run lint` - Check ESLint issues
- `bun run lint:fix` - Auto-fix ESLint issues

## Architecture

### Backend Server (`src/`)

#### Core Game Engine (`src/engine/balda.ts`)

The central game logic with memoized path-finding for performance:
- **State Management**: Immutable `GameState` with board (`Letter[][]`), players, scores, move history
- **Move Validation**: Turn order → dictionary check → placement validation → path existence → uniqueness
- **Path Finding**: Memoized `existsPathForWord()` using DFS with LRU cache (500 entries)
- **Scoring**: `calculateWordScore()` based on letter rarity (Russian/Latin alphabets supported)

#### AI Suggestions (`src/engine/suggest.ts`)

Smart move suggestions using dictionary analysis:
- Optimized enumeration with prefix pruning via `enumerateAroundOptimized()`
- Letter frequency-based scoring (rarity bonus)
- Returns top N suggestions sorted by score + word length

#### Dictionary System (`src/dictionary.ts`)

Two implementation modes:
- **TrieDictionary**: Prefix tree for efficient lookups, tracks alphabet and letter frequency
- **AllowAllSizedDictionary**: Permissive mode for testing (accepts any non-empty string)
- Lazy-loaded via `getDictionary()` promise cache in routes

#### API Routes (`src/routes.ts`)

Plugin-based Elysia route organization:
- **Dictionary Plugin**: `/dictionary` - metadata endpoint
- **Games Plugin**: `/games/*` - CRUD operations, moves, suggestions, placements
- TypeBox schemas for runtime validation (`src/schemas.ts`)

#### WebSocket Hub (`src/wsHub.ts`)

Real-time game state broadcasting:
- Client-to-game room mapping with automatic cleanup
- Safe send with readyState checking
- Broadcasts after each successful move via `POST /games/:id/move`

#### Persistence (`src/store.ts`)

File-based storage using `unstorage`:
- Games saved as JSON in `STORAGE_DIR` (default: `./data/games`)
- Async CRUD operations with filtering support

### CLI Frontend (`src/cli/`)

Interactive terminal UI built with React Ink:
- **Main App** (`App.tsx`): State management, screen routing, WebSocket integration
- **API Client** (`api.ts`): Type-safe backend communication
- **Components**:
  - `Board.tsx` - Visual game board with coordinate labels
  - `GamePlay.tsx` - Main gameplay screen with move input
  - `Suggestions.tsx` - AI move suggestions display
  - `CreateGame.tsx` / `JoinGame.tsx` - Game setup forms
  - `GameList.tsx` - Browse existing games
  - `MainMenu.tsx` - Navigation hub

### Key Implementation Patterns

1. **Error Handling**: Custom error classes (`GameNotFoundError`, `InvalidMoveError`) with structured responses
2. **Performance**: Memoized path-finding, prefix pruning in suggestions, LRU cache management
3. **Type Safety**: Strict TypeScript, TypeBox runtime validation, immutable state updates
4. **Real-time Updates**: WebSocket auto-reconnect in CLI, broadcast on state changes
5. **Code Style**: @antfu/eslint-config (single quotes, no semicolons, 2-space indent)

## Environment Variables

- `PORT` - Backend server port (default: 3000)
- `DICT_PATH` - Dictionary file path (one word per line, alpha-only)
- `STORAGE_DIR` - Game persistence directory (default: `./data/games`)
- `NODE_ENV` - Set to `production` for reduced error verbosity
