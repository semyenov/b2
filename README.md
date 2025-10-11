# Balda Word Game Server

A high-performance word game server built with [Bun](https://bun.sh), [Elysia](https://elysiajs.com), and TypeScript. Balda is a word-building game where players take turns adding letters to a grid and forming new words.

## Features

- 🎮 **Complete Game Logic** - Full Balda game implementation with move validation, scoring, and turn management
- 🔄 **Real-time Updates** - WebSocket support for live game state broadcasting
- 🤖 **AI Suggestions** - Smart move suggestions using dictionary analysis and letter frequency
- 📚 **Flexible Dictionary** - Support for custom dictionary files or permissive mode
- ✅ **Type-Safe API** - Full TypeScript support with runtime validation using TypeBox
- 🚀 **High Performance** - Built on Bun runtime for maximum speed
- 🔍 **Detailed Error Handling** - Custom error classes with informative messages
- 🧩 **Modular Architecture** - Plugin-based route organization
- 💾 **Persistent Storage** - Games are saved to disk using unstorage with filesystem driver
- 🖥️ **CLI Frontend** - Interactive terminal interface built with React Ink
- 🌐 **Web Frontend** - Modern React web UI with clean architecture (Vite + Tailwind CSS)

## Quick Start

### Installation

```bash
bun install
```

### Development

Start the development server with hot reload:

```bash
bun run dev
```

Server will start at `http://localhost:3000`

### CLI Frontend

Run the interactive CLI frontend:

```bash
bun run cli
```

The CLI provides an interactive interface to:
- Create new games
- List and select existing games
- Play games with a visual board display
- Get AI move suggestions
- Make moves with guided input

**Note:** The server must be running for the CLI to work.

For detailed CLI usage instructions, see [CLI_GUIDE.md](./CLI_GUIDE.md).

### Web Frontend

Run the web frontend:

```bash
# Start backend (in one terminal)
bun run dev

# Start web frontend (in another terminal)
bun run dev:web

# Or start both at once
bun run dev:all
```

The web frontend will be available at `http://localhost:5173`

Features:
- Modern React UI with dark theme
- Real-time WebSocket updates
- AI player automation
- Auto-loading move suggestions
- Quick start 5x5 games
- Russian alphabet input grid

For detailed web frontend documentation, see [WEB_FRONTEND.md](./WEB_FRONTEND.md).

### Linting

Check code quality:

```bash
bun run lint
```

Auto-fix issues:

```bash
bun run lint:fix
```

## Environment Variables

Create a `.env` file in the project root:

```bash
# Dictionary Configuration
DICT_PATH=./data/dictionaries/russian.txt

# Server Configuration
PORT=3000

# Storage Configuration
STORAGE_DIR=./data/games

# Environment
NODE_ENV=development
```

**Available Environment Variables:**
- `PORT` - HTTP server port (default: 3000)
- `DICT_PATH` - Path to dictionary file (optional; uses permissive mode if unset)
  - **Included:** 50,910 Russian words in `./data/dictionaries/russian.txt`
  - Format: One word per line, UTF-8 encoding
  - Case-insensitive matching
- `NODE_ENV` - Set to `production` to hide detailed error messages
- `STORAGE_DIR` - Game storage directory (default: `./data/games`)

## API Endpoints

### Health Check
- `GET /health` - Server health status

### Dictionary
- `GET /dictionary` - Get dictionary metadata

### Games
- `GET /games` - List all games
- `POST /games` - Create a new game
- `GET /games/:id` - Get game state
- `POST /games/:id/move` - Submit a move
- `GET /games/:id/placements` - Find valid placements for a word
- `GET /games/:id/suggest` - Get AI move suggestions

### WebSocket
- `WS /games/:id/ws` - Real-time game updates

## Recent Updates

### ✅ Web Frontend Architecture Refactoring (Oct 11, 2025)

Refactored web frontend to follow clean architecture principles with separation of concerns:
- **Created utilities**: `boardValidation.ts`, `moveValidation.ts` - Pure functions for business logic
- **Created hooks**: `useCreateGameForm.ts` - Form state management
- **Reduced component complexity**: 17-33% code reduction in components
- **Improved testability**: Business logic extracted into testable pure functions
- **Better maintainability**: Clear separation between presentation, state, and logic layers

Components are now thin presentation layers that delegate to utilities and hooks for all business logic.

For technical details, see [CLIENT_LOGIC_REFACTOR.md](./CLIENT_LOGIC_REFACTOR.md).

### ✅ Critical Bug Fix: Base Word Not Marked as Used (Oct 11, 2025)

Fixed a game-breaking bug where the base word was not added to `usedWords` when creating a new game. This allowed players to reuse the base word (e.g., "АФИША", "БАЛДА") for points, which violates the rules of Balda.

**What was fixed:**
- Base word is now automatically added to `usedWords` during game creation
- Players can no longer score points by claiming the base word as their move
- Game behavior now matches the official Balda rules

For technical details, see [BASE_WORD_FIX.md](./BASE_WORD_FIX.md).

### ✅ Critical Bug Fix: Suggestions Algorithm (Oct 11, 2025)

Fixed a critical bug in the AI suggestions engine where the algorithm was generating invalid move suggestions. The issue was that the DFS path traversal was not tracking visited cells within the current path, allowing the same cell to be reused multiple times in a single word.

**What was fixed:**
- Added `path: Set<string>` tracking to prevent cell reuse in paths
- All AI suggestions are now guaranteed to be valid and playable
- Algorithm now matches the same validation logic used for move verification

For technical details, see [SUGGESTIONS_BUG_FIX.md](./SUGGESTIONS_BUG_FIX.md).

### 🇷🇺 Full Russian Localization (Oct 11, 2025)

The CLI interface has been fully localized to Russian:
- Russian letters for board columns (А, Б, В, Г, Д)
- Russian position format (1А, 2Б, 3В)
- All UI texts, menus, and messages in Russian
- Russian keyboard layout support for all commands

See [RUSSIAN_LOCALIZATION.md](./RUSSIAN_LOCALIZATION.md) and [RUSSIAN_KEYBOARD_SUPPORT.md](./RUSSIAN_KEYBOARD_SUPPORT.md).

## Architecture

### Backend Server
The backend follows Elysia best practices with a modular plugin architecture:
- **Custom Error Classes** - Domain-specific errors (`GameNotFoundError`, `InvalidMoveError`, etc.)
- **TypeBox Schemas** - Runtime validation with detailed error messages
- **Plugin System** - Organized route handlers (`dictionaryPlugin`, `gamesPlugin`)
- **WebSocket Hub** - Centralized broadcast management
- **Dictionary System** - Trie-based dictionary with prefix support
- **Persistent Storage** - Unstorage with filesystem driver for game data persistence

### Web Frontend
The web frontend follows clean architecture with strict separation of concerns:
- **Presentation Layer** - React components (thin, JSX-focused)
- **State Layer** - Custom React hooks (state + side effects)
- **Business Logic** - Pure utility functions (no React dependencies)
- **API Layer** - Type-safe backend communication

**Key directories:**
- `src/web/components/` - React presentation components
- `src/web/hooks/` - Custom React hooks for state management
- `src/web/utils/` - Pure functions for game rules and validation
- `src/web/lib/` - API client and WebSocket integration

For detailed architecture information, see [CLAUDE.md](./CLAUDE.md) and [CLIENT_LOGIC_REFACTOR.md](./CLIENT_LOGIC_REFACTOR.md).

## Code Quality

This project uses [@antfu/eslint-config](https://github.com/antfu/eslint-config) for consistent code style:
- Single quotes
- 2-space indentation
- Sorted imports
- No semicolons

## License

MIT
