# Contributing to Balda Game

Thank you for your interest in contributing to the Balda word game! This guide will help you get started.

## Prerequisites

Before you begin, ensure you have the following installed:

- **[Bun](https://bun.sh)** >= 1.0 - Fast JavaScript runtime and package manager
- **[Git](https://git-scm.com)** - Version control
- **Code Editor** - [VS Code](https://code.visualstudio.com/) recommended with the following extensions:
  - [ESLint](https://marketplace.visualstudio.com/items?itemName=dbaeumer.vscode-eslint)
  - [TypeScript](https://marketplace.visualstudio.com/items?itemName=ms-vscode.vscode-typescript-next)

Required for full functionality:
- **[Docker](https://www.docker.com/)** - For PostgreSQL database (recommended)
- Or **[PostgreSQL](https://www.postgresql.org/)** >= 14 - Manual installation

## Quick Start

### 1. Fork and Clone

```bash
# Fork the repository on GitHub, then clone your fork
git clone https://github.com/YOUR_USERNAME/balda.git
cd balda
```

### 2. Install Dependencies

```bash
bun install
```

This will install all required dependencies for both backend and frontend.

### 3. Start PostgreSQL Database

```bash
# Start PostgreSQL with Docker Compose (recommended)
docker compose up -d

# Verify PostgreSQL is running
docker compose ps
```

### 4. Set Up Environment

```bash
# Copy the example environment file
cp .env.example .env

# Edit .env with your configuration
# Make sure DATABASE_URL is set:
# DATABASE_URL=postgresql://balda:balda@localhost:5432/balda
```

### 5. Run Database Setup

```bash
# Run database migrations
bunx drizzle-kit migrate

# Import Russian dictionary (50,910 words)
bun run dict:import

# Verify setup
bun run db:view
```

See [Environment Variables](#environment-variables) section below for details.

### 6. Start Development Servers

You have several options:

```bash
# Option 1: Start backend only (port 3000)
bun run dev

# Option 2: Start web frontend only (port 5173, requires backend running)
bun run dev:web

# Option 3: Start both backend and web frontend at once
bun run dev:all

# Option 4: Start CLI frontend (requires backend running)
bun run cli
```

### 7. Verify Setup

- **Backend API**: Open http://localhost:3000/health - should return `{"status":"ok"}`
- **Swagger Docs**: Open http://localhost:3000/swagger - interactive API documentation
- **Web Frontend**: Open http://localhost:5173 - React web UI
- **CLI Frontend**: Run `bun run cli` in terminal - interactive CLI

## Project Structure

```
balda/
├── src/
│   ├── server/              # Backend (Elysia/Bun)
│   │   ├── engine/          # Game logic (balda.ts, suggest.ts)
│   │   ├── db/              # Database layer (PostgreSQL + Drizzle ORM)
│   │   │   ├── schema.ts    # Normalized database schema
│   │   │   ├── gameStore.ts # Game repository with JOINs
│   │   │   ├── dictionaryStore.ts     # PostgreSQL dictionary
│   │   │   └── cachedDictionary.ts    # Hybrid Trie cache
│   │   ├── routes.ts        # API route handlers
│   │   ├── dictionary.ts    # Legacy file-based dictionary (fallback)
│   │   ├── store.ts         # Legacy file-based storage (fallback)
│   │   └── index.ts         # Server entry point
│   ├── web/                 # Web frontend (React/Vite)
│   │   ├── components/      # React components (9 active files)
│   │   ├── hooks/           # Custom React hooks (5 files)
│   │   ├── utils/           # Pure utility functions (7 files)
│   │   ├── lib/             # API client and WebSocket
│   │   └── config/          # Environment configuration
│   ├── cli/                 # CLI frontend (React Ink)
│   │   ├── components/      # CLI components
│   │   └── index.tsx        # CLI entry point
│   └── shared/              # Shared types and schemas
│       └── schemas.ts       # TypeBox validation schemas
├── drizzle/                 # Database migrations
│   ├── 0000_initial_schema.sql
│   └── 0001_normalized_schema.sql
├── data/
│   └── dictionaries/        # Dictionary source files
│       └── russian.txt      # 50,910 Russian words (for import)
├── scripts/                 # Utility scripts
│   ├── import-dictionary.ts # Import words to PostgreSQL
│   ├── migrate-to-normalized-db.ts  # Data migration
│   ├── rollback-normalized-db.ts    # Schema rollback
│   ├── reset-db.ts          # Database reset
│   └── db-viewer.ts         # Database inspector
├── test/                    # Test files
└── ...                      # Config files (drizzle.config.ts, etc.)
```

For detailed architecture information, see [ARCHITECT.md](./ARCHITECT.md).

## Development Workflow

### 1. Create a Branch

Always create a feature branch from `main`:

```bash
git checkout main
git pull origin main
git checkout -b feature/my-feature
```

Branch naming conventions:
- `feature/` - New features (e.g., `feature/ai-difficulty-levels`)
- `fix/` - Bug fixes (e.g., `fix/dictionary-loading`)
- `docs/` - Documentation updates (e.g., `docs/api-examples`)
- `refactor/` - Code refactoring (e.g., `refactor/game-state`)
- `test/` - Adding tests (e.g., `test/move-validation`)
- `chore/` - Build/tooling changes (e.g., `chore/update-deps`)

### 2. Make Changes

Write your code following our [Code Style](#code-style) guidelines.

**Key principles:**
- **Type Safety** - Use TypeScript strict mode, avoid `any`
- **Immutability** - Prefer immutable updates (spread operator, `Object.assign`)
- **Pure Functions** - Separate business logic from side effects
- **Error Handling** - Use custom error classes, validate inputs
- **Documentation** - Add JSDoc comments for public APIs

### 3. Add Tests

We maintain >80% code coverage. Write tests for:
- New features
- Bug fixes
- Refactored code

```bash
# Run tests
bun test

# Run tests in watch mode
bun test:watch

# Check test coverage
bun test:coverage

# Verify coverage meets threshold (80%)
bun run coverage:check
```

See [Testing Guidelines](#testing-guidelines) for more details.

### 4. Check Code Quality

Before committing, ensure your code passes all checks:

```bash
# Type check
bun run check

# Lint code
bun run lint

# Auto-fix linting issues
bun run lint:fix

# Run all checks
bun run check && bun run lint && bun test
```

### 5. Commit Your Changes

We follow [Conventional Commits](https://www.conventionalcommits.org/) for commit messages:

```bash
git add .
git commit -m "feat: add difficulty levels for AI players"
```

**Commit types:**
- `feat:` - New features
- `fix:` - Bug fixes
- `docs:` - Documentation changes
- `style:` - Code formatting (no functional changes)
- `refactor:` - Code refactoring
- `test:` - Adding or updating tests
- `chore:` - Build, tooling, dependencies

**Examples:**
```bash
git commit -m "feat(ai): add easy/medium/hard difficulty levels"
git commit -m "fix(dictionary): handle UTF-8 encoding correctly"
git commit -m "docs: update API examples in README"
git commit -m "test(balda): add edge cases for path finding"
git commit -m "refactor(store): extract database layer interface"
```

### 6. Push and Create Pull Request

```bash
# Push your branch
git push origin feature/my-feature

# Create a pull request on GitHub
```

**Pull Request Guidelines:**
- Provide a clear description of changes
- Reference related issues (e.g., "Fixes #123")
- Include screenshots/videos for UI changes
- Ensure all CI checks pass
- Request review from maintainers

## Code Style

This project uses [@antfu/eslint-config](https://github.com/antfu/eslint-config) for consistent code style:

- **Single quotes** - Use `'` instead of `"`
- **No semicolons** - JavaScript ASI (Automatic Semicolon Insertion)
- **2-space indentation** - Consistent across all files
- **Sorted imports** - Automatic import sorting
- **Trailing commas** - For multi-line objects/arrays

**TypeScript-specific:**
- Strict mode enabled
- No `any` types (use `unknown` with type guards)
- Explicit return types for public functions
- Prefer interfaces over types for object shapes

**React-specific:**
- Functional components with hooks
- Named exports (not default exports)
- Props interfaces with JSDoc
- Separate presentation from business logic

**Examples:**

```typescript
// Good ✅
import type { GameState } from '../shared/schemas'
import { createGame } from './engine/balda'

export interface CreateGameOptions {
  size: number
  baseWord: string
  players?: string[]
}

export function initializeGame(options: CreateGameOptions): GameState {
  const { size, baseWord, players = ['Player 1', 'Player 2'] } = options
  return createGame(crypto.randomUUID(), { size, baseWord, players })
}

// Bad ❌
import { createGame } from "./engine/balda";
import { GameState } from "../shared/schemas";

export default function initializeGame(options: any) {
  return createGame(crypto.randomUUID(), options);
}
```

## Testing Guidelines

We use **Bun's built-in test runner** for fast, reliable testing.

### Writing Tests

Follow the **AAA pattern** (Arrange, Act, Assert):

```typescript
import { describe, expect, test } from 'bun:test'
import { createGame } from './engine/balda'

describe('createGame', () => {
  test('should create game with correct initial state', () => {
    // Arrange
    const id = 'test-game'
    const options = {
      size: 5,
      baseWord: 'БАЛДА',
      players: ['Alice', 'Bob'],
    }

    // Act
    const game = createGame(id, options)

    // Assert
    expect(game.id).toBe(id)
    expect(game.size).toBe(5)
    expect(game.players).toEqual(['Alice', 'Bob'])
    expect(game.currentPlayerIndex).toBe(0)
    expect(game.scores).toEqual({ Alice: 0, Bob: 0 })
  })

  test('should place base word in center row', () => {
    const game = createGame('test', { size: 5, baseWord: 'БАЛДА' })
    const centerRow = game.board[2]
    expect(centerRow.join('')).toBe('БАЛДА')
  })
})
```

### Test Coverage

Maintain >80% code coverage:

```bash
# Generate coverage report
bun test:coverage

# Check if coverage meets threshold
bun run coverage:check
```

**Coverage targets:**
- Statements: 80%
- Branches: 80%
- Functions: 80%
- Lines: 80%

### What to Test

**High priority:**
- Core game logic (move validation, scoring, path finding)
- API endpoints (routes, error handling)
- Utility functions (validation, helpers)

**Medium priority:**
- React hooks (state management)
- UI components (user interactions)

**Low priority:**
- Simple getters/setters
- Type definitions

## Environment Variables

Create a `.env` file in the project root (see `.env.example` for template).

### Backend Configuration

```bash
# Database Configuration (Required for production)
DATABASE_URL=postgresql://balda:balda@localhost:5432/balda

# Server Configuration
PORT=3000                                    # HTTP server port
NODE_ENV=development                         # Environment (development|production)

# Authentication
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production
JWT_REFRESH_SECRET=your-super-secret-refresh-key-change-this-in-production

# Logging
LOG_LEVEL=debug                              # debug|info|warn|error
LOG_FORMAT=pretty                            # pretty|json

# Legacy/Fallback (only used when DATABASE_URL not set)
# DICT_PATH=./data/dictionaries/russian.txt  # Dictionary file path (deprecated)
# STORAGE_DIR=./data/games                   # File-based storage (deprecated)
```

### Web Frontend Configuration

```bash
# API URL (defaults to http://localhost:3000)
VITE_API_URL=http://localhost:3000

# Sentry (future feature)
# VITE_SENTRY_DSN=https://your-frontend-sentry-dsn
```

The web frontend uses centralized configuration in `src/web/config/env.ts` for type-safe environment access.

## Database Setup

PostgreSQL is the primary data storage (recommended for all environments).

### Using Docker Compose (Recommended)

```bash
# Start PostgreSQL container
docker compose up -d

# Run migrations
bunx drizzle-kit migrate

# Import dictionary
bun run dict:import

# View database contents
bun run db:view
```

### Manual PostgreSQL Setup (Alternative)

If you prefer manual installation:

```bash
# 1. Install PostgreSQL
brew install postgresql@14  # macOS
# or
sudo apt install postgresql postgresql-contrib  # Ubuntu/Debian

# 2. Create database and user
createdb balda
psql balda -c "CREATE USER balda WITH PASSWORD 'balda';"
psql balda -c "GRANT ALL PRIVILEGES ON DATABASE balda TO balda;"

# 3. Configure environment
echo 'DATABASE_URL=postgresql://balda:balda@localhost:5432/balda' >> .env

# 4. Run migrations and import dictionary
bunx drizzle-kit migrate
bun run dict:import
```

### Database Commands

```bash
# View database contents (games, moves, words, players)
bun run db:view

# Reset database (DESTRUCTIVE - deletes all data!)
bun run db:reset --confirm

# Migrate old JSONB data to normalized schema (if upgrading)
bun run migrate:normalize
bun run migrate:normalize:dry  # Dry-run to preview changes

# Rollback to old schema (DESTRUCTIVE!)
bun run migrate:rollback --confirm
```

### Dictionary Management

```bash
# Import Russian dictionary (50,910 words)
bun run dict:import

# Import custom English dictionary
bun run dict:import:en ./path/to/english.txt en

# Import any dictionary
bun run scripts/import-dictionary.ts <file-path> <language>
```

## API Documentation

Interactive API documentation is available at:
- **Swagger UI**: http://localhost:3000/swagger
- **OpenAPI JSON**: http://localhost:3000/swagger/json

All endpoints are documented with:
- Request/response schemas
- Parameter descriptions
- Example payloads
- Error responses

## Common Tasks

### Add a New API Endpoint

1. Define schema in `src/shared/schemas.ts`:
   ```typescript
   export const MyRequestSchema = Type.Object({
     field: Type.String({ minLength: 1 }),
   })
   ```

2. Add route in `src/server/routes.ts`:
   ```typescript
   .post('/my-endpoint', async ({ body }) => {
     // Handler logic
   }, {
     body: MyRequestSchema,
     detail: {
       summary: 'My endpoint',
       description: 'Description here',
       tags: ['games'],
     },
   })
   ```

3. Update frontend client in `src/web/lib/client.ts`
4. Add tests in `test/`

### Add a New React Component

1. Create component in `src/web/components/`:
   ```typescript
   interface MyComponentProps {
     title: string
     onAction: () => void
   }

   export function MyComponent({ title, onAction }: MyComponentProps) {
     return (
       <div>
         <h2>{title}</h2>
         <button onClick={onAction}>Action</button>
       </div>
     )
   }
   ```

2. Keep components thin - extract logic to hooks/utils
3. Add JSDoc documentation
4. Write tests

### Update Dictionary

```bash
# Edit dictionary file (one word per line, UTF-8)
vim data/dictionaries/russian.txt

# Restart server to reload dictionary
bun run dev
```

## Need Help?

- **Documentation**: Read [ARCHITECT.md](./ARCHITECT.md) for architecture details
- **Development Workflows**: See [docs/DEVELOPMENT.md](./docs/DEVELOPMENT.md)
- **API Reference**: Check http://localhost:3000/swagger
- **Production Guide**: Read [PRODUCTION_READY.md](./PRODUCTION_READY.md)
- **Issues**: File a bug report on [GitHub Issues](https://github.com/semyenov/balda/issues)
- **Discussions**: Ask questions in [GitHub Discussions](https://github.com/semyenov/balda/discussions)

## Code of Conduct

- Be respectful and inclusive
- Provide constructive feedback
- Focus on what is best for the community
- Show empathy towards other contributors

## License

By contributing, you agree that your contributions will be licensed under the MIT License.

---

**Happy coding!** Thank you for contributing to Balda! 🎮
