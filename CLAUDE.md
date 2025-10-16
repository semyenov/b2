# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

A **Balda** word game implementation with:
- **Backend**: Bun/Elysia server with WebSocket support
- **CLI Frontend**: React Ink terminal interface
- **Web Frontend**: React/Vite modern web UI with Tailwind CSS

Balda is a word-building game where players take turns adding a single letter to a grid and forming new words using the placed letters.

## Development Commands

### Backend & Server
- `bun run dev` - Start backend server with hot reload (port 3000)
- `bun run check` - Type-check the codebase (TypeScript noEmit)
- `bun run lint` - Check ESLint issues
- `bun run lint:fix` - Auto-fix ESLint issues

### Database & Dictionary
- `bunx drizzle-kit migrate` - Run database migrations
- `bun run db:reset --confirm` - Drop and recreate database (destructive!)
- `bun run db:view` - View database contents (games, moves, words)
- `bun run dict:import` - Import Russian dictionary to PostgreSQL (50,910 words)
- `bun run dict:import:en <file> en` - Import custom English dictionary
- `bun run migrate:normalize` - Migrate old JSONB data to normalized schema
- `bun run migrate:normalize:dry` - Dry-run migration (preview changes)
- `bun run migrate:rollback --confirm` - Rollback normalized schema (destructive!)

### Frontend
- `bun run cli` - Launch interactive CLI frontend (requires server running)
- `bun run dev:web` - Start web frontend dev server (port 5173)
- `bun run dev:all` - Start both backend and web frontend concurrently
- `bun run build:web` - Build web frontend for production

## Architecture

### Shared Modules (`src/shared/`) - Foundation Layer

Centralized configuration and type definitions shared between server and web clients. Eliminates duplication and ensures consistency across the codebase.

#### Shared Configuration (`src/shared/config/`)

Single source of truth for all game rules, scoring, and UI settings (1000+ lines across 6 files):

- **`game-rules.ts`** - Core game mechanics
  - Board configuration (sizes 3-7, default 5x5)
  - Word length constraints (min 2, max 8 for suggestions)
  - Player limits (2-4 players)
  - Turn timing and validation rules
  - Alphabets (Russian Cyrillic, Latin, combined)
  - `ORTHOGONAL_DIRS` - Movement directions for adjacency checking

- **`scoring.ts`** - Letter scoring and calculation
  - Russian Cyrillic scoring (А=1, Я=6, rare letters higher)
  - Latin alphabet scoring (A=1, Z=5)
  - `calculateWordScore()`, `getLetterScore()` helper functions
  - Score distribution and tier helpers

- **`suggestions.ts`** - AI suggestion engine settings
  - Limits: default 20, max request 200, max display 100
  - Score tiers (high ≥10, medium ≥5, low <5)
  - Tier styling configuration for UI

- **`validation.ts`** - Input validation patterns
  - Player name rules (2-20 chars, alphanumeric + spaces/hyphens)
  - Game ID format (UUID v4)
  - Base word validation (letters only, length matches board)
  - Helper functions: `isValidPlayerName()`, `isValidBaseWord()`, etc.

- **`ui.ts`** - UI timing and performance settings
  - Animation durations (toast 3s, transitions 200-500ms)
  - Performance thresholds (debounce 300ms, max suggestions 100)
  - AI thinking delays (1.5s natural pause)
  - WebSocket configuration (reconnect, ping intervals)
  - Archive delay (5 minutes for inactive games)

- **`i18n/`** - Internationalization (Russian primary)
  - `ru.ts` - Complete Russian translations (200+ strings)
  - `index.ts` - Utilities: `translateError()`, `formatTimeAgo()`, `getRussianPlural()`
  - Error messages, loading states, success notifications
  - Accessibility labels for screen readers
  - Game status descriptions

**Usage Pattern:**
```typescript
import { BOARD_CONFIG, WORD_CONFIG, SUGGESTION_LIMITS } from '@shared/config'

const size = BOARD_CONFIG.DEFAULT_SIZE // 5
const maxWord = WORD_CONFIG.MAX_LENGTH // 8
const limit = SUGGESTION_LIMITS.MAX // 200
```

#### Shared Types (`src/shared/types/`)

Type-safe domain models with helper functions (900+ lines across 5 files):

- **`game.ts`** - Core game state types
  - `Position` - Board coordinates with helper functions
  - `Board` - 2D array of letters (string | null)[][]
  - `Letter` - Single letter type (string | null)
  - `GameState` - Complete game state (board, players, scores, moves)
  - `GameConfig` - Game creation parameters
  - `GameStatus` - Game lifecycle states
  - Helpers: `isPosition()`, `isSamePosition()`, `isInBounds()`, `positionToCoord()`

- **`move.ts`** - Move validation and execution
  - `MoveInput` - Player move submission (playerId, position, letter, word)
  - `AppliedMove` - Move with timestamp
  - `MoveResult` - Success/failure discriminated union
  - `MoveValidationError` - Specific error types
  - Type guards: `isMoveSuccess()`, `isMoveFailure()`, `getMoveError()`

- **`suggestion.ts`** - AI move suggestions
  - `Suggestion` - Position, letter, word, score
  - `SuggestOptions` - Limit, used words, base word filtering
  - `RankedSuggestion` - With rank and tier metadata
  - `SuggestionsResponse` - API response with timing
  - Utilities: `compareSuggestions()`, `filterByMinScore()`, `groupByTier()`

- **`dictionary.ts`** - Word validation interfaces
  - `Dictionary` - Synchronous word checking (has, hasPrefix)
  - `SizedDictionary` - With metadata (size, alphabet, frequency)
  - `AsyncDictionary` - Promise-based validation
  - `DictionaryMetadata` - API response type
  - Type guards: `hasPrefixSupport()`, `isAsyncDictionary()`, `isSizedDictionary()`

- **`result.ts`** - Functional error handling pattern
  - `Result<T, E>` - Rust-inspired success/failure type
  - Factory functions: `ok()`, `err()`
  - Type guards: `isOk()`, `isErr()`
  - Operators: `map()`, `mapErr()`, `andThen()`, `combine()`
  - Conversion: `toPromise()`, `fromPromise()`
  - Extraction: `unwrap()`, `unwrapOr()`

**Import Strategy:**
```typescript
// Server and web both import from shared
import type { GameState, Position, MoveResult } from '@shared/types'
import { isOk, ok, err, type Result } from '@shared/types'

// Server engine re-exports for backward compatibility
export type { GameState, Position } from '@shared/types'
```

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

#### Dictionary System

**Production: PostgreSQL with In-Memory Caching** (`src/server/db/`)
- **PostgresDictionary** (`dictionaryStore.ts`): PostgreSQL-backed dictionary with 50,910+ Russian words
- **CachedPostgresDictionary** (`cachedDictionary.ts`): Hybrid approach - loads all words into in-memory Trie at startup
  - Synchronous `has()` and `hasPrefix()` methods for game engine compatibility
  - O(k) lookup time where k is word length
  - Multi-language support (Russian implemented, extensible)
- **Import Script**: `bun run dict:import` - imports words from text file to PostgreSQL

**Fallback: File-Based** (`src/dictionary.ts`)
- **TrieDictionary**: Prefix tree for efficient lookups, tracks alphabet and letter frequency
- **AllowAllSizedDictionary**: Permissive mode for testing (accepts any non-empty string)
- Automatically used when `DATABASE_URL` not configured

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

#### Persistence & Database (`src/server/db/`)

**Production: PostgreSQL with Normalized Schema** (Recommended)
- **Schema** (`schema.ts`): Drizzle ORM schema with normalized tables
  - `games` - Core game metadata (id, size, baseWord, status, timestamps)
  - `game_players` - Player records with junction table pattern (gameId + playerIndex)
  - `moves` - Individual move history (position, letter, word, score, moveNumber)
  - `game_words` - Used words tracking with foreign key to games
  - `users` - User authentication (future feature)
  - `words` - Dictionary storage with language support
- **Game Store** (`gameStore.ts`): Repository pattern with JOIN-based queries
  - Reconstructs `GameState` domain model from normalized tables
  - Transaction-based writes for data integrity
  - Incremental move syncing (only inserts new moves)
- **Migrations**: SQL migrations in `drizzle/` directory managed by drizzle-kit
- **Scripts**: Migration utilities in `scripts/` directory
  - `migrate-to-normalized-db.ts` - Data migration with dry-run mode
  - `rollback-normalized-db.ts` - Safe rollback with confirmation
  - `reset-db.ts` - Drop and recreate database
  - `db-viewer.ts` - Inspect database contents

**Fallback: File-Based Storage** (`src/store.ts`)
- Uses `unstorage` with filesystem driver
- Games saved as JSON in `STORAGE_DIR` (default: `./data/games`)
- Automatically used when `DATABASE_URL` not configured

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

### Web Frontend (`src/web/`) - Production Ready ✅

Modern React-based web UI built with Vite and Tailwind CSS, following clean architecture principles with production-grade infrastructure.

**Production Status**: Bundle size 234 kB (72 kB gzipped), zero TypeScript errors, full Russian localization.

#### Layered Architecture
- **Configuration Layer** (`config/`): Type-safe environment and app configuration
- **Presentation Layer** (`components/`): React components (thin, JSX-focused, 9 active files)
- **State Layer** (`hooks/`): Custom React hooks (state management + side effects, 5 files)
- **Business Logic** (`utils/`): Pure functions (no React dependencies, 7 files)
- **API Layer** (`lib/`): Backend communication with JSDoc

#### Configuration (`src/web/config/`)
- `env.ts` - **[NEW]** Type-safe environment configuration
  - Centralized `VITE_API_URL` management
  - Environment mode detection (development/production)
  - Single source of truth for configuration

#### Components (`src/web/components/`) - 9 Active Files
- `App.tsx` - Main application with screen routing and WebSocket integration
- `Banner.tsx` - Toast notifications (error, loading, warning)
- `Board.tsx` - Game board display with cell highlighting and coordinates
- `CreateGame.tsx` - Game creation form with validation
- `ErrorBoundary.tsx` - React error boundary with logger integration
- `GameList.tsx` - Available games browser (uses `gameHelpers`)
- `GamePanel.tsx` - Main game interface with alphabet grid
- `MenuButton.tsx` - Reusable menu button component
- `PlayerPanel.tsx` - Player info sidebar with score and word history
- `StatusMessage.tsx` - Step-by-step game instructions

**Removed** (unused legacy): `MoveInput`, `SuggestionsGrid`, `BottomControls`, `GameInfo`, `Suggestions`, `PlayerScoreBar`

#### Custom Hooks (`src/web/hooks/`) - 5 Files
- `useGameClient.ts` - Core game client state, API calls, screen navigation
- `useAIPlayer.ts` - AI player automation (auto-plays moves for AI)
- `useGameInteraction.ts` - UI interaction state (cell selection, word path)
- `useSuggestions.ts` - Auto-loads AI move suggestions on player's turn
- `useCreateGameForm.ts` - Form state management with validation

#### Pure Utilities (`src/web/utils/`) - 7 Files
- `logger.ts` - **[NEW]** Production error logging with sessionStorage tracking
  - 4 log levels (DEBUG, INFO, WARN, ERROR)
  - Production mode auto-silences debug logs
  - Last 50 errors persisted for debugging
  - Ready for Sentry/LogRocket integration
- `gameHelpers.ts` - **[NEW]** Extracted reusable game utilities
  - `getBaseWord()` - Extract center word from board
  - `getGameStatus()` - Determine game status (waiting/in_progress/finished)
  - `formatTimeAgo()` - Human-readable timestamps
  - `getWinner()` - Calculate game winner
  - `getCurrentTurn()` - Get turn number
- `russianPlural.ts` - **[NEW]** Russian plural form helper
  - `getRussianPluralForm()` - Handles 3 Russian plural forms
- `boardValidation.ts` - Board cell click rules (Balda game logic)
  - `canClickCell()` - Implements adjacency rules, letter placement validation
  - `isPositionInWordPath()`, `getPositionPathIndex()`, `isPositionSelected()`
- `moveValidation.ts` - Move validation and construction
  - `formWordFromPath()` - Constructs word from selected positions
  - `canSubmitMove()` - Validates move readiness
  - `buildMoveBody()` - Creates API request payload
- `classNames.ts` - CSS class utilities (cn helper)
- `gamePathFinder.ts` - Path-finding algorithms for word validation

#### API Client (`src/web/lib/client.ts`)
- Type-safe API methods for all backend endpoints (with JSDoc)
- WebSocket connection for real-time game updates
- Automatic state synchronization
- Logger integration for error tracking

#### Production Features
- ✅ **Error Logging**: Production-grade logger with error tracking
- ✅ **Environment Config**: Type-safe centralized configuration
- ✅ **Code Optimization**: 6 unused components removed (~21 kB)
- ✅ **Full Documentation**: JSDoc coverage on all key modules
- ✅ **Russian Localization**: 100% translated UI (28 strings)
- ✅ **Zero Technical Debt**: No dead code, no duplication
- ✅ **Production Build**: 72 kB gzipped bundle size

#### Key Features
- **Real-time Updates**: WebSocket integration for live game state
- **AI Players**: Automatic move execution for AI opponents
- **Auto Suggestions**: Suggestions load automatically on player's turn
- **Dark Theme**: Modern UI styled with Tailwind CSS
- **Quick Start**: One-click 5x5 game with random Russian words
- **Separation of Concerns**: Components contain minimal logic, utilities are pure
- **Error Tracking**: All errors logged and persisted for debugging

### Key Implementation Patterns

1. **Shared Modules Architecture**: Centralized types and configuration in `src/shared/` (1,900+ lines)
   - Single source of truth for game rules, scoring, validation, i18n
   - Type-safe domain models shared between server and web
   - Re-export strategy for backward compatibility during migration
   - Hierarchical config objects (`SUGGESTION_LIMITS.MAX` vs flat constants)
2. **Repository Pattern**: `gameStore.ts` translates between domain model (`GameState`) and persistence model (normalized PostgreSQL tables)
3. **Hybrid Dictionary**: PostgreSQL as source of truth, in-memory Trie for O(k) synchronous lookups
4. **Error Handling**: Result<T, E> pattern (functional style) + custom error classes with structured responses
5. **Performance**: Memoized path-finding (LRU cache), prefix pruning in suggestions, incremental move syncing
6. **Type Safety**: Strict TypeScript, shared type definitions, TypeBox runtime validation, Drizzle ORM type inference, immutable state updates
7. **Transaction-Based Writes**: Multi-table inserts wrapped in database transactions for ACID guarantees
8. **Real-time Updates**: WebSocket auto-reconnect in CLI, broadcast on state changes
9. **Code Style**: @antfu/eslint-config (single quotes, no semicolons, 2-space indent)

## Environment Variables

### Backend
- `DATABASE_URL` - PostgreSQL connection string (e.g., `postgresql://balda:balda@localhost:5432/balda`)
  - **Required for production**. Falls back to file-based storage if not set.
- `PORT` - Backend server port (default: 3000)
- `NODE_ENV` - Environment mode: `development` or `production`
- `JWT_SECRET` - Secret key for JWT token signing (required for authentication)
- `JWT_REFRESH_SECRET` - Secret key for refresh token signing (required)
- `LOG_LEVEL` - Logging verbosity: `debug`, `info`, `warn`, `error` (default: `info`)
- `STORAGE_DIR` - Game persistence directory for file-based fallback (default: `./data/games`)

**Deprecated (no longer used with PostgreSQL):**
- `DICT_PATH` - Dictionary file path (only used when DATABASE_URL not set)

### Web Frontend
- `VITE_API_URL` - Backend API URL (default: http://localhost:3000)
- `MODE` - Build mode (development/production, managed by Vite)

Web frontend uses `src/web/config/env.ts` for type-safe environment access.

## Production Deployment

The web frontend is production-ready. See [PRODUCTION_READY.md](./PRODUCTION_READY.md) for:
- Deployment checklist
- Error monitoring setup (Sentry/LogRocket)
- Bundle analysis
- Maintenance guidelines
- Code quality metrics
