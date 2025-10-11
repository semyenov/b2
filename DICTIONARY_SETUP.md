# Russian Dictionary Setup

## 📖 Overview

A comprehensive Russian word dictionary has been configured for the Balda game with **50,910 words**.

## 📁 Files Created

### 1. Dictionary File
- **Location:** `./data/dictionaries/russian.txt`
- **Size:** 964 KB
- **Words:** 50,910 Russian nouns
- **Encoding:** UTF-8
- **Format:** One word per line (lowercase)

### 2. Environment Configuration
- **File:** `.env` (in project root)
- **Configuration:**
  ```bash
  DICT_PATH=./data/dictionaries/russian.txt
  PORT=3000
  STORAGE_DIR=./data/games
  NODE_ENV=development
  ```

## ✅ Verified Words

The dictionary includes common Russian words used in Balda:
- ✅ СТОЛ (table)
- ✅ ФАЛДА (fold)
- ✅ БАЛДА (game name itself)
- ✅ АБАЖУР (lampshade)
- ✅ Many more...

## 🎮 How It Works

1. **Case-Insensitive:** The dictionary loader converts all input to uppercase, so "стол", "СТОЛ", and "Стол" all match
2. **Trie Structure:** Uses an efficient Trie data structure for fast prefix and word lookups
3. **Auto-Load:** Dictionary loads automatically on server start when `DICT_PATH` is set

## 🚀 Usage

### Start the Server
```bash
bun run dev
```

The dictionary will load automatically and you'll see:
```
✔ Dictionary loaded from ./data/dictionaries/russian.txt: 50910 words (processed 51301 lines)
```

### Check Dictionary Status
```bash
curl http://localhost:3000/dictionary
```

Response:
```json
{
  "loaded": true,
  "source": "file",
  "size": 50910
}
```

### Play with CLI
```bash
bun run cli
```

Now when you make moves, the game will validate words against the Russian dictionary!

## 🔄 Updating the Dictionary

To use a different dictionary:

1. Place your dictionary file (one word per line, UTF-8) in `./data/dictionaries/`
2. Update `.env`:
   ```bash
   DICT_PATH=./data/dictionaries/your_dictionary.txt
   ```
3. Restart the server

## 🛠️ Dictionary Source

Downloaded from: https://github.com/Harrix/Russian-Nouns
- Community-maintained Russian nouns dictionary
- High quality, curated word list
- UTF-8 encoded
- Open source

## 📝 Notes

- The dictionary contains **nouns only** (существительные)
- If you need verbs, adjectives, etc., use a comprehensive dictionary
- For development/testing without dictionary validation, remove `DICT_PATH` from `.env`

## 🐛 Troubleshooting

### Dictionary Not Loading
1. Check that `.env` file exists in project root
2. Verify `DICT_PATH` points to correct file
3. Ensure dictionary file is UTF-8 encoded
4. Check server logs for errors

### Wrong Words Rejected
The dictionary contains only nouns. If you need other word types:
1. Download a comprehensive dictionary
2. Or temporarily remove `DICT_PATH` to allow all words

### Performance Issues
- Current dictionary (50K words) loads in ~100ms
- For larger dictionaries (500K+ words), initial load may take 1-2 seconds
- Once loaded, lookups are instant (Trie structure)

## 📊 Statistics

```
Total Lines:     51,301
Valid Words:     50,910
Skipped:           391 (empty lines, non-Cyrillic)
File Size:       964 KB
Load Time:       ~100ms
Memory Usage:    ~10MB (in-memory Trie)
```

## 🎯 Future Enhancements

Possible improvements:
- [ ] Add comprehensive dictionary with all word types
- [ ] Add dictionary hot-reload without server restart
- [ ] Support multiple dictionaries (e.g., Russian + English)
- [ ] Add word frequency data for better AI suggestions
- [ ] Implement dictionary caching for faster restarts

