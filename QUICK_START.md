# Quick Start 5x5 Feature

## 🎯 Overview

The CLI now features a **Quick Start 5x5** option that instantly creates a game with a random 5-letter Russian word - perfect for jumping right into gameplay!

## ✨ How It Works

1. **Select from Main Menu**: Choose `⚡ Quick Start 5x5 (Random Word)`
2. **Automatic Setup**: 
   - Fetches a random 5-letter word from the Russian dictionary
   - Creates a 5x5 board
   - Places you as "Player 1" 
   - Sets up "Player 2" as placeholder (ready for joining)
3. **Start Playing**: Immediately jump into the game!

## 🎮 Usage

### From Main Menu

```
🎮 Balda Word Game - CLI Frontend

Select an option:

❯ ⚡ Quick Start 5x5 (Random Word)   ← Select this!
  ➕ Create New Game
  🔗 Join Game by Code
  📋 List All Games
  🚪 Exit
```

### What Happens

```
Loading random word from dictionary...
✓ Created 5x5 game with word: БАЛДА

Game ID (share this to invite players):
┌────────────────────────────────────────┐
│ 1a2b3c4d-5e6f-7g8h-9i0j-k1l2m3n4o5p6   │
└────────────────────────────────────────┘

Playing as: Player 1

   A  B  C  D  E
0 ┌─┐┌─┐┌─┐┌─┐┌─┐
  │·││·││·││·││·│
1 ┌─┐┌─┐┌─┐┌─┐┌─┐
  │·││·││·││·││·│
2 ┌─┐┌─┐┌─┐┌─┐┌─┐
  │Б││А││Л││Д││А│
3 ┌─┐┌─┐┌─┐┌─┐┌─┐
  │·││·││·││·││·│
4 ┌─┐┌─┐┌─┐┌─┐┌─┐
  │·││·││·││·││·│

▶ Your turn! Make a move.

Commands:
  [m] Make Move  [r] Refresh  [s] Suggestions  [b] Back
```

## 🎯 Benefits

### Speed
- **3 seconds** from menu to playing vs 30+ seconds for manual setup
- No thinking about board size or base word
- Skip configuration entirely

### Variety
- Every game starts with a different word
- Discover new Russian words
- Fresh challenges every time

### Multiplayer Ready
- Game is immediately joinable
- Share the Game ID with Player 2
- They can join using "Join Game by Code"

## 📊 Comparison

| Feature | Manual Create | Quick Start 5x5 |
|---------|---------------|-----------------|
| Steps | 5 steps | 1 click |
| Time | ~30 seconds | ~3 seconds |
| Board size choice | Yes | Fixed 5x5 |
| Base word choice | Manual entry | Random |
| Player name | Custom | "Player 1" |
| Best for | Custom games | Quick play |

## 🔧 Technical Details

### API Endpoint
```
GET /dictionary/random?length=5&count=1
```

**Response:**
```json
{
  "words": ["БАЛДА", "ФАЛДА", "МАЛДА"]
}
```

### Word Selection
- Randomly selected from 51,000+ Russian words
- Filtered to exactly 5 letters
- Valid Russian Cyrillic characters only
- Guaranteed to be in the dictionary

### Game Configuration
- **Size**: 5x5 grid
- **Players**: Player 1 (you) + Player 2 (placeholder)
- **Base Word**: Random 5-letter word in center row
- **Ready to play**: Immediate

## 📝 Example Words

Some 5-letter words you might see:

- БАЛДА - Perfect for the Balda game!
- ФАЛДА - Coat tail, skirt
- МАЛДА - (proper name)
- ВОЖЖА - Rein (for horses)
- ФУЗЕЯ - Fuze (pyrotechnic)
- ОТДЫХ - Rest, vacation

## 🚀 Quick Workflow

### Solo Practice
```
1. Launch CLI: bun run cli
2. Select: ⚡ Quick Start 5x5
3. Play against yourself
4. Press [s] for AI suggestions
```

### Multiplayer Session
```
Player 1:
1. Select: ⚡ Quick Start 5x5
2. Share Game ID with Player 2

Player 2 (in separate terminal):
1. bun run cli
2. Select: 🔗 Join Game by Code
3. Enter Game ID from Player 1
4. Enter your name

Both players now see real-time updates!
```

## 💡 Tips

### When to Use Quick Start
- ✅ Want to play immediately
- ✅ Don't care about board size
- ✅ Exploring the game
- ✅ Testing features
- ✅ Quick match with friend

### When to Use Custom Create
- ✅ Need specific board size (3x3, 7x7, etc.)
- ✅ Want a specific base word
- ✅ Tournament with rules
- ✅ Educational purposes
- ✅ Custom player names

## 🎨 Features Inherited

Quick Start games include ALL features:

- ✅ Real-time multiplayer sync
- ✅ AI suggestions ([s] key)
- ✅ Unified input (e.g., "1AФ")
- ✅ Progressive highlighting
- ✅ Score tracking
- ✅ Move history
- ✅ Turn indicators
- ✅ Russian dictionary validation

## ⚙️ Configuration

### Using Different Dictionary
If you have a custom dictionary:

```bash
DICT_PATH=./my-dictionary.txt bun run dev
```

Quick Start will use words from your custom dictionary!

### Changing Default Size
Currently fixed to 5x5. To use different sizes, use "Create New Game" option.

## 🐛 Troubleshooting

### "No 5-letter words available"
**Cause**: Dictionary not loaded or empty
**Solution**: 
```bash
# Ensure dictionary is set
echo 'DICT_PATH=./data/dictionaries/russian.txt' > .env

# Verify dictionary exists
ls -lh ./data/dictionaries/russian.txt

# Check words available
curl 'http://localhost:3000/dictionary/random?length=5&count=5'
```

### "Failed to fetch random words"
**Cause**: Server not running or API error
**Solution**:
```bash
# Start server
bun run dev

# Test endpoint
curl 'http://localhost:3000/dictionary/random?length=5&count=1'
```

### Different word every time?
Yes! That's the feature. Each Quick Start game gets a truly random word.

## 📚 Implementation

### Files Modified

1. **src/dictionary.ts**
   - Added `getRandomWords()` method to `SizedDictionary` interface
   - Implemented word collection and shuffling in `TrieDictionary`

2. **src/schemas.ts**
   - Added `RandomWordsQuerySchema`
   - Added `RandomWordsResponseSchema`

3. **src/routes.ts**
   - Added `GET /dictionary/random` endpoint

4. **src/cli/api.ts**
   - Added `getRandomWords()` client method

5. **src/cli/components/MainMenu.tsx**
   - Added "Quick Start 5x5" menu option

6. **src/cli/App.tsx**
   - Added `handleQuickStart5x5()` handler
   - Integrated with menu selection

## ✅ Testing

### API Test
```bash
# Get one random 5-letter word
curl 'http://localhost:3000/dictionary/random?length=5&count=1'

# Get multiple words
curl 'http://localhost:3000/dictionary/random?length=5&count=10'

# Different lengths
curl 'http://localhost:3000/dictionary/random?length=6&count=5'
```

### CLI Test
```bash
bun run cli
# Select: ⚡ Quick Start 5x5 (Random Word)
# Verify: Game starts immediately with random word
# Verify: Board is 5x5
# Verify: You are "Player 1"
# Verify: Can make moves normally
```

## 🎯 Success Criteria

✅ Quick Start appears first in menu  
✅ Game creates in < 3 seconds  
✅ Random word is different each time  
✅ Board is always 5x5  
✅ Player 1 is set automatically  
✅ Game ID is displayed for sharing  
✅ All gameplay features work normally  
✅ Can press [b] to return to menu  

## 🚀 Try It Now!

```bash
bun run cli
```

Select `⚡ Quick Start 5x5 (Random Word)` and start playing instantly! 🎮

