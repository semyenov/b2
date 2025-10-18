# Balda Game - Codebase Issues Analysis

**Analysis Date**: October 16, 2025
**Analyzer**: Claude Code
**Status**: 10 issues identified across backend, frontend, and infrastructure

---

## Executive Summary

This document catalogs all identified issues in the Balda game codebase after comprehensive file-by-file analysis. The most critical issue is a **base word normalization bug** in the PostgreSQL storage layer that causes data corruption and is the likely root cause of the "frontend not showing moves" problem.

### Issue Breakdown by Priority

- 🔴 **CRITICAL**: 2 issues (fix immediately)
- 🟠 **HIGH**: 2 issues (fix this sprint)
- 🟡 **MODERATE**: 3 issues (fix next sprint)
- 🟢 **LOW**: 3 issues (technical debt)

---

## 🔴 CRITICAL Priority Issues

### Issue #1: Base Word Normalization Bug (DATA CORRUPTION)

**Location**: `src/server/db/gameStore.ts:406-427`

**Description**:
The `extractBaseWord()` function extracts the base word from the board's center row but returns it **without normalization**. This creates a critical mismatch because:

1. Game creation normalizes the base word: `usedWords: [normalizeWord(baseWord)]` (`balda.ts:411`)
2. Database extraction does NOT normalize: `return letters.join('')` (`gameStore.ts:427`)
3. Word validation expects normalized uppercase words

**Code Example**:
```typescript
// CURRENT (WRONG)
private extractBaseWord(board: (string | null)[][]): string {
  const letters: string[] = []
  for (const cell of row) {
    if (cell !== null) {
      letters.push(cell)
    }
  }
  return letters.join('')  // ❌ Returns "слово" instead of "СЛОВО"
}
```

**Impact**:
- 🔥 **Data Corruption**: Stored base words don't match game state expectations
- 🔥 **Word Validation Failures**: Players can reuse the base word because case mismatch prevents detection
- 🔥 **Move Display Issues**: Frontend may not show moves due to validation failures on reconstruction

**Fix**:
```typescript
// CORRECT
private extractBaseWord(board: (string | null)[][]): string {
  const letters: string[] = []
  for (const cell of row) {
    if (cell !== null) {
      letters.push(cell)
    }
  }
  return normalizeWord(letters.join(''))  // ✅ Returns "СЛОВО"
}
```

**Priority**: 🔴 CRITICAL - Fix immediately before any database operations

---

### Issue #2: Base Word Missing from game_words Table

**Location**: `src/server/db/gameStore.ts:148-164`

**Description**:
When creating a new game, the code inserts the game record and players, but **never inserts the base word** into the `game_words` table. This violates the normalized schema design where ALL used words should be in `game_words`.

**Current Behavior**:
```typescript
// In set() method for new game creation:
await tx.insert(games).values({ ... })
await this.createPlayersForGame(tx, game)
await this.syncMovesForGame(tx, game)
// ❌ Base word is NEVER inserted into game_words!
```

**Impact**:
- 📊 **Data Model Inconsistency**: `game_words` table is incomplete
- 🔧 **Manual Reconstruction Required**: Line 291 manually adds base word: `const usedWords = [game.baseWord, ...words.map(w => w.word)]`
- 📈 **Query Inefficiency**: Cannot use `game_words` table alone to get all used words

**Fix**:
```typescript
// In set() method after game insertion:
await tx.insert(gameWords).values({
  gameId: game.id,
  word: game.baseWord,
  moveId: null, // Base word has no associated move
})
```

**Alternative**: Store base word with a sentinel moveId or create separate `game_base_words` table

**Priority**: 🔴 CRITICAL - Fix before production deployment

---

## 🟠 HIGH Priority Issues

### Issue #3: Incomplete PostgreSQL Migration

**Locations**:
- `src/server/db/gameStore.ts` (entire file)
- `src/server/store.ts:89-100`
- `src/server/db/schema.ts`

**Description**:
The PostgreSQL storage implementation is incomplete and lacks several critical features:

**Missing Features**:
1. **Migration Path**: No way to migrate from file storage to PostgreSQL
2. **Transaction Rollback**: Errors are caught but transactions may not rollback properly
3. **Optimistic Locking**: No handling of concurrent updates
4. **Bulk Operations**: No batch insert/update optimizations
5. **Query Optimization**: Missing composite indexes for common queries
6. **Connection Pooling Tuning**: Default pool settings not production-ready

**Example Problem** (`gameStore.ts:116-170`):
```typescript
await db.transaction(async (tx) => {
  // Complex multi-table operations
  // ❌ No rollback handling
  // ❌ No optimistic locking
  // ❌ Silent failure possible
})
```

**Impact**:
- 🔥 **Data Loss Risk**: Failed transactions may leave inconsistent state
- ⚡ **Performance Issues**: Unoptimized queries slow down game operations
- 🚫 **Race Conditions**: Concurrent move submissions may corrupt game state
- 📦 **Migration Blocked**: Cannot migrate existing games from file storage

**Fix Recommendations**:
1. Add explicit error handling in transactions
2. Implement optimistic locking using version numbers
3. Create composite indexes: `(game_id, move_number)`, `(game_id, player_index)`
4. Build migration script: `scripts/migrate-file-to-postgres.ts`
5. Add connection pool monitoring

**Priority**: 🟠 HIGH - Complete before scaling beyond development

---

### Issue #4: Frontend Moves Not Showing - Root Cause Analysis

**Locations**:
- `src/server/db/gameStore.ts:261-274` (reconstruction)
- `src/web/hooks/usePlayerStats.ts:49-51` (filtering)
- `src/web/components/game/Sidebar.tsx:132-174` (rendering)

**Description**:
The frontend is not displaying player moves in the sidebar. After analyzing the entire data flow, the code logic appears **CORRECT**, which suggests the issue is environmental or data-related.

**Data Flow Analysis**:
```
1. Move submitted → POST /games/:id/move → applyMove() ✅
2. Game saved → store.set(game) → PostgreSQL ✅
3. WebSocket broadcast → broadcastGame() ✅
4. Frontend receives → onMessage(updatedGame) ✅
5. State updated → setCurrentGame(updatedGame) ✅
6. Hook filters moves → playerWords = game.moves.filter(...) ✅
7. Component renders → {playerWords.map(...)} ✅
```

**Possible Root Causes** (in order of likelihood):

1. **Issue #1 (Normalization Bug)** - Most likely!
   - Moves fail validation due to base word case mismatch
   - Moves never saved to database
   - Empty moves array returned

2. **Player Name Mismatch**
   - Move stored with different player name than expected
   - Filter returns empty array: `move.playerId === player`
   - Check: `game.players` vs `move.playerId` values

3. **WebSocket Connection Failure**
   - Client not receiving broadcast messages
   - Frontend state not updating
   - Check: WebSocket connection status in DevTools

4. **Empty Database**
   - No moves actually saved yet
   - Test: Make a move and check database directly

**Debugging Steps**:
```bash
# 1. Check database for moves
psql -U balda -d balda -c "SELECT * FROM moves;"

# 2. Check WebSocket connection
# Open DevTools → Network → WS tab

# 3. Log game state in frontend
console.log('Current game:', currentGame)
console.log('Player moves:', playerWords)

# 4. Test with file storage (bypass PostgreSQL)
# In .env: comment out DATABASE_URL
```

**Priority**: 🟠 HIGH - Fix Issue #1 first, then debug further if needed

---

## 🟡 MODERATE Priority Issues

### Issue #5: Environment Config Not Used in ApiClient

**Location**: `src/web/lib/client.ts:25`

**Description**:
The `ApiClient` class uses a hardcoded `/api` base URL instead of the centralized `env.apiBaseUrl` configuration from `src/web/config/env.ts`.

**Current Code**:
```typescript
export class ApiClient {
  constructor(private baseUrl: string = '/api') { }  // ❌ Hardcoded
}
```

**Why It Works Now**:
- Development: Vite proxy rewrites `/api/*` → `http://localhost:3000/*`
- The hardcoded value happens to work with the proxy

**Why It's Fragile**:
- Won't work in different deployment scenarios
- Production builds need manual configuration
- Violates centralized config pattern

**Impact**:
- 🔧 **Technical Debt**: Hardcoded values scattered across codebase
- 🚀 **Deployment Issues**: Requires manual changes for different environments
- 📝 **Inconsistent Patterns**: Other parts of code use `env` properly

**Fix**:
```typescript
import { env } from '@config/env'

export class ApiClient {
  constructor(private baseUrl: string = env.apiBaseUrl) { }  // ✅ Uses config
}
```

**Note**: Verify Vite proxy behavior still works after this change. The proxy config expects `/api` prefix.

**Priority**: 🟡 MODERATE - Fix when refactoring deployment setup

---

### Issue #6: Vite Proxy Only Works in Development

**Location**: `vite.config.ts:29-36`

**Description**:
The Vite proxy configuration that rewrites `/api/*` requests is **only active in development mode** (`bun run dev:web`). Production builds don't include this proxy.

**Current Config**:
```typescript
server: {
  port: 5173,
  proxy: {
    '/api': {
      target: 'http://localhost:3000',
      changeOrigin: true,
      secure: false,
      rewrite: path => path.replace(/^\/api/, ''),  // Only in dev mode!
    },
  },
},
```

**Impact**:
- 🚀 **Production Deployment Undefined**: No guidance on how to handle API routing
- 🌐 **CORS Configuration Required**: Production needs proper CORS or reverse proxy
- 📝 **Documentation Missing**: No deployment guide for production

**Production Solutions**:
1. **Reverse Proxy (Recommended)**:
   ```nginx
   # Nginx config
   location /api/ {
     proxy_pass http://localhost:3000/;
     proxy_set_header Host $host;
   }
   ```

2. **Update ApiClient Base URL**:
   ```typescript
   const baseUrl = env.isProduction
     ? 'https://api.balda.example.com'  // Full URL
     : '/api'  // Proxy path
   ```

3. **Environment Variable**:
   ```bash
   VITE_API_URL=https://api.balda.example.com
   ```

**Priority**: 🟡 MODERATE - Document before first production deployment

---

### Issue #7: Missing Error Handling in Database Operations

**Location**: Throughout `src/server/db/gameStore.ts`

**Description**:
Database operations use transactions but don't properly handle errors or ensure rollbacks.

**Problem Examples**:

1. **Silent Failures** (`gameStore.ts:166-170`):
```typescript
catch (error) {
  consola.error(`Failed to save game ${game.id}:`, error)
  throw error  // ❌ No cleanup, no retry, just re-throw
}
```

2. **No Rollback Verification** (`gameStore.ts:116`):
```typescript
await db.transaction(async (tx) => {
  // ❌ If any operation fails, what happens to partial changes?
  await tx.update(games)...
  await this.syncMovesForGame(tx, game)
})
```

3. **Missing Constraint Handling**:
```typescript
// No handling for:
// - Unique constraint violations
// - Foreign key violations
// - Deadlock detection
// - Connection timeouts
```

**Impact**:
- 🔥 **Data Corruption Risk**: Partial updates may persist
- 🐛 **Debugging Difficulty**: Generic errors don't indicate root cause
- 🔁 **No Retry Logic**: Transient failures become permanent
- 📊 **No Monitoring**: Can't track error rates

**Fix Recommendations**:
```typescript
try {
  await db.transaction(async (tx) => {
    // Operations here
  })
} catch (error) {
  if (error.code === '23505') {  // Unique violation
    throw new DuplicateGameError(...)
  } else if (error.code === '40P01') {  // Deadlock
    // Retry logic
  } else {
    logger.error('Database operation failed', {
      gameId,
      operation: 'save',
      error
    })
    throw new DatabaseError('Failed to save game', error)
  }
}
```

**Priority**: 🟡 MODERATE - Add before production use

---

## 🟢 LOW Priority Issues

### Issue #8: Documentation Mismatch with Actual Code Structure

**Location**: `CLAUDE.md:109-114`

**Description**:
The `CLAUDE.md` documentation references component paths that don't exist:

**Documented** (WRONG):
```markdown
#### Components (`src/web/components/`) - 9 Active Files
- `App.tsx` - Main application
- `Board.tsx` - Game board display
- `GamePanel.tsx` - Main game interface
- `PlayerPanel.tsx` - Player info sidebar
```

**Actual Structure** (CORRECT):
```
src/web/components/
├── ErrorBoundary.tsx
├── forms/
│   ├── CreateGame.tsx
│   └── GameList.tsx
├── game/
│   ├── AlphabetPanel.tsx
│   ├── Board.tsx
│   ├── ControlButtons.tsx
│   ├── GamePanel.tsx
│   ├── Sidebar.tsx
│   └── SuggestionCard.tsx
├── screens/
│   ├── GameScreen.tsx
│   └── MenuScreen.tsx
└── ui/
    ├── Badge.tsx
    ├── Banner.tsx
    ├── Button.tsx
    ├── Card.tsx
    ├── Input.tsx
    ├── Spinner.tsx
    └── StatusMessage.tsx
```

**Impact**:
- 📚 **Misleading Documentation**: Developers waste time looking for non-existent files
- 🗺️ **Navigation Difficulty**: Can't quickly locate components
- ⚠️ **Trust Issues**: Other documentation may also be incorrect

**Fix**: Update `CLAUDE.md` lines 109-131 with correct component structure

**Priority**: 🟢 LOW - Update during next documentation review

---

### Issue #9: Dictionary Loading Race Condition

**Location**: `src/server/routes.ts:36-74`

**Description**:
The dictionary loading mechanism uses a simple boolean lock with `setTimeout` retry, which is not a proper async lock.

**Current Implementation**:
```typescript
let dictionaryPromise: Promise<SizedDictionary> | null = null
let dictionaryLoadingLock = false

async function getDictionary(): Promise<SizedDictionary> {
  if (dictionaryPromise) {
    return dictionaryPromise
  }

  if (dictionaryLoadingLock) {
    await new Promise(resolve => setTimeout(resolve, 10))  // ❌ Polling
    return getDictionary()  // ❌ Recursive retry
  }

  dictionaryLoadingLock = true
  // Load dictionary...
}
```

**Problems**:
- 🔄 **Polling**: Uses `setTimeout` instead of proper async waiting
- 🔁 **Recursion**: Could cause stack overflow with many concurrent requests
- ⏱️ **Race Window**: Lock check and set are not atomic
- 🐛 **Lock Not Released on Error**: Missing finally block

**Impact**:
- ⚡ **Performance**: Multiple concurrent loads possible in race window
- 💾 **Memory**: Dictionary loaded multiple times unnecessarily
- 🐛 **Server Startup Issues**: First requests may trigger multiple loads

**Fix** (use proper promise queue):
```typescript
import { AsyncLock } from 'async-lock'

const dictionaryLock = new AsyncLock()
let dictionaryPromise: Promise<SizedDictionary> | null = null

async function getDictionary(): Promise<SizedDictionary> {
  if (dictionaryPromise) {
    return dictionaryPromise
  }

  return dictionaryLock.acquire('dictionary', async () => {
    if (dictionaryPromise) {
      return dictionaryPromise
    }

    dictionaryPromise = loadDictionary()
    return dictionaryPromise
  })
}
```

**Priority**: 🟢 LOW - Works in practice, fix during refactor

---

### Issue #10: Type Safety Issues with Elysia JWT Plugin

**Locations**:
- `src/server/routes/auth.ts:41-42, 94, 144`
- `src/server/routes.ts:299`

**Description**:
Multiple locations use `any` type casts when working with the Elysia JWT plugin due to type system limitations.

**Examples**:
```typescript
// routes/auth.ts:41-42
const token = await generateAccessToken({ jwt: jwt as any }, user)
const refreshToken = await generateRefreshToken({ refreshJwt: refreshJwt as any }, user.id)

// routes.ts:299
// @ts-ignore - Elysia type system complexities with JWT plugins cause type inference issues
```

**Root Cause**:
Elysia's plugin type system doesn't properly infer JWT plugin types when chaining multiple plugins.

**Impact**:
- 🛡️ **Reduced Type Safety**: `any` bypasses compile-time checks
- 🐛 **Potential Runtime Errors**: Type mismatches not caught
- 🔧 **Maintenance Burden**: Requires comments and developer awareness

**Fix Options**:
1. **Wait for Elysia Update**: Type system improvements in future versions
2. **Create Wrapper Types**:
   ```typescript
   interface JWTContext {
     jwt: {
       sign: (payload: any) => Promise<string>
       verify: (token: string) => Promise<any>
     }
   }
   ```
3. **Use Branded Types**: TypeScript branded types for compile-time safety

**Priority**: 🟢 LOW - Works correctly at runtime, cosmetic issue

---

## Summary and Recommendations

### Immediate Action Required (This Week)

1. ✅ **Fix Issue #1**: Add normalization to `extractBaseWord()`
2. ✅ **Fix Issue #2**: Insert base word into `game_words` table
3. 🔍 **Debug Issue #4**: Test if moves display issue is resolved

### Short-term (This Sprint)

4. 🔄 **Address Issue #3**: Complete PostgreSQL implementation
   - Add transaction rollback
   - Create migration script
   - Add monitoring

### Medium-term (Next Sprint)

5. 📝 **Document Issue #6**: Create production deployment guide
6. 🔧 **Fix Issue #5**: Use centralized environment config
7. 🛡️ **Fix Issue #7**: Add proper error handling

### Long-term (Technical Debt)

8. 📚 **Update Issue #8**: Fix documentation
9. 🔒 **Fix Issue #9**: Replace lock with proper async queue
10. 🎯 **Consider Issue #10**: Evaluate Elysia type system updates

---

## Testing Recommendations

After fixing Issues #1 and #2, run these tests:

```bash
# 1. Test base word normalization
bun test src/server/db/gameStore.test.ts

# 2. Test move creation and display
bun run dev  # Start backend
bun run dev:web  # Start frontend
# Create game, make moves, verify display

# 3. Check database directly
psql -U balda -d balda
SELECT * FROM games;
SELECT * FROM game_words;
SELECT * FROM moves;

# 4. Test WebSocket
# Open DevTools → Network → WS tab
# Verify messages received after moves
```

---

## Conclusion

The codebase has 10 identifiable issues with varying severity. The most critical issue (#1) is likely the root cause of the moves display problem. Fixing Issues #1 and #2 immediately is recommended before continuing development.

**Estimated Fix Time**:
- Critical issues (1-2): 2-4 hours
- High priority (3-4): 8-16 hours
- Moderate priority (5-7): 8-12 hours
- Low priority (8-10): 4-6 hours

**Total**: ~22-38 hours of development time
