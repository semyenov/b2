# ARCHITECT_TODO.md

This document organizes architectural improvements and future work for the Balda game project. Tasks are categorized by priority and implementation complexity.

**Last Updated:** 2025-10-15

---

## 🔴 Critical: Security & Infrastructure (Priority: HIGH)

These tasks are essential for production deployment and should be completed before public release.

### 1.1 Add Rate Limiting

**Priority:** 🔴 CRITICAL
**Difficulty:** ⭐ Easy
**Estimated Time:** 2 hours
**Dependencies:** None

**Description:**
Protect API endpoints from abuse and DoS attacks by implementing rate limiting.

**Implementation:**

```typescript
// File: src/server/index.ts
import { rateLimit } from '@elysiajs/rate-limit'

const app = new Elysia()
  .use(rateLimit({
    duration: 60000, // 1 minute
    max: 100, // 100 requests per minute
    errorResponse: 'Too many requests, please try again later',
  }))
  .use(cors())
  .use(routes)
```

**Files to Modify:**
- `src/server/index.ts` - Add rate limiting plugin
- `package.json` - Add `@elysiajs/rate-limit` dependency

**Testing:**
- Verify rate limit triggers after threshold
- Test different endpoints have appropriate limits
- Ensure WebSocket connections are not rate-limited

---

### 1.2 Implement JWT Authentication

**Priority:** 🔴 CRITICAL
**Difficulty:** ⭐⭐⭐ Medium
**Estimated Time:** 1-2 days
**Dependencies:** None

**Description:**
Add user authentication system with JWT tokens to secure game access and track players.

**Implementation:**

```typescript
// File: src/server/auth/jwt.ts
import { jwt } from '@elysiajs/jwt'

export const authPlugin = new Elysia()
  .use(jwt({
    name: 'jwt',
    secret: process.env.JWT_SECRET!,
  }))
  .derive(async ({ jwt, headers }) => {
    const auth = headers.authorization
    if (!auth?.startsWith('Bearer ')) return { user: null }

    const token = auth.slice(7)
    const user = await jwt.verify(token)
    return { user }
  })

// File: src/server/routes.ts
.post('/auth/register', async ({ body, jwt }) => {
  const user = await createUser(body)
  const token = await jwt.sign({ userId: user.id })
  return { user, token }
})

.post('/auth/login', async ({ body, jwt }) => {
  const user = await authenticateUser(body)
  const token = await jwt.sign({ userId: user.id })
  return { user, token }
})

.use(authPlugin)
.post('/games', async ({ user, body }) => {
  if (!user) throw new UnauthorizedError()
  return createGame({ ...body, creatorId: user.id })
}, { beforeHandle: requireAuth })
```

**Files to Create:**
- `src/server/auth/jwt.ts` - JWT authentication logic
- `src/server/auth/middleware.ts` - Auth middleware
- `src/server/models/user.ts` - User model and schema
- `src/server/services/user.ts` - User CRUD operations

**Files to Modify:**
- `src/server/routes.ts` - Add auth routes, protect endpoints
- `src/shared/schemas.ts` - Add user schemas
- `src/web/lib/client.ts` - Add auth headers to requests
- `package.json` - Add `@elysiajs/jwt`, `bcrypt`, `@types/bcrypt`

**Testing:**
- Test user registration and login flows
- Verify protected endpoints reject unauthenticated requests
- Test token expiration and refresh

---

### 1.3 Add WebSocket Authentication

**Priority:** 🔴 CRITICAL
**Difficulty:** ⭐⭐ Medium
**Estimated Time:** 4-6 hours
**Dependencies:** Task 1.2 (JWT Authentication)

**Description:**
Secure WebSocket connections with JWT token verification to prevent unauthorized game state access.

**Implementation:**

```typescript
// File: src/server/wsHub.ts
import type { ServerWebSocket } from 'bun'

interface AuthenticatedWebSocket extends ServerWebSocket {
  data: {
    gameId: string
    userId: string
  }
}

// File: src/server/routes.ts
.ws('/games/:id/ws', {
  async open(ws: AuthenticatedWebSocket) {
    const token = ws.data.query?.token
    if (!token) {
      ws.close(1008, 'Authentication required')
      return
    }

    try {
      const user = await verifyJWT(token)
      ws.data.userId = user.id
      wsHub.addClient(ws.data.gameId, ws)
    } catch (error) {
      ws.close(1008, 'Invalid token')
    }
  },

  message(ws: AuthenticatedWebSocket, message) {
    // Verify user is participant in game
    const game = await store.get(ws.data.gameId)
    const isParticipant = game.players.some(p => p.id === ws.data.userId)
    if (!isParticipant) {
      ws.close(1008, 'Unauthorized access to game')
      return
    }
  }
})
```

**Files to Modify:**
- `src/server/wsHub.ts` - Add user tracking to WebSocket connections
- `src/server/routes.ts` - Add WebSocket authentication
- `src/web/lib/client.ts` - Send JWT token in WebSocket connection
- `src/cli/api.ts` - Send JWT token in WebSocket connection

**Testing:**
- Verify unauthenticated WebSocket connections are rejected
- Test expired tokens are rejected
- Verify users can only join games they're participants in

---

### 1.4 Set Up Error Monitoring (Sentry)

**Priority:** 🔴 HIGH
**Difficulty:** ⭐⭐ Easy-Medium
**Estimated Time:** 3-4 hours
**Dependencies:** None

**Description:**
Integrate Sentry for production error tracking and monitoring.

**Implementation:**

```typescript
// File: src/server/monitoring/sentry.ts
import * as Sentry from '@sentry/bun'

Sentry.init({
  dsn: process.env.SENTRY_DSN,
  environment: process.env.NODE_ENV,
  tracesSampleRate: 1.0,
})

// File: src/server/index.ts
import { setupSentry } from './monitoring/sentry'

setupSentry()

const app = new Elysia()
  .onError(({ error, code }) => {
    Sentry.captureException(error, {
      tags: { errorCode: code },
    })
    return handleError(error, code)
  })

// File: src/web/utils/logger.ts
import * as Sentry from '@sentry/react'

Sentry.init({
  dsn: import.meta.env.VITE_SENTRY_DSN,
  environment: import.meta.env.MODE,
  integrations: [
    new Sentry.BrowserTracing(),
    new Sentry.Replay(),
  ],
})

export const logger = {
  error: (message: string, context?: unknown) => {
    console.error(message, context)
    Sentry.captureException(new Error(message), {
      extra: context,
    })
  }
}
```

**Files to Create:**
- `src/server/monitoring/sentry.ts` - Backend Sentry setup
- `src/web/monitoring/sentry.ts` - Frontend Sentry setup

**Files to Modify:**
- `src/server/index.ts` - Add Sentry error handler
- `src/web/utils/logger.ts` - Integrate Sentry
- `src/web/main.tsx` - Initialize Sentry
- `package.json` - Add `@sentry/bun`, `@sentry/react`
- `.env.example` - Add `SENTRY_DSN`, `VITE_SENTRY_DSN`

**Testing:**
- Trigger test errors and verify they appear in Sentry dashboard
- Test source maps are uploaded for stack traces
- Verify PII is not logged

---

### 1.5 Add Production Logging Infrastructure

**Priority:** 🔴 HIGH
**Difficulty:** ⭐⭐ Medium
**Estimated Time:** 4-6 hours
**Dependencies:** None

**Description:**
Implement structured logging with log levels, correlation IDs, and production-ready log aggregation.

**Implementation:**

```typescript
// File: src/server/monitoring/logger.ts
import { consola } from 'consola'

export const logger = consola.create({
  level: process.env.NODE_ENV === 'production' ? 3 : 4,
  formatOptions: {
    date: true,
    colors: process.env.NODE_ENV !== 'production',
  },
})

// File: src/server/middleware/correlation.ts
import { randomUUID } from 'crypto'

export const correlationMiddleware = new Elysia()
  .derive(({ headers }) => {
    const correlationId = headers['x-correlation-id'] || randomUUID()
    return { correlationId }
  })
  .onBeforeHandle(({ correlationId, path, request }) => {
    logger.debug('Request received', {
      correlationId,
      method: request.method,
      path,
    })
  })
  .onAfterHandle(({ correlationId, response }) => {
    logger.debug('Response sent', {
      correlationId,
      status: response.status,
    })
  })

// File: src/server/index.ts
const app = new Elysia()
  .use(correlationMiddleware)
  .onError(({ error, correlationId }) => {
    logger.error('Request failed', {
      correlationId,
      error: error.message,
      stack: error.stack,
    })
  })
```

**Files to Create:**
- `src/server/monitoring/logger.ts` - Structured logger setup
- `src/server/middleware/correlation.ts` - Correlation ID tracking

**Files to Modify:**
- `src/server/index.ts` - Add logging middleware
- All route handlers - Replace `console.log` with `logger`
- `package.json` - Ensure `consola` is up to date

**Testing:**
- Verify logs include correlation IDs
- Test log levels work correctly
- Verify production logs are JSON formatted

---

## 🟡 Scalability & Performance (Priority: MEDIUM-HIGH)

These tasks improve system performance and enable horizontal scaling.

### 2.1 Migrate to PostgreSQL

**Priority:** 🟡 HIGH
**Difficulty:** ⭐⭐⭐ Medium
**Estimated Time:** 2-3 days
**Dependencies:** None

**Description:**
Replace file-based storage with PostgreSQL for ACID guarantees, better performance, and scalability.

**Implementation:**

```typescript
// File: src/server/db/schema.ts
import { pgTable, uuid, text, jsonb, timestamp, integer } from 'drizzle-orm/pg-core'

export const games = pgTable('games', {
  id: uuid('id').primaryKey(),
  board: jsonb('board').notNull(),
  players: jsonb('players').notNull(),
  currentPlayerIndex: integer('current_player_index').notNull(),
  moves: jsonb('moves').notNull(),
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow(),
})

export const users = pgTable('users', {
  id: uuid('id').primaryKey(),
  username: text('username').notNull().unique(),
  email: text('email').notNull().unique(),
  passwordHash: text('password_hash').notNull(),
  createdAt: timestamp('created_at').notNull().defaultNow(),
})

// File: src/server/db/client.ts
import { drizzle } from 'drizzle-orm/postgres-js'
import postgres from 'postgres'

const client = postgres(process.env.DATABASE_URL!)
export const db = drizzle(client)

// File: src/server/services/gameStore.ts
import { db } from '../db/client'
import { games } from '../db/schema'
import { eq } from 'drizzle-orm'

export class PostgresGameStore implements GameStore {
  async get(id: string): Promise<GameState | null> {
    const result = await db.select().from(games).where(eq(games.id, id))
    return result[0] || null
  }

  async set(game: GameState): Promise<void> {
    await db.insert(games).values(game)
      .onConflictDoUpdate({
        target: games.id,
        set: { ...game, updatedAt: new Date() },
      })
  }

  async getAll(): Promise<GameState[]> {
    return await db.select().from(games)
  }

  async delete(id: string): Promise<void> {
    await db.delete(games).where(eq(games.id, id))
  }
}
```

**Files to Create:**
- `src/server/db/schema.ts` - Database schema definitions
- `src/server/db/client.ts` - PostgreSQL client setup
- `src/server/db/migrations/` - Database migrations
- `drizzle.config.ts` - Drizzle ORM configuration

**Files to Modify:**
- `src/server/services/gameStore.ts` - Replace file storage with PostgreSQL
- `src/server/index.ts` - Initialize database connection
- `package.json` - Add `drizzle-orm`, `postgres`, `drizzle-kit`
- `.env.example` - Add `DATABASE_URL`
- `docker-compose.yml` - Add PostgreSQL service

**Testing:**
- Test all CRUD operations work correctly
- Verify concurrent writes don't cause data loss
- Test connection pool handles high load
- Add database migration tests

---

### 2.2 Implement Redis Pub/Sub for Multi-Server WebSocket

**Priority:** 🟡 MEDIUM-HIGH
**Difficulty:** ⭐⭐⭐ Medium-Hard
**Estimated Time:** 2-3 days
**Dependencies:** Task 2.1 (PostgreSQL migration)

**Description:**
Enable horizontal scaling by using Redis pub/sub to broadcast WebSocket messages across multiple server instances.

**Implementation:**

```typescript
// File: src/server/infrastructure/redis.ts
import { Redis } from 'ioredis'

export const redis = new Redis(process.env.REDIS_URL!)
export const redisSub = new Redis(process.env.REDIS_URL!)

// File: src/server/wsHub.ts
import { redis, redisSub } from './infrastructure/redis'

// Subscribe to game update channel
redisSub.subscribe('game:updates', (err) => {
  if (err) logger.error('Failed to subscribe to Redis', { error: err })
})

redisSub.on('message', (channel, message) => {
  if (channel === 'game:updates') {
    const { gameId, state } = JSON.parse(message)
    // Broadcast to local WebSocket clients
    broadcastToLocalClients(gameId, state)
  }
})

export function broadcastGame(gameId: string, state: GameState) {
  // Publish to Redis for other servers
  redis.publish('game:updates', JSON.stringify({ gameId, state }))

  // Also broadcast to local clients immediately
  broadcastToLocalClients(gameId, state)
}

function broadcastToLocalClients(gameId: string, state: GameState) {
  const clients = gameIdToClients.get(gameId)
  if (!clients) return

  const message = JSON.stringify(state)
  for (const client of clients) {
    if (client.readyState === WebSocket.OPEN) {
      client.send(message)
    }
  }
}
```

**Files to Create:**
- `src/server/infrastructure/redis.ts` - Redis client setup
- `src/server/infrastructure/cache.ts` - Redis caching layer

**Files to Modify:**
- `src/server/wsHub.ts` - Add Redis pub/sub for broadcasting
- `src/server/index.ts` - Initialize Redis connection
- `package.json` - Add `ioredis`, `@types/ioredis`
- `.env.example` - Add `REDIS_URL`
- `docker-compose.yml` - Add Redis service

**Testing:**
- Test WebSocket broadcasts work across multiple server instances
- Verify messages are received by all connected clients
- Test Redis connection failures are handled gracefully

---

### 2.3 Add Horizontal Scaling Support

**Priority:** 🟡 MEDIUM
**Difficulty:** ⭐⭐⭐⭐ Hard
**Estimated Time:** 3-5 days
**Dependencies:** Task 2.1 (PostgreSQL), Task 2.2 (Redis pub/sub)

**Description:**
Enable running multiple server instances behind a load balancer for high availability and scalability.

**Implementation:**

```yaml
# File: docker-compose.prod.yml
version: '3.8'

services:
  nginx:
    image: nginx:alpine
    ports:
      - "80:80"
      - "443:443"
    volumes:
      - ./nginx.conf:/etc/nginx/nginx.conf:ro
    depends_on:
      - app1
      - app2
      - app3

  app1:
    build: .
    environment:
      - DATABASE_URL=${DATABASE_URL}
      - REDIS_URL=redis://redis:6379
      - PORT=3000
    depends_on:
      - postgres
      - redis

  app2:
    build: .
    environment:
      - DATABASE_URL=${DATABASE_URL}
      - REDIS_URL=redis://redis:6379
      - PORT=3000
    depends_on:
      - postgres
      - redis

  app3:
    build: .
    environment:
      - DATABASE_URL=${DATABASE_URL}
      - REDIS_URL=redis://redis:6379
      - PORT=3000
    depends_on:
      - postgres
      - redis

  postgres:
    image: postgres:16-alpine
    environment:
      - POSTGRES_DB=balda
      - POSTGRES_USER=${DB_USER}
      - POSTGRES_PASSWORD=${DB_PASSWORD}
    volumes:
      - postgres_data:/var/lib/postgresql/data

  redis:
    image: redis:7-alpine
    volumes:
      - redis_data:/data

volumes:
  postgres_data:
  redis_data:
```

```nginx
# File: nginx.conf
upstream balda_backend {
    least_conn;
    server app1:3000;
    server app2:3000;
    server app3:3000;
}

server {
    listen 80;
    server_name balda.example.com;

    location / {
        proxy_pass http://balda_backend;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "upgrade";
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```

**Files to Create:**
- `docker-compose.prod.yml` - Production Docker Compose config
- `nginx.conf` - Nginx load balancer configuration
- `Dockerfile` - Container image definition
- `.dockerignore` - Docker build exclusions
- `scripts/deploy.sh` - Deployment script

**Files to Modify:**
- `src/server/index.ts` - Add health check endpoint
- `package.json` - Add Docker build scripts

**Testing:**
- Test load is distributed across instances
- Verify sticky sessions for WebSocket connections
- Test graceful shutdown and zero-downtime deployments
- Verify health checks work correctly

---

### 2.4 Optimize Dictionary Loading

**Priority:** 🟡 MEDIUM
**Difficulty:** ⭐⭐ Medium
**Estimated Time:** 1 day
**Dependencies:** Task 2.1 (PostgreSQL migration)

**Description:**
Improve dictionary loading performance and add support for multiple languages with lazy loading.

**Implementation:**

```typescript
// File: src/server/services/dictionary.ts
import { db } from '../db/client'
import { words } from '../db/schema'

class CachedTrieDictionary implements Dictionary {
  private trie: TrieNode | null = null
  private language: string

  constructor(language: string) {
    this.language = language
  }

  async ensureLoaded(): Promise<void> {
    if (this.trie) return // Already loaded

    // Load from database instead of file
    const wordList = await db
      .select({ word: words.word })
      .from(words)
      .where(eq(words.language, this.language))

    this.trie = new TrieNode()
    for (const { word } of wordList) {
      this.insertWord(this.trie, word)
    }
  }

  async contains(word: string): Promise<boolean> {
    await this.ensureLoaded()
    return this.searchWord(this.trie!, word)
  }
}

// File: src/server/db/schema.ts
export const words = pgTable('words', {
  id: uuid('id').primaryKey(),
  word: text('word').notNull(),
  language: text('language').notNull().default('ru'),
}, (table) => ({
  wordIdx: index('word_idx').on(table.word),
  languageIdx: index('language_idx').on(table.language),
}))
```

**Files to Create:**
- `src/server/db/migrations/001_add_words_table.sql` - Words table migration
- `scripts/import-dictionary.ts` - Script to import dictionary files to database

**Files to Modify:**
- `src/server/services/dictionary.ts` - Load from database instead of file
- `src/server/routes.ts` - Add language parameter to dictionary endpoints
- `src/shared/schemas.ts` - Add language field to game schema

**Testing:**
- Test dictionary loads correctly from database
- Verify performance is comparable to file-based loading
- Test multiple language support

---

### 2.5 Add Database Connection Pooling

**Priority:** 🟡 MEDIUM
**Difficulty:** ⭐ Easy
**Estimated Time:** 2-3 hours
**Dependencies:** Task 2.1 (PostgreSQL migration)

**Description:**
Configure connection pooling for optimal database performance under load.

**Implementation:**

```typescript
// File: src/server/db/client.ts
import { drizzle } from 'drizzle-orm/postgres-js'
import postgres from 'postgres'

const client = postgres(process.env.DATABASE_URL!, {
  max: 20, // Maximum connections in pool
  idle_timeout: 20, // Close idle connections after 20s
  connect_timeout: 10, // Timeout after 10s
  prepare: true, // Use prepared statements
  onnotice: () => {}, // Ignore notices
})

export const db = drizzle(client)

// Graceful shutdown
process.on('SIGTERM', async () => {
  await client.end()
  process.exit(0)
})
```

**Files to Modify:**
- `src/server/db/client.ts` - Add connection pool configuration
- `src/server/index.ts` - Add graceful shutdown handler

**Testing:**
- Test connection pool handles concurrent requests
- Verify connections are reused efficiently
- Test pool recovers from connection failures

---

## 🟢 Testing Infrastructure (Priority: MEDIUM)

These tasks establish comprehensive testing coverage for reliability.

### 3.1 Add Unit Tests for Game Engine

**Priority:** 🟢 MEDIUM
**Difficulty:** ⭐⭐ Medium
**Estimated Time:** 2-3 days
**Dependencies:** None

**Description:**
Add comprehensive unit tests for core game logic (balda.ts, suggest.ts).

**Implementation:**

```typescript
// File: src/server/engine/balda.test.ts
import { describe, test, expect } from 'bun:test'
import { createInitialGame, applyMove, canPlaceLetter } from './balda'

describe('Game Engine', () => {
  describe('createInitialGame', () => {
    test('creates 5x5 board with center word', () => {
      const game = createInitialGame('HELLO', ['Alice', 'Bob'])
      expect(game.board.length).toBe(5)
      expect(game.board[0].length).toBe(5)
      expect(game.board[2]).toEqual(['H', 'E', 'L', 'L', 'O'])
    })

    test('initializes empty cells with null', () => {
      const game = createInitialGame('CAT', ['Alice', 'Bob'])
      expect(game.board[0][0]).toBe(null)
      expect(game.board[4][4]).toBe(null)
    })
  })

  describe('applyMove', () => {
    test('accepts valid move', () => {
      const game = createInitialGame('CAT', ['Alice', 'Bob'])
      const result = applyMove(game, {
        playerId: 'Alice',
        position: { row: 1, col: 0 },
        letter: 'S',
        word: 'SCAT',
      }, mockDictionary)

      expect(result.ok).toBe(true)
      if (result.ok) {
        expect(result.game.board[1][0]).toBe('S')
      }
    })

    test('rejects move on occupied cell', () => {
      const game = createInitialGame('CAT', ['Alice', 'Bob'])
      const result = applyMove(game, {
        playerId: 'Alice',
        position: { row: 2, col: 0 }, // Center row (occupied)
        letter: 'S',
        word: 'SCAT',
      }, mockDictionary)

      expect(result.ok).toBe(false)
      if (!result.ok) {
        expect(result.error).toContain('occupied')
      }
    })

    test('rejects word not in dictionary', () => {
      const game = createInitialGame('CAT', ['Alice', 'Bob'])
      const result = applyMove(game, {
        playerId: 'Alice',
        position: { row: 1, col: 0 },
        letter: 'X',
        word: 'XCAT',
      }, mockDictionary)

      expect(result.ok).toBe(false)
      if (!result.ok) {
        expect(result.error).toContain('dictionary')
      }
    })
  })

  describe('canPlaceLetter', () => {
    test('allows placement adjacent to existing letter', () => {
      const game = createInitialGame('CAT', ['Alice', 'Bob'])
      expect(canPlaceLetter(game, { row: 1, col: 0 })).toBe(true)
      expect(canPlaceLetter(game, { row: 2, col: 1 })).toBe(true)
    })

    test('rejects placement not adjacent to letters', () => {
      const game = createInitialGame('CAT', ['Alice', 'Bob'])
      expect(canPlaceLetter(game, { row: 0, col: 0 })).toBe(false)
      expect(canPlaceLetter(game, { row: 4, col: 4 })).toBe(false)
    })
  })
})
```

**Files to Create:**
- `src/server/engine/balda.test.ts` - Game engine unit tests
- `src/server/engine/suggest.test.ts` - Suggestion engine tests
- `src/server/services/dictionary.test.ts` - Dictionary tests
- `test/fixtures/` - Test data fixtures

**Files to Modify:**
- `package.json` - Add test script: `"test": "bun test"`

**Testing:**
- Aim for >80% code coverage
- Test edge cases (empty board, invalid moves, etc.)
- Add performance benchmarks for critical paths

---

### 3.2 Add Integration Tests for API Routes

**Priority:** 🟢 MEDIUM
**Difficulty:** ⭐⭐ Medium
**Estimated Time:** 2-3 days
**Dependencies:** Task 3.1 (Unit tests)

**Description:**
Add integration tests for all API endpoints to ensure correct behavior.

**Implementation:**

```typescript
// File: src/server/routes.test.ts
import { describe, test, expect, beforeEach, afterEach } from 'bun:test'
import { treaty } from '@elysiajs/eden'
import { app } from './index'

const client = treaty(app)

describe('API Routes', () => {
  let gameId: string

  beforeEach(async () => {
    // Create test game
    const { data } = await client.games.post({
      players: ['Alice', 'Bob'],
      boardSize: 5,
      baseWord: 'HELLO',
    })
    gameId = data!.id
  })

  afterEach(async () => {
    // Clean up test data
    await client.games[gameId].delete()
  })

  describe('POST /games', () => {
    test('creates new game', async () => {
      const { data, status } = await client.games.post({
        players: ['Alice', 'Bob'],
        boardSize: 5,
        baseWord: 'WORLD',
      })

      expect(status).toBe(200)
      expect(data).toHaveProperty('id')
      expect(data?.board.length).toBe(5)
    })

    test('rejects invalid board size', async () => {
      const { error, status } = await client.games.post({
        players: ['Alice', 'Bob'],
        boardSize: 3, // Too small
        baseWord: 'HI',
      })

      expect(status).toBe(400)
      expect(error).toBeDefined()
    })
  })

  describe('POST /games/:id/move', () => {
    test('accepts valid move', async () => {
      const { data, status } = await client.games[gameId].move.post({
        playerId: 'Alice',
        position: { row: 1, col: 0 },
        letter: 'S',
        word: 'SHELL',
      })

      expect(status).toBe(200)
      expect(data?.board[1][0]).toBe('S')
    })

    test('rejects move from wrong player', async () => {
      const { error, status } = await client.games[gameId].move.post({
        playerId: 'Bob', // Alice's turn
        position: { row: 1, col: 0 },
        letter: 'S',
        word: 'SHELL',
      })

      expect(status).toBe(400)
      expect(error).toContain('turn')
    })
  })

  describe('GET /games/:id/suggestions', () => {
    test('returns move suggestions', async () => {
      const { data, status } = await client.games[gameId].suggestions.get({
        query: { playerId: 'Alice', limit: 5 }
      })

      expect(status).toBe(200)
      expect(Array.isArray(data)).toBe(true)
      expect(data!.length).toBeLessThanOrEqual(5)
    })
  })
})
```

**Files to Create:**
- `src/server/routes.test.ts` - API route integration tests
- `src/server/wsHub.test.ts` - WebSocket hub tests
- `test/setup.ts` - Test environment setup

**Files to Modify:**
- `package.json` - Add `@elysiajs/eden` for testing

**Testing:**
- Test all API endpoints (happy path + error cases)
- Test WebSocket connection and broadcasting
- Test concurrent requests

---

### 3.3 Add E2E Tests for Web Frontend

**Priority:** 🟢 MEDIUM
**Difficulty:** ⭐⭐⭐ Medium
**Estimated Time:** 3-4 days
**Dependencies:** Task 3.2 (Integration tests)

**Description:**
Add end-to-end tests using Playwright to test complete user workflows.

**Implementation:**

```typescript
// File: tests/e2e/game-flow.spec.ts
import { test, expect } from '@playwright/test'

test.describe('Game Flow', () => {
  test('complete game from creation to first move', async ({ page }) => {
    await page.goto('http://localhost:5173')

    // Create new game
    await page.click('button:has-text("Быстрая игра")')
    await page.waitForURL('**/game/**')

    // Wait for game to load
    await expect(page.locator('.board')).toBeVisible()

    // Verify board is displayed
    const cells = page.locator('.board-cell')
    await expect(cells).toHaveCount(25) // 5x5 board

    // Make a move
    await page.click('.board-cell[data-row="1"][data-col="0"]')
    await page.click('button:has-text("А")')

    // Select word path
    await page.click('.board-cell[data-row="2"][data-col="0"]')
    await page.click('.board-cell[data-row="2"][data-col="1"]')

    // Submit move
    await page.click('button:has-text("Сделать ход")')

    // Verify move was applied
    await expect(page.locator('.board-cell[data-row="1"][data-col="0"]'))
      .toContainText('А')
  })

  test('shows error for invalid move', async ({ page }) => {
    await page.goto('http://localhost:5173')
    await page.click('button:has-text("Быстрая игра")')
    await page.waitForURL('**/game/**')

    // Try to place letter on occupied cell
    await page.click('.board-cell[data-row="2"][data-col="0"]') // Center row
    await page.click('button:has-text("А")')

    // Verify error message
    await expect(page.locator('.error-banner'))
      .toContainText('занята')
  })

  test('displays AI move suggestions', async ({ page }) => {
    await page.goto('http://localhost:5173')
    await page.click('button:has-text("Быстрая игра")')
    await page.waitForURL('**/game/**')

    // Wait for suggestions to load
    await expect(page.locator('.suggestion-item')).toHaveCount.greaterThan(0)

    // Click on suggestion
    const firstSuggestion = page.locator('.suggestion-item').first()
    await firstSuggestion.click()

    // Verify move is pre-filled
    await expect(page.locator('.board-cell.selected')).toHaveCount.greaterThan(0)
  })
})
```

**Files to Create:**
- `tests/e2e/game-flow.spec.ts` - Main game flow tests
- `tests/e2e/navigation.spec.ts` - Navigation tests
- `tests/e2e/websocket.spec.ts` - Real-time update tests
- `playwright.config.ts` - Playwright configuration

**Files to Modify:**
- `package.json` - Add `@playwright/test`, add test scripts

**Testing:**
- Test complete user workflows
- Test WebSocket real-time updates
- Test error handling in UI
- Run tests in multiple browsers (Chrome, Firefox, Safari)

---

### 3.4 Set Up CI/CD Pipeline

**Priority:** 🟢 MEDIUM
**Difficulty:** ⭐⭐ Medium
**Estimated Time:** 1-2 days
**Dependencies:** Task 3.1, 3.2, 3.3 (All tests)

**Description:**
Automate testing, linting, type-checking, and deployment with GitHub Actions.

**Implementation:**

```yaml
# File: .github/workflows/ci.yml
name: CI

on:
  push:
    branches: [main, develop]
  pull_request:
    branches: [main]

jobs:
  test:
    runs-on: ubuntu-latest

    services:
      postgres:
        image: postgres:16-alpine
        env:
          POSTGRES_DB: balda_test
          POSTGRES_USER: test
          POSTGRES_PASSWORD: test
        ports:
          - 5432:5432

      redis:
        image: redis:7-alpine
        ports:
          - 6379:6379

    steps:
      - uses: actions/checkout@v4

      - uses: oven-sh/setup-bun@v1
        with:
          bun-version: latest

      - name: Install dependencies
        run: bun install

      - name: Run linter
        run: bun run lint

      - name: Type check
        run: bun run check

      - name: Run unit tests
        run: bun test
        env:
          DATABASE_URL: postgresql://test:test@localhost:5432/balda_test
          REDIS_URL: redis://localhost:6379

      - name: Build web frontend
        run: bun run build:web

      - name: Run E2E tests
        run: bun run test:e2e
        env:
          DATABASE_URL: postgresql://test:test@localhost:5432/balda_test

      - name: Upload coverage
        uses: codecov/codecov-action@v3
        with:
          files: ./coverage/coverage-final.json

  deploy:
    needs: test
    runs-on: ubuntu-latest
    if: github.ref == 'refs/heads/main'

    steps:
      - uses: actions/checkout@v4

      - name: Deploy to production
        run: ./scripts/deploy.sh
        env:
          DEPLOY_KEY: ${{ secrets.DEPLOY_KEY }}
```

**Files to Create:**
- `.github/workflows/ci.yml` - CI/CD pipeline
- `.github/workflows/release.yml` - Release automation
- `scripts/deploy.sh` - Deployment script

**Files to Modify:**
- `package.json` - Add CI scripts

**Testing:**
- Verify pipeline runs on push
- Test deployment to staging environment
- Verify rollback procedure works

---

### 3.5 Add Test Coverage Reporting

**Priority:** 🟢 LOW-MEDIUM
**Difficulty:** ⭐ Easy
**Estimated Time:** 2-3 hours
**Dependencies:** Task 3.1, 3.2 (Tests)

**Description:**
Track test coverage and enforce minimum thresholds.

**Implementation:**

```json
// File: bunfig.toml
[test]
coverage = true
coverageThreshold = 80
coverageReporter = ["text", "lcov", "html"]
```

```typescript
// File: scripts/check-coverage.ts
const coverage = await Bun.file('./coverage/coverage-summary.json').json()

const thresholds = {
  statements: 80,
  branches: 75,
  functions: 80,
  lines: 80,
}

let failed = false

for (const [metric, threshold] of Object.entries(thresholds)) {
  const actual = coverage.total[metric].pct
  if (actual < threshold) {
    console.error(`❌ ${metric} coverage ${actual}% is below ${threshold}%`)
    failed = true
  } else {
    console.log(`✅ ${metric} coverage ${actual}% meets ${threshold}%`)
  }
}

if (failed) process.exit(1)
```

**Files to Create:**
- `bunfig.toml` - Bun test configuration
- `scripts/check-coverage.ts` - Coverage threshold checker

**Files to Modify:**
- `package.json` - Add coverage scripts
- `.gitignore` - Ignore coverage files

**Testing:**
- Verify coverage reports are generated
- Test coverage thresholds enforce correctly

---

## 🔵 Feature Enhancements (Priority: LOW-MEDIUM)

These tasks add new features to improve user experience.

### 4.1 Add Game Replay Functionality

**Priority:** 🔵 MEDIUM
**Difficulty:** ⭐⭐ Medium
**Estimated Time:** 2-3 days
**Dependencies:** None

**Description:**
Allow users to replay completed games move-by-move for review and analysis.

**Implementation:**

```typescript
// File: src/server/routes.ts
.get('/games/:id/replay', async ({ params, query }) => {
  const game = await store.get(params.id)
  if (!game) throw new GameNotFoundError()

  const moveIndex = Number(query.move) || 0

  // Rebuild game state up to specified move
  let state = createInitialGame(getBaseWord(game), game.players)

  for (let i = 0; i < Math.min(moveIndex, game.moves.length); i++) {
    const result = applyMove(state, game.moves[i], dictionary)
    if (result.ok) state = result.game
  }

  return {
    ...state,
    totalMoves: game.moves.length,
    currentMove: moveIndex,
    isReplay: true,
  }
})

// File: src/web/components/GameReplay.tsx
export function GameReplay({ gameId }: { gameId: string }) {
  const [moveIndex, setMoveIndex] = useState(0)
  const [game, setGame] = useState<GameState | null>(null)

  useEffect(() => {
    loadReplayState(gameId, moveIndex).then(setGame)
  }, [gameId, moveIndex])

  return (
    <div>
      <Board board={game?.board} />

      <div className="replay-controls">
        <button onClick={() => setMoveIndex(0)}>⏮ First</button>
        <button
          onClick={() => setMoveIndex(i => Math.max(0, i - 1))}
          disabled={moveIndex === 0}
        >
          ◀ Previous
        </button>
        <span>Move {moveIndex + 1} / {game?.totalMoves}</span>
        <button
          onClick={() => setMoveIndex(i => Math.min(game.totalMoves - 1, i + 1))}
          disabled={moveIndex === game?.totalMoves - 1}
        >
          Next ▶
        </button>
        <button onClick={() => setMoveIndex(game.totalMoves - 1)}>⏭ Last</button>
      </div>

      <div className="move-details">
        <h3>Move {moveIndex + 1}</h3>
        <p>Player: {game?.moves[moveIndex]?.playerId}</p>
        <p>Word: {game?.moves[moveIndex]?.word}</p>
        <p>Score: {calculateWordScore(game?.moves[moveIndex]?.word)}</p>
      </div>
    </div>
  )
}
```

**Files to Create:**
- `src/web/components/GameReplay.tsx` - Replay UI component
- `src/web/hooks/useGameReplay.ts` - Replay state management

**Files to Modify:**
- `src/server/routes.ts` - Add replay endpoint
- `src/web/components/App.tsx` - Add replay screen

**Testing:**
- Test replay forward/backward navigation
- Verify game state is reconstructed correctly
- Test edge cases (empty game, single move)

---

### 4.2 Implement Undo Move Feature

**Priority:** 🔵 MEDIUM
**Difficulty:** ⭐⭐ Medium
**Estimated Time:** 1-2 days
**Dependencies:** None

**Description:**
Allow players to undo their last move (with opponent consent or time limit).

**Implementation:**

```typescript
// File: src/server/routes.ts
.post('/games/:id/undo', async ({ params, body }) => {
  const game = await store.get(params.id)
  if (!game) throw new GameNotFoundError()

  if (game.moves.length === 0) {
    return { ok: false, error: 'No moves to undo' }
  }

  // Only allow undo of last move within 30 seconds
  const lastMove = game.moves[game.moves.length - 1]
  const timeSinceMove = Date.now() - lastMove.timestamp
  if (timeSinceMove > 30000) {
    return { ok: false, error: 'Cannot undo move older than 30 seconds' }
  }

  // Reconstruct game without last move
  let state = createInitialGame(getBaseWord(game), game.players)
  for (let i = 0; i < game.moves.length - 1; i++) {
    const result = applyMove(state, game.moves[i], dictionary)
    if (result.ok) state = result.game
  }

  await store.set(state)
  broadcastGame(params.id, state)

  return { ok: true, game: state }
})

// File: src/shared/schemas.ts
export interface MoveRecord extends MoveBody {
  timestamp: number // Add timestamp to track when move was made
}
```

**Files to Modify:**
- `src/server/routes.ts` - Add undo endpoint
- `src/server/engine/balda.ts` - Add timestamps to moves
- `src/shared/schemas.ts` - Update MoveRecord schema
- `src/web/components/GamePanel.tsx` - Add undo button

**Testing:**
- Test undo works within time limit
- Verify game state is correctly restored
- Test undo is rejected after timeout

---

### 4.3 Add Multi-Language Dictionary Support

**Priority:** 🔵 LOW-MEDIUM
**Difficulty:** ⭐⭐⭐ Medium
**Estimated Time:** 2-3 days
**Dependencies:** Task 2.1 (PostgreSQL), Task 2.4 (Dictionary optimization)

**Description:**
Support multiple languages for game words (Russian, English, etc.) with user selection.

**Implementation:**

```typescript
// File: src/server/services/dictionary.ts
const dictionaries = new Map<string, Dictionary>()

export async function getDictionary(language: string): Promise<Dictionary> {
  if (!dictionaries.has(language)) {
    const dict = new CachedTrieDictionary(language)
    await dict.ensureLoaded()
    dictionaries.set(language, dict)
  }
  return dictionaries.get(language)!
}

// File: src/server/routes.ts
.post('/games', async ({ body }) => {
  const dictionary = await getDictionary(body.language || 'ru')
  const baseWord = body.baseWord || await dictionary.getRandomWord(5)

  return createInitialGame(baseWord, body.players, {
    language: body.language || 'ru',
  })
})

// File: src/web/components/CreateGame.tsx
<select
  value={language}
  onChange={(e) => setLanguage(e.target.value)}
>
  <option value="ru">Русский</option>
  <option value="en">English</option>
  <option value="de">Deutsch</option>
</select>
```

**Files to Modify:**
- `src/server/services/dictionary.ts` - Multi-language support
- `src/server/routes.ts` - Add language parameter
- `src/shared/schemas.ts` - Add language to GameState
- `src/web/components/CreateGame.tsx` - Language selector
- Database: Import dictionaries for multiple languages

**Testing:**
- Test games work in different languages
- Verify dictionaries load correctly
- Test switching languages doesn't break existing games

---

### 4.4 Implement AI Difficulty Levels

**Priority:** 🔵 LOW-MEDIUM
**Difficulty:** ⭐⭐⭐ Medium-Hard
**Estimated Time:** 2-4 days
**Dependencies:** None

**Description:**
Add configurable AI difficulty levels (Easy, Medium, Hard) by adjusting suggestion quality.

**Implementation:**

```typescript
// File: src/server/engine/suggest.ts
export interface SuggestionOptions {
  difficulty: 'easy' | 'medium' | 'hard'
  limit: number
}

export async function getSuggestions(
  game: GameState,
  dictionary: Dictionary,
  options: SuggestionOptions
): Promise<Suggestion[]> {
  const allSuggestions = await generateAllSuggestions(game, dictionary)

  switch (options.difficulty) {
    case 'easy':
      // Return random suggestions (not sorted by score)
      return shuffle(allSuggestions).slice(0, options.limit)

    case 'medium':
      // Return mix of good and mediocre suggestions
      const sorted = allSuggestions.sort((a, b) => b.score - a.score)
      const topHalf = sorted.slice(0, sorted.length / 2)
      return shuffle(topHalf).slice(0, options.limit)

    case 'hard':
      // Return best suggestions
      return allSuggestions
        .sort((a, b) => b.score - a.score)
        .slice(0, options.limit)
  }
}

// File: src/web/hooks/useAIPlayer.ts
useEffect(() => {
  if (!isAITurn) return

  const difficulty = game.players[currentPlayerIndex].difficulty || 'medium'

  loadSuggestions(gameId, currentPlayerId, { difficulty, limit: 10 })
    .then(suggestions => {
      if (suggestions.length > 0) {
        makeMove(suggestions[0])
      }
    })
}, [currentPlayerIndex])
```

**Files to Create:**
- `src/server/engine/difficulty.ts` - Difficulty level logic

**Files to Modify:**
- `src/server/engine/suggest.ts` - Add difficulty parameter
- `src/shared/schemas.ts` - Add difficulty to Player
- `src/web/components/CreateGame.tsx` - AI difficulty selector

**Testing:**
- Verify easy AI makes weaker moves
- Test hard AI makes optimal moves
- Ensure AI difficulty affects only AI players

---

### 4.5 Add Game History and Statistics

**Priority:** 🔵 LOW
**Difficulty:** ⭐⭐⭐ Medium
**Estimated Time:** 2-3 days
**Dependencies:** Task 2.1 (PostgreSQL), Task 1.2 (Authentication)

**Description:**
Track player statistics (games played, win rate, average score) and show game history.

**Implementation:**

```typescript
// File: src/server/db/schema.ts
export const playerStats = pgTable('player_stats', {
  userId: uuid('user_id').references(() => users.id),
  gamesPlayed: integer('games_played').notNull().default(0),
  gamesWon: integer('games_won').notNull().default(0),
  totalScore: integer('total_score').notNull().default(0),
  averageScore: integer('average_score').notNull().default(0),
  highestScore: integer('highest_score').notNull().default(0),
  updatedAt: timestamp('updated_at').notNull().defaultNow(),
})

// File: src/server/routes.ts
.get('/users/:id/stats', async ({ params }) => {
  const stats = await db
    .select()
    .from(playerStats)
    .where(eq(playerStats.userId, params.id))
    .limit(1)

  return stats[0] || {
    gamesPlayed: 0,
    gamesWon: 0,
    averageScore: 0,
  }
})

.get('/users/:id/history', async ({ params, query }) => {
  const limit = Number(query.limit) || 10
  const offset = Number(query.offset) || 0

  const games = await db
    .select()
    .from(games)
    .where(
      or(
        eq(games.player1Id, params.id),
        eq(games.player2Id, params.id)
      )
    )
    .orderBy(desc(games.createdAt))
    .limit(limit)
    .offset(offset)

  return games
})

// File: src/web/components/PlayerStats.tsx
export function PlayerStats({ userId }: { userId: string }) {
  const [stats, setStats] = useState<PlayerStats | null>(null)

  useEffect(() => {
    loadPlayerStats(userId).then(setStats)
  }, [userId])

  return (
    <div className="stats-card">
      <h3>Player Statistics</h3>
      <dl>
        <dt>Games Played:</dt>
        <dd>{stats?.gamesPlayed}</dd>

        <dt>Win Rate:</dt>
        <dd>{((stats?.gamesWon / stats?.gamesPlayed) * 100).toFixed(1)}%</dd>

        <dt>Average Score:</dt>
        <dd>{stats?.averageScore}</dd>

        <dt>Highest Score:</dt>
        <dd>{stats?.highestScore}</dd>
      </dl>
    </div>
  )
}
```

**Files to Create:**
- `src/server/db/migrations/003_add_player_stats.sql` - Stats table
- `src/web/components/PlayerStats.tsx` - Stats display component
- `src/web/components/GameHistory.tsx` - Game history component

**Files to Modify:**
- `src/server/routes.ts` - Add stats and history endpoints
- `src/server/engine/balda.ts` - Update stats when game ends

**Testing:**
- Verify stats update correctly after games
- Test history pagination
- Test stats for players with no games

---

### 4.6 Add Player Profiles and Leaderboards

**Priority:** 🔵 LOW
**Difficulty:** ⭐⭐⭐ Medium
**Estimated Time:** 2-3 days
**Dependencies:** Task 1.2 (Authentication), Task 4.5 (Statistics)

**Description:**
Allow players to create profiles and display global leaderboards.

**Implementation:**

```typescript
// File: src/server/routes.ts
.get('/leaderboard', async ({ query }) => {
  const period = query.period || 'all-time' // all-time, monthly, weekly
  const limit = Number(query.limit) || 10

  let whereClause = undefined
  if (period === 'monthly') {
    whereClause = gte(playerStats.updatedAt, startOfMonth(new Date()))
  } else if (period === 'weekly') {
    whereClause = gte(playerStats.updatedAt, startOfWeek(new Date()))
  }

  const leaders = await db
    .select({
      user: users,
      stats: playerStats,
    })
    .from(playerStats)
    .innerJoin(users, eq(playerStats.userId, users.id))
    .where(whereClause)
    .orderBy(desc(playerStats.averageScore))
    .limit(limit)

  return leaders
})

// File: src/web/components/Leaderboard.tsx
export function Leaderboard() {
  const [leaders, setLeaders] = useState<LeaderboardEntry[]>([])
  const [period, setPeriod] = useState<'all-time' | 'monthly' | 'weekly'>('all-time')

  useEffect(() => {
    loadLeaderboard({ period, limit: 10 }).then(setLeaders)
  }, [period])

  return (
    <div className="leaderboard">
      <h2>Leaderboard</h2>

      <select value={period} onChange={(e) => setPeriod(e.target.value)}>
        <option value="all-time">All Time</option>
        <option value="monthly">This Month</option>
        <option value="weekly">This Week</option>
      </select>

      <ol>
        {leaders.map((entry, index) => (
          <li key={entry.user.id}>
            <span className="rank">#{index + 1}</span>
            <span className="username">{entry.user.username}</span>
            <span className="score">{entry.stats.averageScore} avg</span>
          </li>
        ))}
      </ol>
    </div>
  )
}
```

**Files to Create:**
- `src/web/components/Leaderboard.tsx` - Leaderboard component
- `src/web/components/UserProfile.tsx` - User profile component

**Files to Modify:**
- `src/server/routes.ts` - Add leaderboard endpoint
- `src/web/components/App.tsx` - Add leaderboard screen

**Testing:**
- Verify leaderboard ranks correctly
- Test different time periods
- Test leaderboard updates after games

---

## 🟣 Developer Experience (Priority: LOW)

These tasks improve the development workflow and code quality.

### 5.1 Add API Documentation (OpenAPI/Swagger)

**Priority:** 🟣 LOW-MEDIUM
**Difficulty:** ⭐⭐ Medium
**Estimated Time:** 1-2 days
**Dependencies:** None

**Description:**
Generate interactive API documentation using OpenAPI/Swagger.

**Implementation:**

```typescript
// File: src/server/index.ts
import { swagger } from '@elysiajs/swagger'

const app = new Elysia()
  .use(swagger({
    documentation: {
      info: {
        title: 'Balda Game API',
        version: '1.0.0',
        description: 'REST API for Balda word game',
      },
      tags: [
        { name: 'games', description: 'Game management endpoints' },
        { name: 'dictionary', description: 'Dictionary endpoints' },
        { name: 'auth', description: 'Authentication endpoints' },
      ],
    },
  }))
  .use(routes)

// API docs will be available at http://localhost:3000/swagger
```

**Files to Modify:**
- `src/server/index.ts` - Add Swagger plugin
- `src/server/routes.ts` - Add OpenAPI annotations
- `package.json` - Add `@elysiajs/swagger`

**Testing:**
- Verify Swagger UI loads correctly
- Test API calls from Swagger UI
- Ensure all endpoints are documented

---

### 5.2 Create Developer Setup Guide

**Priority:** 🟣 LOW
**Difficulty:** ⭐ Easy
**Estimated Time:** 2-3 hours
**Dependencies:** None

**Description:**
Create comprehensive setup documentation for new developers.

**Implementation:**

```markdown
# File: CONTRIBUTING.md

# Contributing to Balda Game

## Prerequisites

- [Bun](https://bun.sh) >= 1.0
- [PostgreSQL](https://postgresql.org) >= 16 (for production)
- [Redis](https://redis.io) >= 7 (for production)

## Development Setup

1. **Clone the repository**
   ```bash
   git clone https://github.com/yourusername/balda.git
   cd balda
   ```

2. **Install dependencies**
   ```bash
   bun install
   ```

3. **Set up environment variables**
   ```bash
   cp .env.example .env
   # Edit .env with your configuration
   ```

4. **Start development servers**
   ```bash
   # Backend (with hot reload)
   bun run dev

   # Web frontend (separate terminal)
   bun run dev:web

   # Or both at once
   bun run dev:all
   ```

5. **Run tests**
   ```bash
   bun test              # Unit tests
   bun run test:e2e      # E2E tests
   bun run check         # Type check
   bun run lint          # Lint
   ```

## Project Structure

See [ARCHITECT.md](./ARCHITECT.md) for detailed architecture documentation.

## Making Changes

1. Create a feature branch: `git checkout -b feature/my-feature`
2. Make your changes
3. Run tests: `bun test && bun run check && bun run lint`
4. Commit: `git commit -m "feat: add my feature"`
5. Push: `git push origin feature/my-feature`
6. Open a Pull Request

## Code Style

- TypeScript strict mode
- @antfu/eslint-config (single quotes, no semicolons)
- 2-space indentation
- Functional programming patterns preferred

## Commit Convention

We follow [Conventional Commits](https://www.conventionalcommits.org/):
- `feat:` New features
- `fix:` Bug fixes
- `docs:` Documentation changes
- `refactor:` Code refactoring
- `test:` Test additions/changes
- `chore:` Build/config changes
```

**Files to Create:**
- `CONTRIBUTING.md` - Contributor guide
- `.env.example` - Environment variable template
- `docs/DEVELOPMENT.md` - Detailed development guide

**Testing:**
- Follow the guide with a fresh clone
- Verify all steps work correctly

---

### 5.3 Add Code Coverage Badges

**Priority:** 🟣 LOW
**Difficulty:** ⭐ Easy
**Estimated Time:** 1 hour
**Dependencies:** Task 3.5 (Coverage reporting)

**Description:**
Display code coverage badges in README for transparency.

**Implementation:**

```markdown
# File: README.md

# Balda Word Game

[![CI](https://github.com/yourusername/balda/workflows/CI/badge.svg)](https://github.com/yourusername/balda/actions)
[![codecov](https://codecov.io/gh/yourusername/balda/branch/main/graph/badge.svg)](https://codecov.io/gh/yourusername/balda)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.9-blue)](https://www.typescriptlang.org/)
[![License](https://img.shields.io/badge/license-MIT-green)](./LICENSE)

A Balda word game implementation with real-time multiplayer support.
```

**Files to Modify:**
- `README.md` - Add badges
- `.github/workflows/ci.yml` - Upload coverage to Codecov

**Testing:**
- Verify badges display correctly
- Test badge links work

---

### 5.4 Set Up Automated Dependency Updates

**Priority:** 🟣 LOW
**Difficulty:** ⭐ Easy
**Estimated Time:** 1 hour
**Dependencies:** None

**Description:**
Use Dependabot to automatically create PRs for dependency updates.

**Implementation:**

```yaml
# File: .github/dependabot.yml
version: 2
updates:
  - package-ecosystem: npm
    directory: "/"
    schedule:
      interval: weekly
    open-pull-requests-limit: 10
    labels:
      - dependencies
    reviewers:
      - yourusername
    commit-message:
      prefix: "chore"
      include: "scope"
```

**Files to Create:**
- `.github/dependabot.yml` - Dependabot configuration

**Testing:**
- Wait for first Dependabot PR
- Verify PR is properly formatted

---

### 5.5 Add Pre-commit Hooks

**Priority:** 🟣 LOW
**Difficulty:** ⭐ Easy
**Estimated Time:** 1-2 hours
**Dependencies:** None

**Description:**
Enforce code quality checks before commits using Husky and lint-staged.

**Implementation:**

```json
// File: package.json
{
  "lint-staged": {
    "*.ts": [
      "eslint --fix",
      "bun run check"
    ],
    "*.tsx": [
      "eslint --fix"
    ]
  }
}
```

```bash
# File: .husky/pre-commit
#!/bin/sh
. "$(dirname "$0")/_/husky.sh"

bun run lint-staged
```

**Files to Create:**
- `.husky/pre-commit` - Pre-commit hook script

**Files to Modify:**
- `package.json` - Add lint-staged configuration, husky setup script

**Testing:**
- Try to commit code with lint errors
- Verify commit is blocked
- Fix errors and retry

---

## 📚 Documentation (Priority: LOW)

These tasks improve project documentation for users and developers.

### 6.1 Create API Reference Documentation

**Priority:** 📚 LOW
**Difficulty:** ⭐⭐ Medium
**Estimated Time:** 2-3 days
**Dependencies:** Task 5.1 (OpenAPI docs)

**Description:**
Create comprehensive API reference documentation with examples.

**Files to Create:**
- `docs/api/README.md` - API overview
- `docs/api/games.md` - Games API reference
- `docs/api/authentication.md` - Auth API reference
- `docs/api/websockets.md` - WebSocket protocol docs

---

### 6.2 Add Architecture Decision Records (ADRs)

**Priority:** 📚 LOW
**Difficulty:** ⭐ Easy
**Estimated Time:** 1 day
**Dependencies:** None

**Description:**
Document key architectural decisions with rationale.

**Files to Create:**
- `docs/adr/001-use-bun-runtime.md`
- `docs/adr/002-immutable-game-state.md`
- `docs/adr/003-file-based-storage.md`
- `docs/adr/004-typebox-validation.md`

---

### 6.3 Document Deployment Procedures

**Priority:** 📚 LOW-MEDIUM
**Difficulty:** ⭐⭐ Medium
**Estimated Time:** 1-2 days
**Dependencies:** Task 2.3 (Horizontal scaling)

**Description:**
Create step-by-step deployment guide for production.

**Files to Create:**
- `docs/deployment/README.md` - Deployment overview
- `docs/deployment/docker.md` - Docker deployment
- `docs/deployment/manual.md` - Manual deployment
- `docs/deployment/rollback.md` - Rollback procedures

---

### 6.4 Create Troubleshooting Guide

**Priority:** 📚 LOW
**Difficulty:** ⭐ Easy
**Estimated Time:** 1 day
**Dependencies:** None

**Description:**
Document common issues and solutions.

**Files to Create:**
- `docs/TROUBLESHOOTING.md` - Common issues and solutions

---

### 6.5 Add Contributing Guidelines

**Priority:** 📚 LOW
**Difficulty:** ⭐ Easy
**Estimated Time:** 2-3 hours
**Dependencies:** Task 5.2 (Developer setup)

**Description:**
Formalize contribution process and code of conduct.

**Files to Create:**
- `CODE_OF_CONDUCT.md` - Community guidelines
- `CONTRIBUTING.md` - Contribution process (already created in 5.2)

---

## Priority Summary

### Immediate (Start Now)
1. ✅ Rate Limiting (1.1) - 2 hours
2. ✅ JWT Authentication (1.2) - 1-2 days
3. ✅ Error Monitoring (1.4) - 3-4 hours

### Short-term (Next 2 weeks)
1. PostgreSQL Migration (2.1) - 2-3 days
2. WebSocket Authentication (1.3) - 4-6 hours
3. Unit Tests (3.1) - 2-3 days
4. Production Logging (1.5) - 4-6 hours

### Medium-term (Next month)
1. Redis Pub/Sub (2.2) - 2-3 days
2. Integration Tests (3.2) - 2-3 days
3. E2E Tests (3.3) - 3-4 days
4. CI/CD Pipeline (3.4) - 1-2 days

### Long-term (Next quarter)
1. Horizontal Scaling (2.3) - 3-5 days
2. Game Replay (4.1) - 2-3 days
3. Multi-language Support (4.3) - 2-3 days
4. AI Difficulty Levels (4.4) - 2-4 days

---

## Estimated Total Effort

- **Critical (Priority HIGH):** ~10-15 days
- **Scalability (Priority MEDIUM-HIGH):** ~15-20 days
- **Testing (Priority MEDIUM):** ~12-16 days
- **Features (Priority LOW-MEDIUM):** ~15-20 days
- **Developer Experience (Priority LOW):** ~5-8 days
- **Documentation (Priority LOW):** ~5-8 days

**Total:** ~62-87 days of development effort

---

## Notes

- Tasks can be parallelized across multiple developers
- Some dependencies can be worked around with mocks/stubs
- Priorities may shift based on business requirements
- Estimated times assume experienced TypeScript developer
- Add 20-30% buffer for unexpected complexity
