# Database Normalization Migration Guide

## Overview

The Balda database has been migrated from a denormalized JSONB structure to a properly normalized relational schema. This document provides instructions for working with the new database structure.

## What Changed

### Old Schema (Denormalized JSONB)
```sql
games
  ├─ players (JSONB array)
  ├─ aiPlayers (JSONB array)
  ├─ moves (JSONB array)
  ├─ scores (JSONB object)
  └─ usedWords (JSONB array)
```

### New Schema (Normalized Relational)
```sql
games
  ├─ id, size, board, baseWord, status
  └─ currentPlayerIndex, timestamps

game_players (NEW)
  ├─ gameId → games.id (CASCADE)
  ├─ userId → users.id (SET NULL)
  ├─ guestName, playerIndex, isAI
  └─ Supports both registered users and guests

moves (NEW)
  ├─ gameId → games.id (CASCADE)
  ├─ gamePlayerId → game_players.id (CASCADE)
  ├─ position (row/col), letter, word, score
  └─ moveNumber, timestamps

game_words (NEW)
  ├─ gameId → games.id (CASCADE)
  ├─ moveId → moves.id (CASCADE)
  └─ word, timestamps

users (existing)
  └─ Authentication data

words (existing)
  └─ Dictionary data
```

## Key Benefits

✅ **Referential Integrity** - Foreign keys ensure data consistency
✅ **Efficient Queries** - Indexed columns for fast lookups
✅ **User Association** - Ready to link players to user accounts
✅ **Analytics** - Can query individual moves, player stats, word frequency
✅ **Scalability** - Optimized for growth
✅ **Data Integrity** - Cascade deletes prevent orphaned records

## Database Commands

### Fresh Installation
```bash
# 1. Reset database (drops and recreates)
bun run db:reset

# 2. Apply schema (creates all tables)
bun run db:push

# 3. Verify setup
bun run db:view
```

### Migrating Existing Data
```bash
# If you have existing games in file storage (./data/games)
bun run migrate:to-postgres

# If you have games in old JSONB format in database
bun run migrate:normalize:dry    # Preview changes
bun run migrate:normalize        # Apply migration
```

### Database Management
```bash
bun run db:view              # View database contents
bun run db:studio            # Open Drizzle Studio (web UI)
bun run db:push              # Push schema changes
bun run db:reset             # Drop and recreate database
bun run migrate:rollback     # Rollback to old schema (emergency only)
```

## Development Workflow

### Creating a New Game
The `gameStore.set()` method now:
1. Creates game record
2. Creates game_players records (links players to game)
3. Extracts base word from board
4. Sets initial game status

```typescript
// No code changes needed - gameStore handles normalization
const game = createGame(id, { size: 5, baseWord: 'HOUSE', players: ['Alice', 'Bob'] })
await store.set(game)  // Automatically creates normalized records
```

### Submitting a Move
When a move is submitted:
1. Move record is inserted into `moves` table
2. Score is calculated and stored
3. Used word is added to `game_words` table
4. Game state is updated

```typescript
// No code changes needed
const result = applyMove(game, moveInput, dictionary)
await store.set(result.game)  // Syncs new moves to database
```

### Querying Games
```typescript
// Get game with all related data (players, moves, words)
const game = await store.get(gameId)
// Returns: GameState with reconstructed arrays

// Get all games
const games = await store.getAll()
```

## New Analytical Queries

With the normalized schema, you can now run powerful queries:

### Player Leaderboard
```sql
SELECT
  gp.guest_name,
  COUNT(DISTINCT m.game_id) as games_played,
  SUM(m.score) as total_score,
  AVG(m.score) as avg_score_per_move
FROM game_players gp
JOIN moves m ON m.game_player_id = gp.id
GROUP BY gp.id, gp.guest_name
ORDER BY total_score DESC
LIMIT 10
```

### Most Common Words
```sql
SELECT
  word,
  COUNT(*) as times_used,
  AVG(m.score) as avg_score
FROM game_words gw
JOIN moves m ON m.id = gw.move_id
GROUP BY word
ORDER BY times_used DESC
LIMIT 20
```

### Player Move History
```sql
SELECT
  g.id as game_id,
  m.word,
  m.letter,
  m.score,
  m.move_number,
  m.created_at
FROM moves m
JOIN game_players gp ON m.game_player_id = gp.id
JOIN games g ON m.game_id = g.id
WHERE gp.guest_name = 'Alice'
ORDER BY m.created_at DESC
```

### Game Statistics
```sql
SELECT
  g.id,
  g.base_word,
  g.status,
  COUNT(DISTINCT gp.id) as player_count,
  COUNT(m.id) as move_count,
  MAX(m.score) as highest_scoring_move,
  g.created_at
FROM games g
LEFT JOIN game_players gp ON gp.game_id = g.id
LEFT JOIN moves m ON m.game_id = g.id
GROUP BY g.id
ORDER BY g.created_at DESC
```

## Schema Details

### Foreign Key Relationships
```
games
  ↓ CASCADE DELETE
game_players
  ↓ CASCADE DELETE
moves
  ↓ CASCADE DELETE
game_words

users
  ↓ SET NULL
game_players (guest players preserved)
```

### Indexes
All tables have optimized indexes:
- `game_players`: gameId, userId, (gameId + playerIndex)
- `moves`: gameId, gamePlayerId, (gameId + moveNumber), (positionRow + positionCol)
- `game_words`: gameId, word, moveId
- `games`: createdAt, updatedAt, status

## Troubleshooting

### Database Connection Issues
```bash
# Check if PostgreSQL is running
# Default: postgresql://balda:balda@localhost:5432/balda

# Test connection
bun run db:view
```

### Schema Mismatch
```bash
# Reset and reapply schema
bun run db:reset
bun run db:push
```

### Migration Errors
```bash
# If migration fails, check logs
bun run migrate:normalize:dry  # Preview without applying

# If needed, rollback (WARNING: drops normalized tables)
bun run migrate:rollback
```

## Files Modified

### Created
- `drizzle/0001_normalized_schema.sql` - SQL migration
- `scripts/migrate-to-normalized-db.ts` - Data migration script
- `scripts/rollback-normalized-db.ts` - Rollback script
- `scripts/reset-db.ts` - Database reset utility

### Modified
- `src/server/db/schema.ts` - Normalized table definitions
- `src/server/db/gameStore.ts` - Refactored for normalized queries
- `scripts/db-viewer.ts` - Updated for normalized schema
- `scripts/migrate-to-postgres.ts` - Compatible with new schema
- `drizzle.config.ts` - Fixed migrations output directory

## Performance Considerations

### Before (Denormalized JSONB)
- ❌ Full table scan to find games by player
- ❌ Cannot index individual moves
- ❌ Scores calculated on every read
- ❌ Slow word frequency queries

### After (Normalized Relational)
- ✅ Indexed player lookups (ms)
- ✅ Efficient move history queries
- ✅ Scores pre-calculated and stored
- ✅ Fast analytics with proper indexes

## Future Enhancements Enabled

With the normalized schema, these features are now possible:
1. **User Accounts** - Link game_players to users table
2. **Player Ratings** - ELO/ranking systems
3. **Achievements** - Track player milestones
4. **Game Replays** - Step through move history
5. **Statistics Dashboard** - Real-time analytics
6. **Tournament Mode** - Multi-game tournaments
7. **Word Analytics** - Most valuable letters, common patterns

---

**Generated**: 2025-10-16
**Migration Status**: ✅ Complete
**Version**: 1.0.0
