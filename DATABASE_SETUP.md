# Database Setup Guide

This guide explains how to set up and use PostgreSQL with the Balda game backend.

## Overview

The Balda game backend supports two storage options:
- **File-based storage** (default): Games stored as JSON files in `./data/games`
- **PostgreSQL storage** (recommended for production): Games stored in a PostgreSQL database

## Quick Start

### 1. Start PostgreSQL with Docker

```bash
# Start PostgreSQL container
docker compose up -d

# Check container status
docker compose ps

# View logs
docker compose logs -f postgres
```

### 2. Configure Environment

Add `DATABASE_URL` to your `.env` file:

```bash
DATABASE_URL=postgresql://balda:balda@localhost:5432/balda
```

### 3. Run Initial Migration

The database schema is automatically created when the container starts (from `src/server/db/migrations/001_initial.sql`).

### 4. Start the Server

```bash
bun run dev
```

The server will automatically:
- Detect `DATABASE_URL` in environment
- Connect to PostgreSQL
- Use database storage instead of file storage

## Database Schema

### Tables

#### `games`
Stores game state including board, players, moves, and scores.

```sql
CREATE TABLE games (
  id UUID PRIMARY KEY,
  size INTEGER NOT NULL,
  board JSONB NOT NULL,
  players JSONB NOT NULL,
  ai_players JSONB NOT NULL,
  current_player_index INTEGER NOT NULL,
  moves JSONB NOT NULL,
  scores JSONB NOT NULL,
  used_words JSONB NOT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP NOT NULL DEFAULT NOW()
);
```

**Indexes:**
- `games_created_at_idx` - Fast sorting by creation time
- `games_updated_at_idx` - Fast sorting by update time

#### `words`
Stores dictionary words for efficient lookups (optional, for dictionary optimization).

```sql
CREATE TABLE words (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  word TEXT NOT NULL,
  language TEXT NOT NULL DEFAULT 'ru',
  created_at TIMESTAMP NOT NULL DEFAULT NOW()
);
```

**Indexes:**
- `words_word_idx` - Fast word lookups
- `words_language_idx` - Filter by language
- `words_word_language_idx` - Compound index for word+language queries

#### `users`
Stores user accounts (future feature, not currently used).

```sql
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  username TEXT NOT NULL UNIQUE,
  email TEXT NOT NULL UNIQUE,
  password_hash TEXT NOT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP NOT NULL DEFAULT NOW()
);
```

## Migration Scripts

### Migrate from File Storage to PostgreSQL

If you have existing games in file storage, migrate them:

```bash
# Make sure PostgreSQL is running
docker compose up -d

# Set DATABASE_URL and run migration
DATABASE_URL=postgresql://balda:balda@localhost:5432/balda \
  bun run migrate:to-postgres
```

The script will:
- Read all JSON files from `./data/games`
- Validate game data
- Insert games into PostgreSQL
- Report success/failure for each file

### Import Dictionary to PostgreSQL (Optional)

For optimized dictionary lookups, import dictionary words:

```bash
# Import Russian dictionary (default)
DATABASE_URL=postgresql://balda:balda@localhost:5432/balda \
  bun run scripts/import-dictionary.ts

# Import custom dictionary
DATABASE_URL=postgresql://balda:balda@localhost:5432/balda \
  bun run scripts/import-dictionary.ts ./path/to/dict.txt ru
```

This enables:
- Faster word validation (indexed lookups)
- Prefix checking for auto-completion
- Multi-language support

## Drizzle ORM Commands

### Generate Migrations

After modifying `src/server/db/schema.ts`:

```bash
bun run db:generate
```

### Apply Migrations

```bash
bun run db:migrate
```

### Push Schema Directly (Development Only)

Skip migrations and push schema directly:

```bash
bun run db:push
```

⚠️ **Warning**: This can cause data loss in production. Use migrations instead.

### Drizzle Studio

Visual database browser:

```bash
bun run db:studio
```

Opens at [http://localhost:4983](http://localhost:4983)

## Connection Pooling

The PostgreSQL client is configured with connection pooling for performance:

- **Max connections**: 20
- **Idle timeout**: 20 seconds
- **Connect timeout**: 10 seconds
- **Prepared statements**: Enabled

Configuration in `src/server/db/client.ts`.

## Performance Considerations

### Indexes

All critical queries have indexes:
- Game lookups by ID (primary key)
- Game sorting by creation/update time
- Word validation (word index)
- Language filtering (language index)

### JSONB Columns

Game state is stored in JSONB columns for:
- **Flexibility**: Schema-less storage for game data
- **Performance**: Native PostgreSQL JSONB indexing
- **Querying**: Can query nested JSON data if needed

### Connection Management

- Connections are reused from the pool
- Idle connections are closed after 20s
- Graceful shutdown on SIGTERM/SIGINT

## Backup and Restore

### Backup Database

```bash
# Dump to SQL file
docker compose exec postgres pg_dump -U balda balda > backup.sql

# Dump to custom format (compressed)
docker compose exec postgres pg_dump -U balda -Fc balda > backup.pgdump
```

### Restore Database

```bash
# From SQL file
docker compose exec -T postgres psql -U balda balda < backup.sql

# From custom format
docker compose exec -T postgres pg_restore -U balda -d balda backup.pgdump
```

### Automated Backups

For production, set up automated backups:

```bash
# Add to crontab
0 2 * * * docker compose exec postgres pg_dump -U balda -Fc balda > /backups/balda-$(date +\%Y\%m\%d).pgdump
```

## Troubleshooting

### Cannot Connect to Database

```bash
# Check if PostgreSQL is running
docker compose ps

# Check logs
docker compose logs postgres

# Restart container
docker compose restart postgres
```

### Connection Refused

Ensure `DATABASE_URL` is correct:

```bash
# Test connection with psql
docker compose exec postgres psql -U balda -d balda

# Check port binding
docker compose port postgres 5432
```

### Migration Errors

```bash
# Check database state
docker compose exec postgres psql -U balda -d balda -c "\dt"

# Reset database (WARNING: deletes all data)
docker compose down -v
docker compose up -d
```

### Slow Queries

```bash
# Enable query logging in docker-compose.yml
environment:
  POSTGRES_DB: balda
  POSTGRES_USER: balda
  POSTGRES_PASSWORD: balda
  POSTGRES_LOG_STATEMENT: all

# View slow queries
docker compose logs postgres | grep "duration:"
```

## Production Deployment

### Environment Variables

```bash
# Production database URL
DATABASE_URL=postgresql://balda_prod:secure_password@db.example.com:5432/balda_production

# Enable production mode
NODE_ENV=production
```

### Security Checklist

- [ ] Change default PostgreSQL password
- [ ] Use SSL/TLS for database connections
- [ ] Restrict database access by IP
- [ ] Enable connection encryption
- [ ] Set up automated backups
- [ ] Monitor database performance
- [ ] Configure connection pool limits
- [ ] Enable query logging (production level)

### Monitoring

Recommended monitoring tools:
- **pgAdmin** - Web-based PostgreSQL management
- **pg_stat_statements** - Query performance statistics
- **Prometheus + Grafana** - Metrics and alerting
- **Sentry** - Error tracking

## Additional Resources

- [Drizzle ORM Documentation](https://orm.drizzle.team/)
- [PostgreSQL Documentation](https://www.postgresql.org/docs/)
- [Docker Compose Documentation](https://docs.docker.com/compose/)
- [Connection Pooling Best Practices](https://node-postgres.com/features/pooling)

## FAQ

### Why PostgreSQL instead of file storage?

**Pros:**
- ✅ ACID transactions (data consistency)
- ✅ Concurrent access (multiple servers)
- ✅ Query performance (indexes)
- ✅ Data integrity (constraints)
- ✅ Scalability (connection pooling)

**Cons:**
- ❌ Additional infrastructure requirement
- ❌ More complex setup

### Can I switch back to file storage?

Yes! Simply remove `DATABASE_URL` from your `.env` file and restart the server.

### How do I upgrade PostgreSQL?

```bash
# Backup database
docker compose exec postgres pg_dump -U balda -Fc balda > backup.pgdump

# Update docker-compose.yml with new version
# For example: postgres:16-alpine -> postgres:17-alpine

# Stop and remove old container
docker compose down

# Start new container
docker compose up -d

# Restore if needed
docker compose exec -T postgres pg_restore -U balda -d balda backup.pgdump
```

### What about Redis for caching?

Redis support is planned for future releases for:
- Session storage
- WebSocket scaling across multiple servers
- Caching frequently accessed data

See `.env.example` for Redis configuration options.
