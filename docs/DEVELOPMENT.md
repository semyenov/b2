# Development Guide

This guide covers common development workflows, patterns, and best practices for the Balda project.

## Table of Contents

- [Getting Started](#getting-started)
- [Development Workflows](#development-workflows)
- [Architecture Patterns](#architecture-patterns)
- [API Development](#api-development)
- [Frontend Development](#frontend-development)
- [Testing Strategy](#testing-strategy)
- [Database Management](#database-management)
- [Debugging](#debugging)
- [Performance Optimization](#performance-optimization)
- [Deployment](#deployment)

## Getting Started

### Prerequisites

Ensure you have completed the setup steps in [CONTRIBUTING.md](../CONTRIBUTING.md):

```bash
# Install dependencies
bun install

# Copy environment template
cp .env.example .env

# Start development servers
bun run dev:all
```

### Development Server URLs

- **Backend API**: http://localhost:3000
- **Swagger Docs**: http://localhost:3000/swagger
- **Web Frontend**: http://localhost:5173
- **Health Check**: http://localhost:3000/health

## Development Workflows

### Hot Reload Development

The project uses Bun's built-in watch mode for instant feedback:

```bash
# Backend with hot reload
bun run dev

# Frontend with Vite HMR
bun run dev:web

# Both servers (separate terminals recommended for better control)
bun run dev:all
```

**File watching:**
- Backend: Watches `src/server/**/*.ts` and auto-restarts on changes
- Frontend: Vite HMR updates instantly without full page reload
- CLI: Manual restart required (run `bun run cli` again)

### Type Checking

TypeScript type checking runs separately from runtime:

```bash
# One-time type check
bun run check

# Continuous type checking (watch mode)
bun run type-check:watch
```

**Why separate?**
- Bun compiles TypeScript on-the-fly for fast dev server startup
- Type checking in watch mode catches errors while you code
- CI/CD runs full type check before deployment

### Linting & Formatting

We use ESLint with @antfu/eslint-config:

```bash
# Check for linting errors
bun run lint

# Auto-fix fixable issues
bun run lint:fix
```

**Editor integration:**
- Install ESLint extension in VS Code
- Enable "Format on Save" for automatic fixing
- Configure: `.vscode/settings.json`

## Architecture Patterns

### Backend Architecture

The backend follows a **layered architecture**:

```
src/server/
├── index.ts           # Application entry point (middleware, error handling)
├── routes.ts          # API route definitions (plugin-based)
├── engine/            # Core business logic
│   ├── balda.ts       # Game rules and move validation
│   └── suggest.ts     # AI suggestion engine
├── db/                # Data access layer
│   ├── client.ts      # PostgreSQL client
│   └── schema.ts      # Drizzle ORM schema
├── store.ts           # File-based storage (fallback)
├── dictionary.ts      # Dictionary system (Trie-based)
├── errors.ts          # Custom error classes
└── wsHub.ts           # WebSocket broadcast hub
```

**Key principles:**
1. **Separation of concerns** - Business logic in `engine/`, routes in `routes.ts`
2. **Immutable state** - Game state never mutated, always returns new state
3. **Type safety** - TypeBox schemas for runtime validation
4. **Error handling** - Custom error classes with structured responses

### Frontend Architecture

The web frontend follows **clean architecture**:

```
src/web/
├── main.tsx           # Application entry point
├── config/            # Configuration layer
│   └── env.ts         # Type-safe environment variables
├── components/        # Presentation layer (9 components)
│   ├── App.tsx        # Main app with routing
│   ├── Board.tsx      # Game board display
│   └── ...
├── hooks/             # State management layer (5 hooks)
│   ├── useGameClient.ts      # API integration
│   ├── useAIPlayer.ts        # AI automation
│   └── ...
├── utils/             # Business logic layer (7 utilities)
│   ├── boardValidation.ts    # Game rules
│   ├── moveValidation.ts     # Move validation
│   ├── logger.ts             # Error logging
│   └── ...
└── lib/               # External services
    └── client.ts      # API client
```

**Key principles:**
1. **Thin components** - Components only handle presentation
2. **Hooks for state** - All state logic in custom hooks
3. **Pure utilities** - Business logic in pure functions (no React)
4. **Dependency injection** - Components receive data via props

### Game State Management

Game state is **immutable** and follows this structure:

```typescript
interface GameState {
  id: string                    // Unique game ID
  size: number                  // Board size (e.g., 5x5)
  board: (string | null)[][]    // 2D grid of letters
  players: string[]             // Player names
  aiPlayers: string[]           // AI player names
  currentPlayerIndex: number    // Whose turn (0-indexed)
  moves: Move[]                 // Move history
  scores: Record<string, number> // Player scores
  usedWords: string[]           // Words already played
  createdAt: number             // Unix timestamp
}
```

**State updates:**
- Backend: `applyMove()` returns new state
- Frontend: React state hooks trigger re-renders
- WebSocket: Broadcasts state changes to all clients

## API Development

### Adding a New Endpoint

**Step 1: Define TypeBox schema** (`src/shared/schemas.ts`)

```typescript
export const MyRequestSchema = Type.Object({
  field: Type.String({ minLength: 1, error: 'Field is required' }),
  count: Type.Integer({ minimum: 1, maximum: 100 }),
})

export const MyResponseSchema = Type.Object({
  result: Type.String(),
  data: Type.Array(Type.String()),
})
```

**Step 2: Add route handler** (`src/server/routes.ts`)

```typescript
const myPlugin = new Elysia({ name: 'my-plugin', prefix: '/my', tags: ['my'] })
  .post('/action', async ({ body }) => {
    // Validation is automatic via TypeBox schema
    const { field, count } = body

    // Business logic here
    const result = await processAction(field, count)

    return {
      result: 'success',
      data: result,
    }
  }, {
    body: MyRequestSchema,
    response: { 200: MyResponseSchema, 400: ErrorSchema },
    detail: {
      summary: 'Perform my action',
      description: 'Detailed description for Swagger docs',
      tags: ['my'],
    },
  })

// Register plugin
export function registerRoutes(app: Elysia): Elysia {
  return app
    .get('/health', () => ({ status: 'ok' }))
    .use(dictionaryPlugin)
    .use(gamesPlugin)
    .use(myPlugin)  // Add here
}
```

**Step 3: Update frontend client** (`src/web/lib/client.ts`)

```typescript
/**
 * Perform my action
 * @param field - The field value
 * @param count - Number of items to process
 */
export async function myAction(field: string, count: number): Promise<{ result: string, data: string[] }> {
  const response = await fetch(`${API_BASE_URL}/my/action`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ field, count }),
  })

  if (!response.ok) {
    const error = await response.json()
    logger.error('API Error', { error, field, count })
    throw new Error(error.error || 'Failed to perform action')
  }

  return response.json()
}
```

**Step 4: Add tests**

```typescript
import { describe, expect, test } from 'bun:test'
import { myAction } from '../lib/client'

describe('myAction', () => {
  test('should process action successfully', async () => {
    const result = await myAction('test', 5)
    expect(result.result).toBe('success')
    expect(result.data).toBeInstanceOf(Array)
    expect(result.data.length).toBe(5)
  })

  test('should handle validation errors', async () => {
    await expect(myAction('', 5)).rejects.toThrow('Field is required')
  })
})
```

### Error Handling Best Practices

**Custom error classes:**

```typescript
// src/server/errors.ts
export class MyCustomError extends Error {
  constructor(message: string, public details?: unknown) {
    super(message)
    this.name = 'MY_CUSTOM_ERROR'
  }

  toResponse() {
    return {
      error: this.message,
      details: this.details,
    }
  }
}

// Register in src/server/index.ts
.error({
  MY_CUSTOM_ERROR: MyCustomError,
  // ... other errors
})
.onError(({ code, error, set }) => {
  if (code === 'MY_CUSTOM_ERROR') {
    set.status = 422
    return error.toResponse()
  }
  // ... handle other errors
})
```

## Frontend Development

### Creating a New Component

**Step 1: Create component file** (`src/web/components/MyComponent.tsx`)

```typescript
interface MyComponentProps {
  /**
   * The title to display
   */
  title: string
  /**
   * Items to render
   */
  items: string[]
  /**
   * Callback when item is clicked
   */
  onItemClick?: (item: string) => void
}

/**
 * MyComponent displays a list of items with a title
 */
export function MyComponent({ title, items, onItemClick }: MyComponentProps) {
  return (
    <div className="p-4 bg-white rounded-lg shadow">
      <h2 className="text-xl font-bold mb-4">{title}</h2>
      <ul className="space-y-2">
        {items.map((item) => (
          <li key={item}>
            <button
              onClick={() => onItemClick?.(item)}
              className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
            >
              {item}
            </button>
          </li>
        ))}
      </ul>
    </div>
  )
}
```

**Step 2: Extract business logic to utilities**

```typescript
// src/web/utils/myHelpers.ts

/**
 * Filter items based on criteria
 */
export function filterItems(items: string[], query: string): string[] {
  return items.filter(item =>
    item.toLowerCase().includes(query.toLowerCase())
  )
}

/**
 * Sort items alphabetically
 */
export function sortItems(items: string[]): string[] {
  return [...items].sort((a, b) => a.localeCompare(b))
}
```

**Step 3: Create custom hook if needed**

```typescript
// src/web/hooks/useItemList.ts

export function useItemList(initialItems: string[]) {
  const [items, setItems] = useState(initialItems)
  const [query, setQuery] = useState('')

  const filteredItems = useMemo(
    () => filterItems(items, query),
    [items, query]
  )

  const sortedItems = useMemo(
    () => sortItems(filteredItems),
    [filteredItems]
  )

  return {
    items: sortedItems,
    query,
    setQuery,
    addItem: (item: string) => setItems(prev => [...prev, item]),
    removeItem: (item: string) => setItems(prev => prev.filter(i => i !== item)),
  }
}
```

**Step 4: Use in component**

```typescript
export function MyComponent({ title, initialItems }: Props) {
  const { items, query, setQuery, addItem } = useItemList(initialItems)

  return (
    <div>
      <h2>{title}</h2>
      <input value={query} onChange={(e) => setQuery(e.target.value)} />
      {/* Render items */}
    </div>
  )
}
```

### State Management Patterns

**Local component state:**
```typescript
const [count, setCount] = useState(0)
```

**Shared state via custom hooks:**
```typescript
const { gameState, isLoading, error } = useGameClient(gameId)
```

**Global state (future):**
- Consider Zustand or Context API for truly global state
- Current approach: Props drilling + custom hooks is sufficient

## Testing Strategy

### Unit Tests

Test pure functions in isolation:

```typescript
// src/web/utils/boardValidation.test.ts
import { describe, expect, test } from 'bun:test'
import { canClickCell } from './boardValidation'

describe('canClickCell', () => {
  test('should allow clicking empty adjacent cell', () => {
    const board = [
      ['А', null, null],
      ['Б', 'В', null],
      [null, null, null],
    ]
    const wordPath = [{ row: 0, col: 0 }, { row: 1, col: 0 }]
    const position = { row: 1, col: 1 }

    expect(canClickCell(board, position, wordPath, null)).toBe(true)
  })

  test('should reject non-adjacent cell', () => {
    const board = [
      ['А', null, null],
      [null, null, null],
      [null, null, null],
    ]
    const wordPath = [{ row: 0, col: 0 }]
    const position = { row: 2, col: 2 }

    expect(canClickCell(board, position, wordPath, null)).toBe(false)
  })
})
```

### Integration Tests

Test API endpoints:

```typescript
// test/api/games.test.ts
import { describe, expect, test } from 'bun:test'

describe('POST /games', () => {
  test('should create a new game', async () => {
    const response = await fetch('http://localhost:3000/games', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        size: 5,
        baseWord: 'БАЛДА',
        players: ['Alice', 'Bob'],
      }),
    })

    expect(response.status).toBe(200)
    const game = await response.json()
    expect(game.id).toBeDefined()
    expect(game.size).toBe(5)
    expect(game.players).toEqual(['Alice', 'Bob'])
  })
})
```

### E2E Tests (Future)

Use Playwright for end-to-end testing:

```typescript
// test/e2e/gameplay.spec.ts
import { expect, test } from '@playwright/test'

test('should create game and make a move', async ({ page }) => {
  await page.goto('http://localhost:5173')

  // Create game
  await page.click('text=Быстрый старт')
  await expect(page.locator('text=Ваш ход')).toBeVisible()

  // Make a move
  await page.click('[data-testid="cell-2-2"]')
  await page.click('[data-testid="letter-А"]')
  await page.click('[data-testid="submit-move"]')

  await expect(page.locator('text=Отлично!')).toBeVisible()
})
```

## Database Management

### Using File Storage (Default)

File-based storage saves games as JSON:

```bash
# Storage directory
ls -la ./data/games/

# Each game is a separate file
cat ./data/games/550e8400-e29b-41d4-a716-446655440000.json
```

**Pros:**
- Simple, no database required
- Good for development
- Easy to inspect and debug

**Cons:**
- Not scalable for production
- No transactions
- No query optimization

### Migrating to PostgreSQL

**Step 1: Install PostgreSQL** (see CONTRIBUTING.md)

**Step 2: Set DATABASE_URL** in `.env`:
```bash
DATABASE_URL=postgresql://balda:balda@localhost:5432/balda
```

**Step 3: Generate and run migrations:**
```bash
bun run db:generate
bun run db:migrate
```

**Step 4: Migrate existing games:**
```bash
bun run migrate:to-postgres
```

**Step 5: Restart server** - it will auto-detect PostgreSQL

### Drizzle ORM Workflows

**Generate migrations:**
```bash
# After changing src/server/db/schema.ts
bun run db:generate

# Inspect generated SQL
cat drizzle/0001_*.sql
```

**Apply migrations:**
```bash
# Development
bun run db:push  # Push schema directly (no migration files)

# Production
bun run db:migrate  # Apply migration files
```

**Drizzle Studio (GUI):**
```bash
bun run db:studio
# Opens http://localhost:4983
```

## Debugging

### Backend Debugging

**Console logging:**
```typescript
import { consola } from 'consola'

consola.info('Processing move', { playerId, word })
consola.warn('Dictionary not loaded, using permissive mode')
consola.error('Failed to save game', { error, gameId })
```

**Bun debugger:**
```bash
# Start with debugger enabled
bun --inspect run dev

# Attach with Chrome DevTools
# chrome://inspect
```

**Error stack traces:**
```typescript
try {
  throw new Error('Something went wrong')
} catch (error) {
  consola.error('Error details:', {
    message: error.message,
    stack: error.stack,
    cause: error.cause,
  })
}
```

### Frontend Debugging

**React DevTools:**
- Install React DevTools browser extension
- Inspect component tree and props
- Profile performance

**Logger utility:**
```typescript
import { logger } from '../utils/logger'

logger.debug('Cell clicked', { row, col })
logger.info('Move submitted', { word, position })
logger.warn('Invalid move attempt', { reason })
logger.error('API request failed', { error, endpoint })
```

**Error tracking:**
```typescript
// Errors are automatically logged and persisted
// View in browser console or sessionStorage
const errors = JSON.parse(sessionStorage.getItem('app_errors') || '[]')
console.table(errors)
```

## Performance Optimization

### Backend Optimization

**Path-finding memoization:**
```typescript
// LRU cache for expensive path lookups
const pathCache = new LRUCache({ max: 500 })

function existsPathForWord(board, word, pos) {
  const key = `${boardHash}:${word}:${pos.row},${pos.col}`
  if (pathCache.has(key)) return pathCache.get(key)

  const result = dfs(board, word, pos)
  pathCache.set(key, result)
  return result
}
```

**Dictionary Trie structure:**
- O(m) lookup time (m = word length)
- Prefix pruning for suggestions
- Memory-efficient for 50K+ words

**WebSocket broadcasting:**
- Broadcast only to connected clients
- Use readyState checking to avoid errors
- Clean up disconnected clients automatically

### Frontend Optimization

**Memoization:**
```typescript
const filteredSuggestions = useMemo(
  () => suggestions.filter(s => !usedWords.includes(s.word)),
  [suggestions, usedWords]
)
```

**Debouncing:**
```typescript
const debouncedSearch = useMemo(
  () => debounce((query: string) => {
    fetchResults(query)
  }, 300),
  []
)
```

**Code splitting:**
```typescript
const HeavyComponent = lazy(() => import('./HeavyComponent'))

<Suspense fallback={<Loading />}>
  <HeavyComponent />
</Suspense>
```

## Deployment

### Production Build

```bash
# Build web frontend
bun run build:web

# Output in dist/
ls -lh dist/

# Preview production build locally
bun run preview:web
```

### Environment Configuration

**Backend (.env):**
```bash
NODE_ENV=production
PORT=3000
DATABASE_URL=postgresql://user:pass@host:5432/balda
DICT_PATH=/app/data/dictionaries/russian.txt
```

**Frontend (build time):**
```bash
VITE_API_URL=https://api.balda.example.com
```

### Docker Deployment (Future)

```dockerfile
# Dockerfile
FROM oven/bun:1 AS base

WORKDIR /app

# Install dependencies
COPY package.json bun.lockb ./
RUN bun install --frozen-lockfile

# Copy source
COPY . .

# Build frontend
RUN bun run build:web

# Start server
CMD ["bun", "run", "src/server/index.ts"]
```

### Monitoring

**Health checks:**
```bash
curl http://localhost:3000/health
# {"status":"ok"}
```

**Metrics (future):**
- Request latency
- Error rates
- Active WebSocket connections
- Game creation rate

---

For more information:
- [CONTRIBUTING.md](../CONTRIBUTING.md) - Contribution guidelines
- [ARCHITECT.md](../ARCHITECT.md) - Architecture documentation
- [PRODUCTION_READY.md](../PRODUCTION_READY.md) - Production deployment guide
