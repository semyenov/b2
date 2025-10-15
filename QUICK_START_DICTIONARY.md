# Quick Start: PostgreSQL Dictionary

## ✅ Current Status

**Database:**
- ✅ 50,910 Russian words imported
- ✅ Normalized schema active
- ✅ Ready for use

**Next Server Start:**
```bash
bun run dev

# Expected output:
# ◐ Loading ru dictionary from PostgreSQL...
# ✔ ✓ Loaded 50910 words into memory (ru)
```

## Common Commands

### View Database
```bash
bun run db:view

# Shows:
# 📖 Dictionary: ru: 50910 words
# Sample words: ДЕБОШИРКА, СПАРИВАНИЕ, РЫБЧОНКА...
```

### Reimport Dictionary
```bash
# If you need to update/reimport
bun run dict:import

# Custom dictionary
bun run dict:import ./path/to/words.txt ru
```

### Database Management
```bash
bun run db:reset    # Drop and recreate database
bun run db:push     # Apply schema changes
bun run db:studio   # Open Drizzle Studio (web UI)
```

## How It Works

1. **Server starts** → Loads dictionary from PostgreSQL
2. **Builds Trie** → 50,910 words cached in memory (~15 MB)
3. **Ready** → Synchronous O(k) lookups for game validation
4. **No overhead** → Zero async/await in game logic

## Architecture

```
┌─────────────────────────┐
│ PostgreSQL              │
│ 50,910 words            │ ← Persistent storage
└──────────┬──────────────┘
           │ Load on startup (~2 seconds)
           ▼
┌─────────────────────────┐
│ In-Memory Trie          │
│ Fast O(k) lookups       │ ← Synchronous access
└──────────┬──────────────┘
           │ Used by
           ▼
┌─────────────────────────┐
│ Game Engine             │
│ dictionary.has('СЛОВО') │ ← Instant validation
└─────────────────────────┘
```

## Verification

After server restart, test the dictionary:

```bash
# 1. Start server
bun run dev

# 2. Check dictionary endpoint
curl http://localhost:3000/dictionary

# Expected response:
# {
#   "loaded": true,
#   "source": "database",
#   "size": 50910
# }

# 3. Test random word generation
curl http://localhost:3000/dictionary/random?length=5&count=5

# Expected response:
# {
#   "words": ["СЛОВО", "ГРАФ", "БАРОН", "ФЕРМА", "ПЕРШ"]
# }
```

## Troubleshooting

### Dictionary loads 0 words
**Solution:** Run `bun run dict:import`

### Server slow to start
**Expected:** 1-2 seconds for 50K words. If >5 seconds, check database connection.

### Words not validating in game
1. Check server console for "Loaded X words"
2. Verify with `bun run db:view`
3. Test with `curl http://localhost:3000/dictionary`

## Files Overview

```
src/server/db/
├── cachedDictionary.ts    # Hybrid PostgreSQL + Trie
├── dictionaryStore.ts     # Direct PostgreSQL access
└── schema.ts              # Words table definition

scripts/
└── import-dictionary.ts   # Batch import from file

data/dictionaries/
└── russian.txt           # 50,910 words (986 KB)
```

## Performance

- **Load time:** ~2 seconds for 50K words
- **Memory usage:** ~15 MB for 50K words
- **Lookup time:** ~1 microsecond (O(k) where k = word length)
- **Prefix matching:** ~1 microsecond (O(k))

---

**Status:** ✅ Ready to use
**Words:** 50,910 Russian words
**Source:** PostgreSQL + in-memory cache
