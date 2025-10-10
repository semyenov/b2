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

- `PORT` - HTTP server port (default: 3000)
- `DICT_PATH` - Path to dictionary file (optional; uses permissive mode if unset)
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

## Architecture

The codebase follows Elysia best practices with a modular plugin architecture:

- **Custom Error Classes** - Domain-specific errors (`GameNotFoundError`, `InvalidMoveError`, etc.)
- **TypeBox Schemas** - Runtime validation with detailed error messages
- **Plugin System** - Organized route handlers (`dictionaryPlugin`, `gamesPlugin`)
- **WebSocket Hub** - Centralized broadcast management
- **Dictionary System** - Trie-based dictionary with prefix support
- **Persistent Storage** - Unstorage with filesystem driver for game data persistence

For detailed architecture information, see [CLAUDE.md](./CLAUDE.md).

## Code Quality

This project uses [@antfu/eslint-config](https://github.com/antfu/eslint-config) for consistent code style:
- Single quotes
- 2-space indentation
- Sorted imports
- No semicolons

## License

MIT
