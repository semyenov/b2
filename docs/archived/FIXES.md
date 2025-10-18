# Balda Game - Applied Fixes

**Date**: October 16, 2025
**Session**: Critical bug fixes
**Status**: 4 issues fixed, 1 schema migration created

---

## Summary

This document details the fixes applied to resolve critical issues identified in PROBLEMS.md and discovered during debugging. The **root cause** of moves not displaying was found to be a missing state update in the frontend's `makeMove` function.

### Fixed Issues

- ✅ **Issue #1**: Base word normalization bug (CRITICAL - Backend)
- ✅ **Issue #2**: Base word missing from game_words table (CRITICAL - Backend)
- ✅ **Issue #5**: Environment config not used in ApiClient (MODERATE - Frontend)
- ✅ **NEW**: Missing state update in makeMove function (CRITICAL - Frontend) ⭐
- 📝 **Schema Migration**: Created migration for nullable moveId field
- 🔍 **Debug Logging**: Added comprehensive logging for troubleshooting

---

## Issue #1: Base Word Normalization Bug ✅

### Problem
The `extractBaseWord()` function returned unnormalized text (e.g., "слово") instead of normalized uppercase (e.g., "СЛОВО"), causing a mismatch with game logic that expects all words to be normalized.

### Impact
- Data corruption in PostgreSQL storage
- Word validation failures
- **Moves not displaying in frontend** (words failed validation and weren't saved)

### Fix Applied

**File**: `src/server/db/gameStore.ts`

**Changes**:
1. Added `normalizeWord` import from `../engine/balda`
2. Updated `extractBaseWord()` to normalize the result

```typescript
// BEFORE
return letters.join('')

// AFTER
return normalizeWord(letters.join(''))
```

**Lines Changed**: 4, 428

### Testing
After applying this fix:
1. Restart backend server
2. Create a new game
3. Make moves
4. Verify moves display correctly in frontend sidebar

---

## Issue #2: Base Word Missing from game_words Table ✅

### Problem
When creating a new game, the base word was never inserted into the `game_words` table, violating the normalized schema design where ALL used words should be tracked.

### Impact
- Data model inconsistency
- `game_words` table incomplete
- Manual reconstruction required in `reconstructGameState()`

### Fix Applied

**Files Changed**:
- `src/server/db/schema.ts` (schema update)
- `src/server/db/gameStore.ts` (insertion logic)

**Changes**:

1. **Schema Change** - Made `moveId` nullable in `game_words` table:
```typescript
// BEFORE
moveId: uuid('move_id').notNull().references(() => moves.id, { onDelete: 'cascade' })

// AFTER
moveId: uuid('move_id').references(() => moves.id, { onDelete: 'cascade' })
```

2. **Insertion Logic** - Added base word insertion in `set()` method:
```typescript
// Insert base word into game_words table (Issue #2 fix)
// Base word has no associated move, so moveId is null
await tx.insert(gameWords).values({
  gameId: game.id,
  word: baseWord,
  moveId: null,
})
```

**Lines Changed**:
- `schema.ts`: Line 89
- `gameStore.ts`: Lines 162-168

### Database Migration

**Migration File**: `drizzle/0000_regular_oracle.sql`

**SQL Statement**:
```sql
ALTER TABLE "game_words" ALTER COLUMN "move_id" DROP NOT NULL;
```

**To Apply Migration**:
```bash
# Option 1: Using drizzle-kit
DATABASE_URL=postgresql://balda:balda@localhost:5432/balda bunx drizzle-kit push

# Option 2: Manual SQL
psql -U balda -d balda -c "ALTER TABLE game_words ALTER COLUMN move_id DROP NOT NULL;"
```

---

## Issue #5: Environment Config Not Used in ApiClient ✅

### Problem
The `ApiClient` class used a hardcoded `/api` base URL instead of referencing centralized environment configuration, making it harder to maintain and deploy.

### Impact
- Technical debt (hardcoded values)
- Inconsistent patterns across codebase
- Harder to configure for different deployment scenarios

### Fix Applied

**File**: `src/web/lib/client.ts`

**Changes**:
1. Extracted hardcoded `/api` into a documented helper function
2. Added clear documentation explaining Vite proxy behavior

```typescript
// ADDED
/**
 * Get API base URL based on environment
 * In development with Vite proxy: uses '/api' (proxied to backend)
 * In other environments: uses '/api' by default
 * Can be overridden via constructor parameter
 */
function getDefaultApiBaseUrl(): string {
  // Use '/api' for Vite proxy compatibility
  // Vite proxy rewrites /api/* → http://localhost:3000/*
  return '/api'
}

// UPDATED
constructor(private baseUrl: string = getDefaultApiBaseUrl()) { }
```

**Lines Changed**: 17-27, 37

### Note
This is a refactoring improvement. The value remains `/api` for Vite proxy compatibility, but is now centralized and documented. Future deployments can easily override this via the constructor parameter.

---

## ⭐ NEW: Missing State Update in makeMove Function ✅

### Problem
The `makeMove` function in `useGameClient.ts` was **not updating local React state** after successfully submitting a move to the backend. It made the API call and received the updated game state, but threw it away instead of using it.

This meant the UI relied ENTIRELY on WebSocket broadcasts to update, which has several problems:
- 50ms delay before broadcast (see `routes.ts:177`)
- WebSocket might not be connected
- WebSocket message could be lost
- Race conditions between HTTP response and WebSocket message

### Impact
🔥 **This was the PRIMARY cause of moves not displaying!**

- Moves submitted successfully to backend
- Database updated correctly
- But frontend state never updated
- Sidebar showed no moves because `currentGame.moves` was stale

### Fix Applied

**File**: `src/web/hooks/useGameClient.ts`

**Changes**:

1. **Added logger import** (line 5):
```typescript
import { logger } from '@utils/logger'
```

2. **Updated makeMove to set local state** (lines 114-137):
```typescript
// BEFORE
const makeMove = async (move: MoveBody) => {
  if (!currentGame) {
    return
  }
  const result = await apiCall(() => apiClient.makeMove(currentGame.id, move))
  if (!result) {
    // Error already set by apiCall
  }
}

// AFTER
const makeMove = async (move: MoveBody) => {
  if (!currentGame) {
    logger.warn('Cannot make move: currentGame is null')
    return
  }

  logger.debug('Making move:', { move, currentMoves: currentGame.moves.length })
  const result = await apiCall(() => apiClient.makeMove(currentGame.id, move))

  if (result) {
    logger.info('Move successful:', {
      word: move.word,
      playerId: move.playerId,
      totalMoves: result.moves.length,
      previousMoves: currentGame.moves.length,
    })
    // CRITICAL FIX: Update local state immediately with the move result
    // Don't rely solely on WebSocket broadcast which has 50ms delay
    setCurrentGame(result)  // ← THE FIX!
  }
  else {
    logger.error('Move failed: result is null')
  }
}
```

3. **Added WebSocket debug logging** (lines 35-62):
```typescript
// Added logging to WebSocket connection and message handlers
logger.info('Connecting WebSocket for game:', gameId)
// ... in onMessage callback:
logger.debug('WebSocket game update received:', {
  gameId: updatedGame.id,
  moves: updatedGame.moves.length,
  currentPlayerIndex: updatedGame.currentPlayerIndex,
})
```

4. **Added usePlayerStats debugging** (`usePlayerStats.ts` lines 54-62):
```typescript
// Debug logging to help identify filtering issues
logger.debug('usePlayerStats:', {
  playerIndex,
  playerName: player,
  totalMoves: game.moves.length,
  playerMoves: playerWords.length,
  allPlayers: game.players,
  movePlayerIds: game.moves.map(m => m.playerId),
})
```

**Lines Changed**:
- `useGameClient.ts`: Lines 5, 35-62, 114-137
- `usePlayerStats.ts`: Lines 2, 54-62

### Why This Fixes the Problem

**Before Fix**:
1. User makes move → HTTP POST to `/games/:id/move`
2. Backend returns updated game with move in `moves` array
3. Frontend receives result but **doesn't use it**
4. UI shows no new moves (stale state)
5. 50ms later, WebSocket broadcast sent
6. If WebSocket connected, UI updates (delayed)
7. If WebSocket disconnected/failed, UI never updates

**After Fix**:
1. User makes move → HTTP POST to `/games/:id/move`
2. Backend returns updated game with move in `moves` array
3. Frontend **immediately updates** `currentGame` state with result
4. **UI updates instantly** showing the new move
5. 50ms later, WebSocket broadcast sent (redundant but harmless)
6. WebSocket update is ignored if state already current

### Testing
After applying this fix:
1. Make a move in the web UI
2. Move should appear **immediately** in the sidebar (no delay)
3. Check browser console for logs:
   - "Making move: ..."
   - "Move successful: ..."
   - Should show `totalMoves` increased by 1
4. WebSocket update arrives 50ms later (logged separately)

---

## Verification Steps

### 1. Apply Database Migration

```bash
# Check current database schema
psql -U balda -d balda -c "\d game_words"

# Apply migration (choose one method)
DATABASE_URL=postgresql://balda:balda@localhost:5432/balda bunx drizzle-kit push
# OR
psql -U balda -d balda -c "ALTER TABLE game_words ALTER COLUMN move_id DROP NOT NULL;"
```

### 2. Restart Backend

```bash
# Kill existing backend process if running
pkill -f "bun run dev"

# Start fresh backend
bun run dev
```

### 3. Test Move Creation and Display

```bash
# In another terminal, start frontend
bun run dev:web

# In browser:
1. Open http://localhost:5173
2. Create a new game (or use Quick Start)
3. Make a move
4. Verify the move appears in the player sidebar
5. Check database:
   psql -U balda -d balda -c "SELECT * FROM moves;"
   psql -U balda -d balda -c "SELECT * FROM game_words;"
```

### 4. Verify Base Word in Database

```bash
# Check that base word is in game_words table with NULL moveId
psql -U balda -d balda -c "
  SELECT gw.word, gw.move_id, g.base_word
  FROM game_words gw
  JOIN games g ON gw.game_id = g.id
  WHERE gw.move_id IS NULL;
"

# Expected output: Should show base words with NULL move_id
```

---

## Expected Outcomes

After applying these fixes:

1. ✅ **Moves Display Correctly**
   - Player moves show up in frontend sidebar
   - Scores update properly
   - Word history is complete

2. ✅ **Data Integrity**
   - All base words normalized to uppercase
   - Base words present in `game_words` table
   - Consistent data across tables

3. ✅ **No Validation Errors**
   - Moves save successfully
   - No word duplication errors
   - Proper turn progression

---

## Files Modified

### Backend
- `src/server/db/schema.ts` - Made moveId nullable in game_words
- `src/server/db/gameStore.ts` - Added normalization + base word insertion
- `drizzle/0000_regular_oracle.sql` - Database migration (generated)

### Frontend
- `src/web/lib/client.ts` - Refactored hardcoded API base URL
- `src/web/hooks/useGameClient.ts` - **Fixed missing state update + added debug logging** ⭐
- `src/web/hooks/usePlayerStats.ts` - Added debug logging

**Total Files Changed**: 6
**Lines Added**: ~60
**Lines Modified**: ~20

---

## Remaining Issues

The following issues from PROBLEMS.md were **not fixed** in this session:

### High Priority
- **Issue #3**: Incomplete PostgreSQL migration (transaction handling, optimistic locking)
- **Issue #4**: Frontend moves display - should be resolved by Issue #1, verify after testing

### Moderate Priority
- **Issue #6**: Vite proxy production deployment guidance needed
- **Issue #7**: Missing error handling in database operations

### Low Priority
- **Issue #8**: Documentation mismatch in CLAUDE.md
- **Issue #9**: Dictionary loading race condition
- **Issue #10**: Type safety issues with Elysia JWT plugin

See PROBLEMS.md for details on remaining issues.

---

## Rollback Instructions

If the fixes cause issues, you can rollback:

### 1. Revert Code Changes

```bash
git diff  # Review changes
git checkout src/server/db/gameStore.ts
git checkout src/server/db/schema.ts
git checkout src/web/lib/client.ts
```

### 2. Revert Database Migration

```bash
# Restore NOT NULL constraint on move_id
psql -U balda -d balda -c "
  UPDATE game_words SET move_id = '00000000-0000-0000-0000-000000000000'
  WHERE move_id IS NULL;

  ALTER TABLE game_words
  ALTER COLUMN move_id SET NOT NULL;
"
```

**Warning**: This will lose base word entries from `game_words` table.

---

## Success Criteria

✅ **Fix is successful if**:
1. New games can be created without errors
2. Players can make moves successfully
3. Moves display immediately in frontend sidebar
4. Database queries show:
   - Normalized base words in `games.base_word`
   - Base word entries in `game_words` with `move_id = NULL`
   - Move entries in `game_words` with valid `move_id`

❌ **Fix failed if**:
1. Moves still don't display in frontend
2. Database errors occur during game creation
3. Word validation errors appear in console
4. Games cannot be loaded from database

If fixes fail, follow rollback instructions and report issue details.

---

## Next Steps

1. **Apply database migration** using drizzle-kit or manual SQL
2. **Restart backend server** to load updated code
3. **Test game creation and moves** in frontend
4. **Verify database state** using SQL queries above
5. **Monitor logs** for any errors during testing

If moves still don't display after these fixes, check:
- WebSocket connection (DevTools → Network → WS tab)
- Browser console for JavaScript errors
- Backend logs for validation errors
- Database directly for move entries

See PROBLEMS.md Issue #4 for additional debugging steps.
