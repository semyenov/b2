# ADR-003: File-Based Storage with PostgreSQL Migration Path

## Status

Accepted

## Context

We needed to choose a persistence strategy for game state. The requirements were:

- **Simple development** - Easy to set up and inspect
- **Low barrier to entry** - Contributors shouldn't need database setup
- **Production ready** - Support scaling to multiple servers
- **Data integrity** - No data loss or corruption
- **Query capabilities** - Support finding games, filtering, etc.

The key trade-offs:
- **Development speed** vs **Production scalability**
- **Simplicity** vs **Features**
- **No dependencies** vs **Powerful tooling**

## Decision

We will use **file-based storage (unstorage) for development** with a clear **migration path to PostgreSQL for production**.

### Implementation

**Development (default):**
```typescript
import { createStorage } from 'unstorage'
import fsDriver from 'unstorage/drivers/fs'

const storage = createStorage({
  driver: fsDriver({
    base: process.env.STORAGE_DIR || './data/games'
  })
})

// Save game
await storage.setItem(`${gameId}.json`, game)

// Load game
const game = await storage.getItem(`${gameId}.json`)
```

**Production (PostgreSQL):**
```typescript
import { drizzle } from 'drizzle-orm/postgres-js'
import postgres from 'postgres'

const client = postgres(process.env.DATABASE_URL)
const db = drizzle(client)

// Save game
await db.insert(games).values(game)

// Load game
const game = await db.query.games.findFirst({
  where: eq(games.id, gameId)
})
```

### Migration Strategy

1. **Check DATABASE_URL** on startup
2. If set → use PostgreSQL
3. If not set → use file storage + warning log
4. Provide migration script: `bun run migrate:to-postgres`

## Rationale

### Development Benefits

**Zero setup:**
- No database installation required
- No connection strings or credentials
- Works immediately after `git clone && bun install`

**Easy inspection:**
```bash
# View all games
ls ./data/games/

# Inspect game state
cat ./data/games/550e8400-e29b-41d4-a716-446655440000.json | jq
```

**Simple debugging:**
- Delete game: `rm ./data/games/<id>.json`
- Reset all: `rm -rf ./data/games/*`
- Backup: `cp -r ./data/games ./backup`

**Git-friendly:**
- Can commit test fixtures
- Easy to create test scenarios
- Reproducible development environments

### Production Benefits

**PostgreSQL for scaling:**
- Transactions for data integrity
- Indexes for fast queries
- Support for complex filters
- Connection pooling
- Backups and point-in-time recovery
- Multiple server instances can share data

**Drizzle ORM:**
- Type-safe queries
- Automatic schema migrations
- Studio GUI for data inspection
- Works with PostgreSQL, SQLite, MySQL

### Migration Path is Clear

Developers can migrate when ready:

```bash
# 1. Set up PostgreSQL
createdb balda

# 2. Configure connection
echo "DATABASE_URL=postgresql://..." >> .env

# 3. Run migrations
bun run db:migrate

# 4. Import existing games (optional)
bun run migrate:to-postgres

# 5. Restart server (auto-detects PostgreSQL)
bun run dev
```

## Consequences

### Positive

- **Fast onboarding** - Contributors can start immediately
- **Simple debugging** - Inspect JSON files with any text editor
- **No dependencies** - Works without external services
- **Easy testing** - Create test fixtures, reset state easily
- **Clear upgrade path** - Move to PostgreSQL when needed
- **Best of both worlds** - Simplicity in dev, power in production

### Negative

- **Two codepaths** - File storage and PostgreSQL must be maintained
- **Query limitations** - File storage doesn't support complex queries well
- **No transactions** - File storage lacks ACID guarantees
- **Not suitable for production** - Can't scale beyond single server
- **Manual migration** - Developers must remember to migrate before production

### Mitigation

**Log warnings:**
```typescript
if (!process.env.DATABASE_URL) {
  consola.warn(
    'Using file-based storage (DATABASE_URL not set). ' +
    'Consider migrating to PostgreSQL for production.'
  )
}
```

**Unified interface:**
Both storage backends implement same interface:
```typescript
interface GameStore {
  get(id: string): Promise<GameState | null>
  set(game: GameState): Promise<void>
  getAll(): Promise<GameState[]>
  delete(id: string): Promise<void>
}
```

**Migration script:**
Automated script handles data transfer:
```bash
bun run migrate:to-postgres
# Reads all JSON files
# Inserts into PostgreSQL
# Verifies data integrity
# Provides rollback instructions
```

## Alternatives Considered

### Alternative 1: PostgreSQL Only

**Description**: Require PostgreSQL from day one

**Pros:**
- Single code path
- Production-ready from start
- Full query capabilities
- ACID transactions
- Battle-tested scalability

**Cons:**
- High barrier to entry (must install PostgreSQL)
- Slower development setup
- Harder to inspect data
- More complex testing
- Contributors may be discouraged

**Why not chosen:**
We want to minimize friction for new contributors. Requiring PostgreSQL setup would discourage quick experimentation and contributions.

### Alternative 2: SQLite for Development

**Description**: Use SQLite in development, PostgreSQL in production

**Pros:**
- ACID transactions in both environments
- SQL queries work in both
- File-based but with full database features
- Easy to inspect with SQLite GUI tools

**Cons:**
- Still requires understanding SQL
- Schema differences between SQLite and PostgreSQL
- Harder to debug than plain JSON
- Migration still needed for production
- Less obvious state inspection

**Why not chosen:**
SQLite is a middle ground that doesn't excel at either simplicity (JSON files) or production features (PostgreSQL). We prefer the clearer distinction.

### Alternative 3: In-Memory Only

**Description**: Store games in memory (Map), no persistence

**Pros:**
- Fastest possible performance
- Simplest implementation
- No I/O overhead

**Cons:**
- Data lost on restart
- Impossible to debug past sessions
- Can't share data between processes
- Not suitable for any production use

**Why not chosen:**
Not practical for development (loses data on every restart) or production.

### Alternative 4: Redis for Everything

**Description**: Use Redis for both development and production

**Pros:**
- Fast in-memory storage
- Rich data structures
- Pub/Sub for WebSocket scaling
- Single storage layer

**Cons:**
- Requires Redis installation
- Another service to run
- More complex setup
- Overkill for simple game storage
- Data inspection requires Redis CLI

**Why not chosen:**
Redis is excellent for caching and pub/sub, but overkill as primary storage. It also has the same setup friction as PostgreSQL.

## Future Considerations

### Potential Improvements

1. **Read replicas** - Once on PostgreSQL, add read replicas for scaling
2. **Redis caching** - Cache hot games in Redis for faster access
3. **S3 archive** - Move old/finished games to S3 for long-term storage
4. **Multi-region** - Use PostgreSQL with geographic distribution

### When to Migrate

Trigger for PostgreSQL migration:
- Deploying to production
- Multiple server instances needed
- >1000 active games
- Complex query requirements
- Need for reporting/analytics

## References

- [unstorage Documentation](https://unstorage.unjs.io/)
- [Drizzle ORM](https://orm.drizzle.team/)
- [PostgreSQL Best Practices](https://wiki.postgresql.org/wiki/Don%27t_Do_This)
- [The Twelve-Factor App: Backing Services](https://12factor.net/backing-services)

## Notes

- **Date**: 2025-10-15
- **Author**: semyenov
- **Status**: Implemented in v1.0
- **Migration Script**: `scripts/migrate-to-postgres.ts`
