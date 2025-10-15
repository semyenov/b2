# Changelog

All notable changes to the Balda Word Game project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### Major Changes

#### Database Normalization (2025-10-16)

Complete architectural overhaul of the persistence layer with normalized PostgreSQL schema.

**Added:**
- Normalized database schema with separate tables for games, players, moves, and used words
- Drizzle ORM integration for type-safe database queries
- Foreign key constraints with ON DELETE CASCADE for referential integrity
- Proper indexes for query performance optimization
- Transaction-based writes for ACID guarantees
- Repository pattern implementation in `gameStore.ts`
- Data migration script with dry-run mode (`migrate-to-normalized-db.ts`)
- Safe rollback script with confirmation prompts (`rollback-normalized-db.ts`)
- Database reset utility (`reset-db.ts`)
- Database viewer utility (`db-viewer.ts`)
- Comprehensive migration documentation

**Database Schema:**
- `games` - Core game metadata (id, size, baseWord, status, timestamps)
- `game_players` - Player records with junction table pattern
- `moves` - Individual move history with position, letter, word, score
- `game_words` - Used words tracking with foreign keys
- `users` - User authentication (prepared for future features)
- `words` - Dictionary storage with language support

**Migration Commands:**
- `bun run db:reset --confirm` - Drop and recreate database
- `bun run db:view` - View database contents
- `bun run migrate:normalize` - Migrate old JSONB data to normalized schema
- `bun run migrate:normalize:dry` - Preview migration changes
- `bun run migrate:rollback --confirm` - Rollback to old schema

**Improved:**
- Query performance with JOIN-based queries instead of JSONB parsing
- Data integrity with proper foreign key constraints
- Analytics capabilities with normalized structure
- Incremental move syncing (only inserts new moves)

**Technical Details:**
- Reconstructs `GameState` domain model from normalized tables
- Zero-downtime migration support (old JSONB columns kept during transition)
- Batch processing with progress reporting in migration scripts

#### PostgreSQL Dictionary Integration (2025-10-16)

Integrated PostgreSQL-backed dictionary with hybrid caching strategy.

**Added:**
- `PostgresDictionary` class for PostgreSQL-backed dictionary storage
- `CachedPostgresDictionary` class with hybrid approach:
  - Loads all words from PostgreSQL into in-memory Trie at startup
  - Provides synchronous `has()` and `hasPrefix()` methods
  - O(k) lookup time where k is word length
- Dictionary import script: `bun run dict:import`
- Multi-language support (Russian implemented, extensible)
- 50,910+ Russian words included

**Dictionary Commands:**
- `bun run dict:import` - Import Russian dictionary to PostgreSQL
- `bun run dict:import:en <file> en` - Import custom English dictionary

**Improved:**
- Dictionary now persisted in PostgreSQL (single source of truth)
- Fast synchronous lookups via in-memory Trie cache
- Support for multiple languages with language column
- Dictionary metadata tracking (word count, alphabet, letter frequencies)

**Technical Details:**
- Smart fallback: PostgreSQL → File-based → AllowAll
- Game engine compatibility maintained (synchronous interface)
- Unique constraint on (word, language) pairs
- `getAllWords()` method for cache population

### Production-Ready Web Frontend (2025-10-12)

Comprehensive production preparation with focus on maintainability and performance.

**Added:**
- Production error logging system (`utils/logger.ts`)
  - 4 log levels (DEBUG, INFO, WARN, ERROR)
  - SessionStorage tracking (last 50 errors)
  - Environment-aware (silent debug logs in production)
  - Ready for Sentry/LogRocket integration
- Type-safe environment configuration (`config/env.ts`)
- Extracted game helper utilities (`utils/gameHelpers.ts`)
  - `getBaseWord()` - Extract center word from board
  - `getGameStatus()` - Determine game status
  - `formatTimeAgo()` - Human-readable timestamps
  - `getWinner()` - Calculate game winner
  - `getCurrentTurn()` - Get turn number
- Russian plural form helper (`utils/russianPlural.ts`)
- Full JSDoc documentation on all key modules

**Removed:**
- 6 unused legacy components (~21 kB dead code)
  - `MoveInput`, `SuggestionsGrid`, `BottomControls`
  - `GameInfo`, `Suggestions`, `PlayerScoreBar`

**Improved:**
- Bundle size reduced to 234.57 kB (72.82 kB gzipped)
- Component count reduced by 40% (15 → 9 files)
- GameList refactored to use extracted helpers (DRY principle)
- Logger integrated into ApiClient and ErrorBoundary
- Zero TypeScript errors
- Zero technical debt

**Components (9 active):**
- `App.tsx` - Main application with routing
- `Banner.tsx` - Toast notifications
- `Board.tsx` - Game board display
- `CreateGame.tsx` - Game creation form
- `ErrorBoundary.tsx` - Error boundary with logger
- `GameList.tsx` - Available games browser
- `GamePanel.tsx` - Main game interface
- `MenuButton.tsx` - Reusable button
- `PlayerPanel.tsx` - Player info sidebar
- `StatusMessage.tsx` - Game instructions

### Complete Russian Localization (2025-10-12)

Full Russian localization for web frontend.

**Added:**
- 100% Russian user-facing content (28 UI strings)
- Russian plural form helper for correct grammar
- Localized error messages and validation
- Redesigned send button with capitalized "ОТПРАВИТЬ"

**Improved:**
- Consistent Russian terminology throughout UI
- Proper plural forms (игрок/игрока/игроков)
- Professional Russian translations

### Web Frontend Architecture Refactoring (2025-10-11)

Refactored web frontend to follow clean architecture principles.

**Added:**
- Board validation utilities (`utils/boardValidation.ts`)
  - `canClickCell()` - Board interaction rules
  - `isPositionInWordPath()`, `getPositionPathIndex()`, `isPositionSelected()`
- Move validation utilities (`utils/moveValidation.ts`)
  - `formWordFromPath()` - Construct word from positions
  - `canSubmitMove()` - Move readiness validation
  - `buildMoveBody()` - API request payload builder
- Form state management hook (`hooks/useCreateGameForm.ts`)

**Improved:**
- Component complexity reduced by 17-33%
- Business logic extracted into testable pure functions
- Clear separation between presentation, state, and logic layers
- Components are now thin JSX-focused presentation layers
- Improved testability with pure utility functions

### Critical Bug Fixes (2025-10-11)

#### Base Word Not Marked as Used

**Fixed:**
- Base word (e.g., "АФИША", "БАЛДА") now automatically added to `usedWords` during game creation
- Players can no longer score points by claiming the base word as their move
- Game behavior now matches official Balda rules

#### Suggestions Algorithm Path Tracking

**Fixed:**
- Added `path: Set<string>` tracking to prevent cell reuse in paths
- AI suggestions are now guaranteed to be valid and playable
- Algorithm now matches validation logic used for move verification

**Technical Details:**
- DFS path traversal now tracks visited cells within current path
- Prevents "No valid path for the claimed word" errors on AI suggestions

### CLI Russian Localization (2025-10-11)

Full Russian localization for CLI interface.

**Added:**
- Russian letters for board columns (А, Б, В, Г, Д)
- Russian position format (1А, 2Б, 3В)
- All UI texts, menus, and messages in Russian
- Russian keyboard layout support for all commands
- Dual keyboard support (Latin/Cyrillic)

**Commands with Russian Support:**
- Make Move: `m` / `м` / `ь`
- Refresh: `r` / `р` / `к`
- Suggestions: `s` / `с` / `ы`
- Back: `b` / `б` / `и`
- Watch: `w` / `ц` / `в`

### Documentation

**Added:**
- `DATABASE_MIGRATION_GUIDE.md` - Complete normalization guide
- `DICTIONARY_SETUP_POSTGRES.md` - PostgreSQL dictionary setup
- `QUICK_START_DICTIONARY.md` - Dictionary quick reference
- `CHANGELOG.md` - This file

**Updated:**
- `README.md` - Updated with normalized DB and PostgreSQL dictionary
- `CLAUDE.md` - Updated architecture and environment variables
- `CONTRIBUTING.md` - Updated setup instructions and database section

**Removed:**
- 24 legacy documentation files:
  - Implementation reports (BASE_WORD_FIX, SUGGESTIONS_BUG_FIX, etc.)
  - Migration summaries (COLOR_MIGRATION_SUMMARY, SEMANTIC_COLORS_MIGRATION, etc.)
  - Feature docs (CLI_IMPROVEMENTS, GAME_LIST_ENHANCEMENTS, etc.)
  - Duplicate/obsolete guides (DATABASE_SETUP, DICTIONARY_SETUP, QUICK_START, etc.)

### Environment Variables

**Added:**
- `DATABASE_URL` - PostgreSQL connection string (required for production)
- `JWT_SECRET` - JWT token signing key
- `JWT_REFRESH_SECRET` - Refresh token signing key
- `LOG_LEVEL` - Logging verbosity (debug/info/warn/error)
- `LOG_FORMAT` - Log format (pretty/json)

**Deprecated:**
- `DICT_PATH` - Only used when DATABASE_URL not set (fallback)
- `STORAGE_DIR` - Only used when DATABASE_URL not set (fallback)

## Release Notes

### Migration Guide

If upgrading from an older version with file-based storage:

1. **Backup your data:**
   ```bash
   cp -r ./data/games ./data/games.backup
   ```

2. **Start PostgreSQL:**
   ```bash
   docker compose up -d
   ```

3. **Configure environment:**
   ```bash
   echo 'DATABASE_URL=postgresql://balda:balda@localhost:5432/balda' >> .env
   ```

4. **Run migrations:**
   ```bash
   bunx drizzle-kit migrate
   ```

5. **Import dictionary:**
   ```bash
   bun run dict:import
   ```

6. **Migrate existing games (optional):**
   ```bash
   bun run migrate:normalize:dry  # Preview changes
   bun run migrate:normalize      # Execute migration
   ```

### Breaking Changes

- PostgreSQL is now the recommended storage backend
- File-based storage (`DICT_PATH`, `STORAGE_DIR`) is deprecated
- Environment variables `JWT_SECRET` and `JWT_REFRESH_SECRET` are now required

### Upgrade Recommendations

- **Development**: Use PostgreSQL with Docker Compose
- **Production**: Use PostgreSQL (required for best performance)
- **Testing**: File-based storage still available as fallback

## Previous Versions

For changes before the database normalization, see:
- Git history: `git log --before="2025-10-16"`
- Removed documentation files in git history

---

**Legend:**
- **Added** - New features
- **Changed** - Changes in existing functionality
- **Deprecated** - Soon-to-be removed features
- **Removed** - Removed features
- **Fixed** - Bug fixes
- **Security** - Security improvements
