# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

A **Balda** word game implementation with:
- **Backend**: Bun/Elysia server with WebSocket support
- **CLI Frontend**: React Ink terminal interface
- **Web Frontend**: React/Vite modern web UI with Tailwind CSS

Balda is a word-building game where players take turns adding a single letter to a grid and forming new words using the placed letters.

## Development Commands

- `bun run dev` - Start backend server with hot reload (port 3000)
- `bun run cli` - Launch interactive CLI frontend (requires server running)
- `bun run dev:web` - Start web frontend dev server (port 5173)
- `bun run dev:all` - Start both backend and web frontend
- `bun run build:web` - Build web frontend for production
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

### Web Frontend (`src/web/`)

Modern React-based web UI built with Vite and Tailwind CSS, following clean architecture principles:

#### Layered Architecture
- **Presentation Layer** (`components/`): React components (thin, JSX-focused)
- **State Layer** (`hooks/`): Custom React hooks (state management + side effects)
- **Business Logic** (`utils/`): Pure functions (no React dependencies)
- **API Layer** (`lib/`): Backend communication

#### Components (`src/web/components/`)
- `App.tsx` - Main application with screen routing
- `Board.tsx` - Game board display with cell highlighting
- `GamePanel.tsx` - Main game interface
- `PlayerPanel.tsx` - Player info sidebar with score and word history
- `BottomControls.tsx` - Move controls and Russian alphabet grid
- `CreateGame.tsx` - Game creation form
- `GameList.tsx` - Available games browser

#### Custom Hooks (`src/web/hooks/`)
- `useGameClient.ts` - Core game client state, API calls, screen navigation
- `useAIPlayer.ts` - AI player automation (auto-plays moves for AI)
- `useGameInteraction.ts` - UI interaction state (cell selection, word path)
- `useSuggestions.ts` - Auto-loads AI move suggestions on player's turn
- `useCreateGameForm.ts` - Form state management with validation

#### Pure Utilities (`src/web/utils/`)
- `boardValidation.ts` - Board cell click rules (Balda game logic)
  - `canClickCell()` - Implements adjacency rules, letter placement validation
  - `isPositionInWordPath()`, `getPositionPathIndex()`, `isPositionSelected()`
- `moveValidation.ts` - Move validation and construction
  - `formWordFromPath()` - Constructs word from selected positions
  - `canSubmitMove()` - Validates move readiness
  - `buildMoveBody()` - Creates API request payload

#### API Client (`src/web/lib/client.ts`)
- Type-safe API methods for all backend endpoints
- WebSocket connection for real-time game updates
- Automatic state synchronization

#### Key Features
- **Real-time Updates**: WebSocket integration for live game state
- **AI Players**: Automatic move execution for AI opponents
- **Auto Suggestions**: Suggestions load automatically on player's turn
- **Dark Theme**: Modern UI styled with Tailwind CSS
- **Quick Start**: One-click 5x5 game with random Russian words
- **Separation of Concerns**: Components contain minimal logic, utilities are pure

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
