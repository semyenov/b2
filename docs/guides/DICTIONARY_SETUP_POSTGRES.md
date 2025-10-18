# PostgreSQL Dictionary Setup Guide

## Overview

The Balda application now uses **PostgreSQL as the primary dictionary source** with an in-memory cache for fast lookups. This combines the benefits of persistent storage with fast synchronous access.

## Architecture

```
┌─────────────────────────────────────────┐
│  PostgreSQL (words table)                │
│  - Single source of truth                │
│  - Persistent storage                    │
│  - Supports multiple languages           │
└──────────────┬──────────────────────────┘
               │
               │ Load on startup
               ▼
┌─────────────────────────────────────────┐
│  CachedPostgresDictionary                │
│  - Loads words into in-memory Trie       │
│  - Fast O(k) lookups                     │
│  - Synchronous interface                 │
└──────────────┬──────────────────────────┘
               │
               │ Used by
               ▼
┌─────────────────────────────────────────┐
│  Game Engine (balda.ts, suggest.ts)     │
│  - Synchronous dictionary.has()         │
│  - Fast prefix matching                  │
└─────────────────────────────────────────┘
```

## Quick Start

### 1. Setup Database Schema

The `words` table should already exist from the initial migration:

```bash
# If not already done
bun run db:push
```

### 2. Import Dictionary

```bash
# Import Russian dictionary (default)
bun run dict:import

# Or specify custom path and language
bun run dict:import ./path/to/dictionary.txt ru

# Import English dictionary
bun run dict:import:en
```

**Dictionary File Format:**
- One word per line
- UTF-8 encoding
- Words are automatically normalized (trimmed, uppercased)
- Invalid words (with spaces, digits, etc.) are skipped

### 3. Verify Import

```bash
# Check database
bun run db:view

# Should show dictionary stats
# 📖 Dictionary:
# ------------------------------------------------------------
#   ru: 50000 words
```

### 4. Start Server

The server will automatically load the dictionary from PostgreSQL on startup:

```bash
bun run dev

# Console output:
# ◐ Loading ru dictionary from PostgreSQL...
# ✔ ✓ Loaded 50000 words into memory (ru)
```

## How It Works

### Loading Process

1. **Server starts** → `routes.ts:getDictionary()` is called
2. **CachedPostgresDictionary.create()** is invoked
3. **PostgreSQL query** fetches all words: `SELECT word FROM words WHERE language = 'ru'`
4. **Trie construction** inserts all words into in-memory Trie
5. **Dictionary ready** for synchronous lookups

### Fallback Strategy

The system has multiple fallback layers:

```typescript
1. PostgreSQL (primary)
   ↓ if fails
2. File-based dictionary (DICT_PATH env var)
   ↓ if fails
3. AllowAll mode (testing only)
```

### Performance

- **Load time**: ~1-2 seconds for 50,000 words
- **Memory usage**: ~10-20 MB for 50,000 words
- **Lookup time**: O(k) where k = word length (microseconds)
- **Prefix matching**: O(k) for prefix length

## Database Schema

```sql
CREATE TABLE words (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  word TEXT NOT NULL,
  language TEXT NOT NULL DEFAULT 'ru',
  created_at TIMESTAMP NOT NULL DEFAULT now(),

  -- Ensure unique words per language
  CONSTRAINT words_word_language_unique UNIQUE (word, language)
);

-- Indexes for fast lookups
CREATE INDEX words_word_idx ON words(word);
CREATE INDEX words_language_idx ON words(language);
CREATE INDEX words_word_language_idx ON words(word, language);
```

## Import Script Details

### `scripts/import-dictionary.ts`

**Features:**
- ✅ Batch insertion (500 words per batch) for performance
- ✅ Duplicate handling with `ON CONFLICT DO NOTHING`
- ✅ Progress tracking
- ✅ Validation (alphanumeric characters only)
- ✅ Normalization (trim, uppercase)

**Usage:**
```bash
# Basic import
bun run dict:import

# Custom path and language
bun run scripts/import-dictionary.ts ./my-dict.txt en

# Example output:
# ◐ Importing dictionary from ./data/dictionaries/russian.txt (language: ru)...
# ℹ Found 50000 valid words to import
# ℹ Progress: 50000/50000 words (100%)
#
# ╭─────────────────────────╮
# │ Import Summary:         │
# │                         │
# │ Total words: 50000      │
# │ ✅ Inserted: 50000      │
# │ ⏭️  Skipped: 0          │
# │ ❌ Errors: 0            │
# ╰─────────────────────────╯
```

## Advanced Usage

### Reload Dictionary at Runtime

```typescript
import { CachedPostgresDictionary } from './db/cachedDictionary'

// Create dictionary
const dict = await CachedPostgresDictionary.create('ru')

// Use dictionary
dict.has('СЛОВО') // true

// After updating words table, reload
await dict.reload()

// Check when last loaded
const loadedAt = dict.getLoadedAt() // Date object
```

### Multi-Language Support

```bash
# Import multiple languages
bun run scripts/import-dictionary.ts ./russian.txt ru
bun run scripts/import-dictionary.ts ./english.txt en
bun run scripts/import-dictionary.ts ./french.txt fr
```

Then in your code:
```typescript
const ruDict = await CachedPostgresDictionary.create('ru')
const enDict = await CachedPostgresDictionary.create('en')
const frDict = await CachedPostgresDictionary.create('fr')
```

### Custom Queries

Using `PostgresDictionary` directly for async queries:

```typescript
import { PostgresDictionary } from './db/dictionaryStore'

const dict = new PostgresDictionary('ru')

// Async word validation
await dict.has('СЛОВО') // Promise<boolean>

// Prefix checking
await dict.hasPrefix('СЛО') // Promise<boolean>

// Get random words
const words = await dict.getRandomWords(5, 10) // 10 words of length 5

// Get alphabet
const alphabet = await dict.getAlphabet()

// Get letter frequency
const frequency = await dict.getLetterFrequency()
```

## Troubleshooting

### Dictionary Not Loading

**Symptom**: Server falls back to AllowAll mode

**Check:**
1. Database is running: `bun run db:view`
2. Words table exists: `psql -c "\d words"`
3. Words are imported: `SELECT COUNT(*) FROM words`

**Solution**: Import dictionary
```bash
bun run dict:import
```

### Slow Startup

**Symptom**: Server takes 5+ seconds to start

**Cause**: Large dictionary (100k+ words)

**Solutions**:
1. Use smaller dictionary for development
2. Pre-load dictionary asynchronously
3. Consider lazy loading for specific routes

### Import Fails with Duplicates

**Symptom**: Import script reports errors

**Cause**: Words already exist in database

**Solution**: The script uses `ON CONFLICT DO NOTHING` - duplicates are automatically skipped. This is normal and safe.

### Memory Usage High

**Symptom**: Server uses 100+ MB RAM

**Cause**: Large dictionary loaded into memory

**Solutions**:
1. Expected behavior for large dictionaries
2. Trade-off: Memory for speed
3. Consider reducing dictionary size for development

## Comparison: PostgreSQL vs File-Based

| Feature | PostgreSQL (New) | File-Based (Old) |
|---------|------------------|------------------|
| Persistence | ✅ Database | ⚠️ File system |
| Multi-language | ✅ Easy | ❌ Multiple files |
| Query flexibility | ✅ SQL queries | ❌ In-memory only |
| Startup speed | ⚠️ Load + cache | ✅ Direct load |
| Runtime updates | ✅ Reload cache | ❌ Restart required |
| Lookup speed | ✅ Same (O(k)) | ✅ Same (O(k)) |
| Memory usage | ✅ Same | ✅ Same |

## API Reference

### CachedPostgresDictionary

**Static Methods:**
- `create(language: string): Promise<CachedPostgresDictionary>` - Create and load dictionary

**Instance Methods:**
- `has(word: string): boolean` - Check if word exists
- `hasPrefix(prefix: string): boolean` - Check if prefix exists
- `size(): number` - Get word count
- `getAlphabet(): string[]` - Get unique letters
- `getLetterFrequency(): Record<string, number>` - Get letter frequency
- `getRandomWords(length: number, count: number): string[]` - Get random words
- `reload(): Promise<void>` - Reload from PostgreSQL
- `getLoadedAt(): Date | null` - Get last load time

### PostgresDictionary

**Constructor:**
- `new PostgresDictionary(language: string)` - Create async dictionary

**Methods:** (all async)
- `has(word: string): Promise<boolean>`
- `hasPrefix(prefix: string): Promise<boolean>`
- `size(): Promise<number>`
- `getAlphabet(): Promise<string[]>`
- `getLetterFrequency(): Promise<Record<string, number>>`
- `getRandomWords(length, count): Promise<string[]>`
- `getAllWords(): Promise<string[]>` - Load all words (for caching)

## Migration from File-Based

If you're migrating from file-based dictionaries:

1. **Keep** your dictionary files (backup)
2. **Import** to PostgreSQL: `bun run dict:import`
3. **Remove** `DICT_PATH` from `.env` (optional - will fallback if PostgreSQL fails)
4. **Test** server startup
5. **Verify** dictionary works in games

The system will automatically use PostgreSQL with file-based fallback.

## Production Considerations

### Recommended Setup

1. **Import dictionary once** during deployment
2. **Verify word count** after import
3. **Monitor startup time** (should be <3 seconds)
4. **Set up health check** for dictionary availability
5. **Plan for dictionary updates** (periodic reload)

### Dictionary Updates

To update dictionary in production:

```bash
# 1. Import new words
bun run dict:import ./new-words.txt ru

# 2. Either restart server or implement reload endpoint
# Option A: Restart (simple)
pm2 restart balda

# Option B: Reload endpoint (no downtime)
# Add to routes.ts:
.post('/dictionary/reload', async () => {
  const dict = await getDictionary()
  if (dict instanceof CachedPostgresDictionary) {
    await dict.reload()
    return { success: true, loadedAt: dict.getLoadedAt() }
  }
  return { success: false }
})
```

---

**Created**: 2025-10-16
**Status**: ✅ Production Ready
**Next Steps**: Import your dictionary and start the server!
