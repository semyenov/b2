# Balda Word Game 🎮

[![TypeScript](https://img.shields.io/badge/TypeScript-5.9-blue?logo=typescript)](https://www.typescriptlang.org/)
[![Bun](https://img.shields.io/badge/Bun-1.3-black?logo=bun)](https://bun.sh)
[![Elysia](https://img.shields.io/badge/Elysia-1.4-orange)](https://elysiajs.com)
[![React](https://img.shields.io/badge/React-19-blue?logo=react)](https://react.dev)
[![License](https://img.shields.io/badge/license-MIT-green)](./LICENSE)
[![PRs Welcome](https://img.shields.io/badge/PRs-welcome-brightgreen.svg)](./CONTRIBUTING.md)

A high-performance word game server built with [Bun](https://bun.sh), [Elysia](https://elysiajs.com), and TypeScript. Balda is a word-building game where players take turns adding letters to a grid and forming new words.

**🎯 Production Ready** | **📚 [API Docs](http://localhost:3000/swagger)** | **🤝 [Contributing](./CONTRIBUTING.md)**

## Features

### Backend
- 🎮 **Complete Game Logic** - Full Balda game implementation with move validation, scoring, and turn management
- 🔄 **Real-time Updates** - WebSocket support for live game state broadcasting
- 🤖 **AI Suggestions** - Smart move suggestions using dictionary analysis and letter frequency
- 📚 **PostgreSQL Dictionary** - 50,910+ Russian words with in-memory Trie caching for instant lookups
- 🗄️ **Normalized Database** - Relational PostgreSQL schema with proper foreign keys and indexes
- ✅ **Type-Safe API** - Full TypeScript support with runtime validation using TypeBox
- 🚀 **High Performance** - Built on Bun runtime with optimized path-finding and memoization
- 🔍 **Detailed Error Handling** - Custom error classes with informative messages
- 🧩 **Modular Architecture** - Plugin-based route organization with Elysia framework
- 💾 **Dual Storage** - PostgreSQL (recommended) or file-based fallback

### Frontend
- 🖥️ **CLI Frontend** - Interactive terminal interface built with React Ink
- 🌐 **Web Frontend** - Production-ready React web UI (Vite + Tailwind CSS)
  - 🇷🇺 **Fully Localized** - Complete Russian translation
  - 📦 **Optimized Bundle** - 234 kB (72 kB gzipped)
  - 📊 **Production Logger** - Error tracking with sessionStorage
  - ⚙️ **Environment Config** - Type-safe configuration management
  - 📚 **Comprehensive Docs** - Full JSDoc coverage
  - 🎯 **Clean Architecture** - Separated concerns (components/hooks/utils)
  - 🧹 **Zero Dead Code** - Unused components removed

## Quick Start

### Prerequisites

1. **Install Bun** (if not already installed):
```bash
curl -fsSL https://bun.sh/install | bash
```

2. **Start PostgreSQL** (recommended):
```bash
docker compose up -d
```

### Installation

```bash
# Install dependencies
bun install

# Set up environment variables
cp .env.example .env
# Edit .env with your configuration

# Import Russian dictionary (50,910 words)
bun run dict:import

# Run database migrations
bunx drizzle-kit migrate
```

### Development

Start the development server with hot reload:

```bash
bun run dev
```

Server will start at `http://localhost:3000` with:
- 🗄️ PostgreSQL database connected
- 📚 50,910 Russian words loaded
- 📡 WebSocket support enabled
- 📖 API docs at `/swagger`

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
- 🎨 Modern React UI with dark theme
- ⚡ Real-time WebSocket updates
- 🤖 AI player automation
- 💡 Auto-loading move suggestions
- 🚀 Quick start 5x5 games
- 🇷🇺 Russian alphabet input grid
- 📦 Production-ready (72 kB gzipped)
- 📊 Error tracking and logging
- ⚙️ Environment configuration

**Production Status**: ✅ Ready to deploy
- Zero TypeScript errors
- Optimized bundle size
- Production error logging
- Comprehensive documentation

Build for production:
```bash
bun run build:web
```

For detailed web frontend documentation, see [WEB_FRONTEND.md](./WEB_FRONTEND.md) and [PRODUCTION_READY.md](./PRODUCTION_READY.md).

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

### Backend Configuration

Create a `.env` file in the project root:

```bash
# Database Configuration (PostgreSQL - Recommended)
DATABASE_URL=postgresql://balda:balda@localhost:5432/balda

# Server Configuration
PORT=3000
NODE_ENV=development

# JWT Authentication
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production
JWT_REFRESH_SECRET=your-super-secret-refresh-key-change-this-in-production

# Logging
LOG_LEVEL=debug
```

**Available Backend Variables:**
- `DATABASE_URL` - PostgreSQL connection string (recommended for production)
  - If not set, falls back to file-based storage in `./data/games`
  - Example: `postgresql://username:password@localhost:5432/balda`
- `PORT` - HTTP server port (default: 3000)
- `NODE_ENV` - Environment mode: `development` or `production`
- `JWT_SECRET` - Secret key for JWT token signing (required for authentication)
- `JWT_REFRESH_SECRET` - Secret key for refresh token signing (required)
- `LOG_LEVEL` - Logging verbosity: `debug`, `info`, `warn`, `error` (default: `info`)

### Web Frontend Configuration

Create a `.env` file in `src/web/` (optional):

```bash
# API URL (defaults to http://localhost:3000)
VITE_API_URL=http://localhost:3000

# Environment mode (set by Vite)
MODE=development
```

**Available Frontend Variables:**
- `VITE_API_URL` - Backend API base URL (default: http://localhost:3000)
- `MODE` - Build mode (development/production, managed by Vite)

The web frontend uses centralized configuration in `src/web/config/env.ts` for type-safe environment access.

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

### 🗄️ Database Normalization & PostgreSQL Dictionary (Oct 16, 2025)

Complete architectural overhaul of data persistence layer:

**Database Schema Normalization:**
- ✅ Migrated from denormalized JSONB to properly normalized relational schema
- ✅ Separate tables for games, players, moves, and used words with foreign keys
- ✅ Improved query performance with proper indexes
- ✅ Better data integrity with ON DELETE CASCADE constraints
- ✅ Enabled advanced analytics queries (top players, move history, statistics)

**PostgreSQL Dictionary Integration:**
- ✅ Integrated `PostgresDictionary` with hybrid caching strategy
- ✅ 50,910+ Russian words loaded into in-memory Trie at startup
- ✅ Instant synchronous lookups via `CachedPostgresDictionary`
- ✅ Multi-language support ready (Russian implemented)
- ✅ Dictionary import scripts: `bun run dict:import`

**Migration Tools:**
- ✅ Complete data migration script with dry-run mode
- ✅ Safe rollback scripts with confirmation prompts
- ✅ Database reset utility for clean starts
- ✅ Comprehensive migration documentation

See [DATABASE_MIGRATION_GUIDE.md](./DATABASE_MIGRATION_GUIDE.md) and [DICTIONARY_SETUP_POSTGRES.md](./DICTIONARY_SETUP_POSTGRES.md) for details.

### 🚀 Production-Ready Web Frontend (Oct 12, 2025)

Comprehensive production preparation:
- ✅ Removed 6 unused components, optimized bundle to 72 kB gzipped
- ✅ Production error logging with sessionStorage tracking
- ✅ Type-safe environment configuration
- ✅ Full JSDoc documentation coverage
- ✅ 100% Russian localization (28 UI strings)
- ✅ Zero TypeScript errors

See [PRODUCTION_READY.md](./PRODUCTION_READY.md) for full production readiness report.

## Architecture

### Backend Server
The backend follows Elysia best practices with a modular, production-ready architecture:
- **Normalized Database** - PostgreSQL with separate tables for games, players, moves, words
- **Hybrid Dictionary** - PostgreSQL storage with in-memory Trie caching for O(k) lookups
- **Custom Error Classes** - Domain-specific errors (`GameNotFoundError`, `InvalidMoveError`)
- **TypeBox Schemas** - Runtime validation with detailed error messages
- **Plugin System** - Organized route handlers (`dictionaryPlugin`, `gamesPlugin`)
- **WebSocket Hub** - Centralized real-time broadcast management
- **Drizzle ORM** - Type-safe database queries with full TypeScript inference
- **Repository Pattern** - Clean separation between domain models and persistence

### Web Frontend (Production-Ready)
The web frontend follows clean architecture with strict separation of concerns:
- **Configuration Layer** (`config/`) - Environment and app configuration
- **Presentation Layer** (`components/`) - React components (thin, JSX-focused, 9 files)
- **State Layer** (`hooks/`) - Custom React hooks (state + side effects, 5 files)
- **Business Logic** (`utils/`) - Pure functions (no React dependencies, 7 files)
- **API Layer** (`lib/`) - Type-safe backend communication

**Key directories:**
- `src/web/config/` - **[NEW]** Type-safe environment configuration
- `src/web/components/` - React presentation components (optimized, 9 active)
- `src/web/hooks/` - Custom React hooks for state management
- `src/web/utils/` - Pure functions for game rules, validation, logging, helpers
- `src/web/lib/` - API client and WebSocket integration

**Production Features:**
- ✅ Error logging with tracking (`utils/logger.ts`)
- ✅ Environment configuration (`config/env.ts`)
- ✅ Extracted game helpers (`utils/gameHelpers.ts`)
- ✅ Full JSDoc documentation
- ✅ Zero dead code (6 unused components removed)
- ✅ Optimized bundle (234 kB, 72 kB gzipped)

For detailed architecture information, see:
- [ARCHITECT.md](./ARCHITECT.md) - Complete system architecture overview
- [CLAUDE.md](./CLAUDE.md) - Project overview and development guide
- [DATABASE_MIGRATION_GUIDE.md](./DATABASE_MIGRATION_GUIDE.md) - Database normalization details
- [DICTIONARY_SETUP_POSTGRES.md](./DICTIONARY_SETUP_POSTGRES.md) - Dictionary setup guide
- [PRODUCTION_READY.md](./PRODUCTION_READY.md) - Production deployment guide
- [WEB_FRONTEND.md](./WEB_FRONTEND.md) - Web frontend documentation
- [CLI_GUIDE.md](./CLI_GUIDE.md) - CLI usage guide

## Code Quality

This project uses [@antfu/eslint-config](https://github.com/antfu/eslint-config) for consistent code style:
- Single quotes
- 2-space indentation
- Sorted imports
- No semicolons

## License

MIT
