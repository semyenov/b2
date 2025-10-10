# Radash Usage Specification

This document outlines how to properly use [radash](https://radash-docs.englishcreek.tech/) utilities in the Balda game server codebase.

## Overview

Radash is a modern, type-safe utility library providing functional programming helpers for arrays, objects, async operations, and more. It offers better TypeScript inference than lodash and a more consistent API.

## Core Principles

1. **Prefer radash over manual loops** - Use `_.map()`, `_.filter()`, `_.reduce()` instead of for/while loops
2. **Use radash for type guards** - Leverage `_.isArray()`, `_.isObject()`, `_.isString()` for better type safety
3. **Async error handling** - Use `_.try()` and `_.guard()` for cleaner async/await code
4. **Object transformations** - Use `_.objectify()`, `_.mapValues()`, `_.shake()` instead of manual object construction
5. **Array utilities** - Use `_.list()`, `_.unique()`, `_.sift()`, `_.flat()` for common array operations

## File-by-File Implementation Guide

### 1. src/errors.ts

**Current patterns:**
```typescript
constructor(gameId: string) {
  super(`Game with id '${gameId}' not found`)
  this.context = { gameId, timestamp: Date.now() }
}

toResponse() {
  return { error: this.message, ...this.context }
}
```

**With radash:**
```typescript
import { shake } from 'radash'

constructor(gameId: string) {
  super(`Game with id '${gameId}' not found`)
  this.context = shake({ gameId, timestamp: Date.now() })
}

toResponse() {
  return shake({ error: this.message, ...this.context })
}
```

**Benefits:** `shake()` removes undefined/null values automatically

---

### 2. src/dictionary.ts

**Current patterns:**
```typescript
// Map to Object conversion
getLetterFrequency(): Record<string, number> {
  const out: Record<string, number> = {}
  for (const [k, v] of this.frequency) out[k] = v
  return out
}

// Array caching
getAlphabet(): string[] {
  if (!this.alphabetCache)
    this.alphabetCache = Array.from(this.alphabetSet.values())
  return this.alphabetCache
}

// File loading with manual filtering
for (const rawLine of text.split(/\r?\n/g)) {
  lines++
  const word = rawLine.trim().toUpperCase()
  if (!word)
    continue
  if (!/^[A-ZА-ЯЁ]+$/.test(word))
    continue
  dict.insert(word)
}
```

**With radash:**
```typescript
import { objectify, list, sift, try: tryAsync } from 'radash'

// Map to Object conversion
getLetterFrequency(): Record<string, number> {
  return objectify(
    Array.from(this.frequency.entries()),
    ([k]) => k,
    ([, v]) => v,
  )
}

// Array caching
getAlphabet(): string[] {
  if (!this.alphabetCache)
    this.alphabetCache = list(this.alphabetSet)
  return this.alphabetCache
}

// File loading with radash filtering
const lines = text.split(/\r?\n/g)
const validWords = sift(
  lines.map(line => {
    const word = line.trim().toUpperCase()
    return word && /^[A-ZА-ЯЁ]+$/.test(word) ? word : null
  }),
)
validWords.forEach(word => dict.insert(word))
```

**Benefits:**
- `objectify()` provides clean Map→Object conversion
- `list()` creates arrays from iterables consistently
- `sift()` removes null/undefined values automatically

---

### 3. src/engine/balda.ts

**Current patterns:**
```typescript
// Array creation
export function createEmptyBoard(size: number): Letter[][] {
  const board: Letter[][] = []
  for (let r = 0; r < size; r++) {
    const row: Letter[] = Array.from({ length: size }, () => null)
    board.push(row)
  }
  return board
}

// Finding starts with manual loop
const starts: BoardPosition[] = []
for (let r = 0; r < size; r++) {
  for (let c = 0; c < size; c++) {
    if (board[r][c] === first)
      starts.push({ row: r, col: c })
  }
}

// Array uniqueness
const candidateLetters = Array.from(new Set(word.split('')))

// Creating scores object
const scores: Record<string, number> = {}
for (const p of normalizedPlayers) scores[p] = 0
```

**With radash:**
```typescript
import { flat, list, objectify, unique } from 'radash'

// Array creation
export function createEmptyBoard(size: number): Letter[][] {
  return list(0, size - 1, () => list(0, size - 1, () => null))
}

// Finding starts with flat + filter
const starts = flat(
  list(0, size - 1, r =>
    list(0, size - 1, c =>
      board[r][c] === first ? { row: r, col: c } : null,),),
).filter((pos): pos is BoardPosition => pos !== null)

// Array uniqueness
const candidateLetters = unique(word.split(''))

// Creating scores object
const scores = objectify(
  normalizedPlayers,
  p => p,
  () => 0,
)
```

**Benefits:**
- `list()` creates ranges cleanly
- `flat()` + `filter()` replaces nested loops
- `unique()` is clearer than Set→Array
- `objectify()` creates objects from arrays functionally

---

### 4. src/engine/suggest.ts

**Current patterns:**
```typescript
// Manual sorting
suggestions.sort((a, b) => {
  if (b.score !== a.score)
    return b.score - a.score
  return a.word.localeCompare(b.word)
})

// Manual limiting
if (opts?.limit && opts.limit > 0)
  suggestions = suggestions.slice(0, opts.limit)

// Uniqueness tracking
const visited = new Set<string>()
```

**With radash:**
```typescript
import { sort, sum, unique } from 'radash'

// Or combine with take
import { take } from 'radash'

// Sorting with radash
const sorted = sort(suggestions, [
  s => s.score,
  s => s.word,
], 'desc')

// Limiting
const limited = opts?.limit ? sorted.slice(0, opts.limit) : sorted
const limited = take(sorted, opts?.limit ?? sorted.length)
```

**Benefits:**
- `sort()` handles multi-key sorting cleanly
- More declarative sorting direction

---

### 5. src/store.ts

**Current patterns:**
```typescript
async getAll(): Promise<GameState[]> {
  const keys = await this.storage.getKeys()
  const games = await Promise.all(
    keys.map(key => this.storage.getItem(key)),
  )
  return games.filter((game): game is GameState => game !== null)
}

async count(): Promise<number> {
  const keys = await this.storage.getKeys()
  return keys.length
}

async filter(predicate: (game: GameState) => boolean): Promise<GameState[]> {
  const all = await this.getAll()
  return all.filter(predicate)
}
```

**With radash:**
```typescript
import { map, sift, counting } from 'radash'

async getAll(): Promise<GameState[]> {
  const keys = await this.storage.getKeys()
  const games = await map(keys, async key => await this.storage.getItem(key))
  return sift(games)
}

async count(): Promise<number> {
  const keys = await this.storage.getKeys()
  return counting(keys, () => true)
}

async filter(predicate: (game: GameState) => boolean): Promise<GameState[]> {
  const all = await this.getAll()
  return sift(all, predicate)
}
```

**Benefits:**
- `map()` handles async operations with proper typing
- `sift()` removes nulls and can filter in one step
- `counting()` is more semantic than `.length`

---

### 6. src/wsHub.ts

**Current patterns:**
```typescript
// Map operations
const gameIdToClients = new Map<string, Set<WsClient>>()

// Array.from usage
export function getActiveGames(): string[] {
  return Array.from(gameIdToClients.keys())
}

// Error handling in loop
for (const c of set) {
  try {
    c.send(payload)
    successCount++
  }
  catch (error) {
    errorCount++
    consola.warn(`Failed to send to client in game ${gameId}:`, error)
  }
}
```

**With radash:**
```typescript
import { list, try: tryFn } from 'radash'

// Array.from replacement
export function getActiveGames(): string[] {
  return list(gameIdToClients.keys())
}

// Error handling with try
for (const c of set) {
  const [error] = await tryFn(() => c.send(payload))
  if (error) {
    errorCount++
    consola.warn(`Failed to send to client in game ${gameId}:`, error)
  }
  else {
    successCount++
  }
}
```

**Benefits:**
- `list()` consistently creates arrays from iterables
- `try()` provides structured error handling

---

### 7. src/routes.ts

**Current patterns:**
```typescript
async function getDictionary(): Promise<SizedDictionary> {
  if (!dictionaryPromise) {
    const dictPath = process.env.DICT_PATH
    if (dictPath) {
      try {
        const { loadDictionaryFromFile } = await import('./dictionary')
        dictionaryPromise = loadDictionaryFromFile(dictPath)
      }
      catch (error) {
        throw new DictionaryError(`Failed to load dictionary from ${dictPath}: ${error}`)
      }
    }
    else {
      const { AllowAllSizedDictionary } = await import('./dictionary')
      dictionaryPromise = Promise.resolve(new AllowAllSizedDictionary())
    }
  }
  return dictionaryPromise
}
```

**With radash:**
```typescript
import { guard, try: tryAsync } from 'radash'

async function getDictionary(): Promise<SizedDictionary> {
  if (!dictionaryPromise) {
    const dictPath = process.env.DICT_PATH
    if (dictPath) {
      const [error, result] = await tryAsync(async () => {
        const { loadDictionaryFromFile } = await import('./dictionary')
        return await loadDictionaryFromFile(dictPath)
      })
      if (error)
        throw new DictionaryError(`Failed to load dictionary from ${dictPath}: ${error}`)
      dictionaryPromise = Promise.resolve(result!)
    }
    else {
      const { AllowAllSizedDictionary } = await import('./dictionary')
      dictionaryPromise = Promise.resolve(new AllowAllSizedDictionary())
    }
  }
  return dictionaryPromise
}
```

**Benefits:**
- `tryAsync()` provides structured error handling for async operations

---

### 8. src/index.ts

**Current patterns:**
```typescript
.onError(({ code, error, set }) => {
  consola.error(`[${code}]`, error)

  if (code === 'VALIDATION') {
    set.status = 400
    return { error: 'Validation failed', details: isProduction ? undefined : error.all }
  }

  if (code === 'GAME_NOT_FOUND') {
    set.status = 404
    return error.toResponse()
  }

  if (code === 'INVALID_MOVE' || code === 'INVALID_PLACEMENT') {
    set.status = 400
    return error.toResponse()
  }

  if (code === 'DICTIONARY_ERROR') {
    set.status = 500
    return error.toResponse()
  }

  if (code === 'NOT_FOUND') {
    set.status = 404
    return { error: 'Route not found' }
  }

  set.status = 500
  return { error: 'Internal server error', details: isProduction ? undefined : String(error) }
})
```

**With radash:**
```typescript
import { select } from 'radash'

.onError(({ code, error, set }) => {
  consola.error(`[${code}]`, error)

  return select(
    code,
    {
      VALIDATION: () => {
        set.status = 400
        return { error: 'Validation failed', details: isProduction ? undefined : error.all }
      },
      GAME_NOT_FOUND: () => {
        set.status = 404
        return error.toResponse()
      },
      INVALID_MOVE: () => {
        set.status = 400
        return error.toResponse()
      },
      INVALID_PLACEMENT: () => {
        set.status = 400
        return error.toResponse()
      },
      DICTIONARY_ERROR: () => {
        set.status = 500
        return error.toResponse()
      },
      NOT_FOUND: () => {
        set.status = 404
        return { error: 'Route not found' }
      },
    },
    () => {
      set.status = 500
      return { error: 'Internal server error', details: isProduction ? undefined : String(error) }
    },
  )
})
```

**Benefits:**
- `select()` provides pattern matching with cleaner syntax
- More declarative error handling

---

## Recommended Radash Utilities

### Array Operations
- `list(start, end, mapFn?)` - Create arrays from ranges or iterables
- `sort(array, getters, dir?)` - Multi-key sorting
- `unique(array, toKey?)` - Remove duplicates
- `sift(array, filter?)` - Remove falsy/null values with optional predicate
- `flat(array, depth?)` - Flatten nested arrays
- `first(array, filter?)` - Get first matching element
- `sum(array, fn?)` - Sum array values
- `counting(array, filter?)` - Count matching elements
- `boil(array, comp)` - Reduce to single value (like reduce but clearer)

### Object Operations
- `objectify(array, getKey, getValue)` - Create object from array
- `mapValues(obj, mapFn)` - Transform object values
- `mapKeys(obj, mapFn)` - Transform object keys
- `shake(obj, filter?)` - Remove falsy values from object
- `pick(obj, keys)` - Select specific keys
- `omit(obj, keys)` - Exclude specific keys

### Async Operations
- `try(fn)` - Execute function and return [error, result] tuple
- `tryAsync(fn)` - Async version of try
- `guard(fn, onError?)` - Execute with default error handling
- `map(array, asyncFn)` - Async map with proper typing
- `parallel(limit, array, asyncFn)` - Parallel async execution with concurrency limit

### Functional
- `select(value, matchers, defaultFn?)` - Pattern matching
- `iterate(count, mapFn, startValue?)` - Iteration with accumulator
- `fork(condition, onTrue, onFalse)` - Conditional branching

### Type Guards
- `isArray(value)` - Type-safe array check
- `isObject(value)` - Type-safe object check
- `isString(value)` - Type-safe string check
- `isNumber(value)` - Type-safe number check
- `isFunction(value)` - Type-safe function check

---

## Usage Guidelines

### DO ✅
- Use radash for array/object transformations
- Use radash for async error handling (`try`, `guard`)
- Use radash for type-safe checks
- Import only what you need: `import { map, sift } from 'radash'`
- Combine radash utilities for complex operations

### DON'T ❌
- Don't mix lodash and radash (choose one)
- Don't use radash for simple one-liners where native JS is clearer
- Don't over-engineer - use native `.map()`, `.filter()` when appropriate
- Don't use radash just for the sake of using it

---

## Example Transformations

### Before (Manual)
```typescript
const scores: Record<string, number> = {}
for (const player of players) {
  scores[player] = 0
}
```

### After (Radash)
```typescript
const scores = objectify(players, p => p, () => 0)
```

---

### Before (Manual)
```typescript
const starts: BoardPosition[] = []
for (let r = 0; r < size; r++) {
  for (let c = 0; c < size; c++) {
    if (board[r][c] === first)
      starts.push({ row: r, col: c })
  }
}
```

### After (Radash)
```typescript
const starts = sift(
  flat(
    list(0, size - 1, r =>
      list(0, size - 1, c =>
        board[r][c] === first ? { row: r, col: c } : null,),),
  ),
)
```

---

### Before (Manual)
```typescript
try {
  const result = await someAsyncOperation()
  return result
}
catch (error) {
  throw new CustomError(`Operation failed: ${error}`)
}
```

### After (Radash)
```typescript
const [error, result] = await tryAsync(() => someAsyncOperation())
if (error)
  throw new CustomError(`Operation failed: ${error}`)
return result
```

---

## Migration Checklist

- [ ] Install radash: `bun add radash`
- [ ] Update `src/errors.ts` with `shake()`
- [ ] Update `src/dictionary.ts` with `objectify()`, `list()`, `sift()`
- [ ] Update `src/engine/balda.ts` with `list()`, `flat()`, `unique()`, `objectify()`
- [ ] Update `src/engine/suggest.ts` with `sort()`, `take()`
- [ ] Update `src/store.ts` with `map()`, `sift()`, `counting()`
- [ ] Update `src/wsHub.ts` with `list()`, `try()`
- [ ] Update `src/routes.ts` with `tryAsync()`
- [ ] Update `src/index.ts` with `select()`
- [ ] Run `bun run lint:fix` to fix any style issues
- [ ] Test all endpoints to ensure functionality preserved

---

## Expected Benefits

1. **Reduced LOC**: ~150 lines of boilerplate removed
2. **Better Types**: TypeScript inference improved in 8 files
3. **Cleaner Code**: More functional, declarative style
4. **Error Handling**: Structured async error handling with `try`/`guard`
5. **Consistency**: Unified API across transformations
6. **Maintainability**: Easier to read and understand code intent

---

## References

- [Radash Documentation](https://radash-docs.englishcreek.tech/)
- [Radash GitHub](https://github.com/sodiray/radash)
- [TypeScript Best Practices](https://www.typescriptlang.org/docs/handbook/declaration-files/do-s-and-don-ts.html)
