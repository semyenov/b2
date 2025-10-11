# CLI Improvements - Chess-Style Notation

## 🎯 What Changed

The CLI now uses **chess-style notation** for a faster, more intuitive gameplay experience!

### Before (Old UX)
```
Step 1: Enter row: 1
Step 2: Enter col: 2
Step 3: Enter letter: Ф
Step 4: Enter word: ФАЛДА
```
**4 separate inputs, hard to visualize**

### After (New UX)
```
Step 1: Enter position: 1C  ← Combined! (with real-time feedback)
Step 2: Enter letter: Ф
Step 3: Enter word: ФАЛДА
```
**Only 3 steps, instant visual feedback!**

## 🆕 New Features

### 1. Column Letters (Like Chess/Spreadsheets)
The board now shows **column letters** (A, B, C, D, E) instead of numbers:

```
      A  B  C  D  E
  0 ┌─┐┌─┐┌─┐┌─┐┌─┐
    │·││·││·││·││·│
  1 ┌─┐┌─┐┌─┐┌─┐┌─┐
    │·││М││·││·││·│
  2 ┌─┐┌─┐┌─┐┌─┐┌─┐
    │М││А││Л││Д││А│
  ...
```

### 2. Combined Position Input
Type position in one go: `{row}{column}`

**Examples:**
- `0A` = Row 0, Column A (top-left)
- `2C` = Row 2, Column C (middle)
- `4E` = Row 4, Column E (if board is 5x5)

### 3. Real-Time Visual Feedback
As you type, you see:
- ✓ **Green checkmark** when position is valid
- **Yellow highlight** on the board showing exactly which cell you're targeting
- **Instant feedback** if position is invalid

**Example while typing "2C":**
```
Position: 2C_

✓ Targeting: Row 2, Column C  ← Shows immediately!

[Board highlights cell (2,C) in yellow]
```

### 4. Better Error Messages
```
❌ Before: "Invalid row number"
✅ After:  "Invalid position. Use format like '1A', '2B' (row 0-4, col A-E)"
```

### 5. Improved Suggestions Display
Suggestions now show positions in the new format:

```
AI Move Suggestions
━━━━━━━━━━━━━━━━━━━━
1. 1B +Ш → ШАЛАШ [12.0]
2. 3B +Ш → ШАЛАШ [12.0]
3. 1B +Ш → МАМАША [11.0]
4. 1B +Ф → ФАЛДА [10.0]
5. 2C +Г → МАЛАГА [10.0]
```

Each suggestion is now **copy-paste ready** - you can type exactly what you see!

## 📝 Usage Examples

### Making a Move

**Scenario:** Place "Ф" at row 1, column B to form "ФАЛДА"

1. Press `[m]` to make a move
2. Type: `1B` ← That's it! Much faster than separate inputs
3. The board immediately highlights position (1,B) in yellow
4. You see: "✓ Targeting: Row 1, Column B"
5. Press Enter
6. Type letter: `Ф`
7. Type word: `ФАЛДА`
8. Done! ✅

### Using AI Suggestions

1. Press `[s]` to see suggestions
2. You see: `1. 1B +Ш → ШАЛАШ [12.0]`
3. Press any key to close
4. Press `[m]` to make move
5. Type exactly what you saw: `1B`
6. Continue with the suggested letter and word

## 🎮 Supported Formats

### Valid Inputs
- ✅ `0A` - Single digit row + single letter column
- ✅ `2C` - Any valid row/column combination
- ✅ `4E` - Maximum depends on board size
- ✅ `1a` - Case insensitive (converts to `1A`)
- ✅ `2 b` - Strips whitespace → `2B`

### Invalid Inputs
- ❌ `A1` - Wrong order (should be row first: `1A`)
- ❌ `11` - No letter (needs: `11A`)
- ❌ `CC` - No row number (needs: `2C`)
- ❌ `9Z` - Out of bounds (depends on board size)

## 🚀 Benefits

### Speed Improvements
- **33% fewer steps** (3 steps vs 4 steps)
- **Faster typing** - one continuous motion
- **Less cognitive load** - visualize position instantly

### Usability Improvements
- **Chess players** feel at home with letter columns
- **Spreadsheet users** recognize A,B,C columns
- **Real-time feedback** prevents mistakes before submission
- **Copy suggestions** directly from AI recommendations

### Visual Improvements
- **Yellow highlighting** shows target cell as you type
- **Clearer board** with letter columns
- **Better contrast** between labels and content
- **Consistent notation** across all screens

## 🔧 Technical Details

### Position Parser
```typescript
// Accepts: "1A", "2B", etc.
// Returns: {row: 1, col: 0} or null if invalid
parsePosition(input: string): {row, col} | null

// Examples:
parsePosition("1A")  // → {row: 1, col: 0}
parsePosition("2C")  // → {row: 2, col: 2}
parsePosition("5Z")  // → null (out of bounds)
```

### Column Conversion
```typescript
// Column letter to index
'A'.charCodeAt(0) - 65  // → 0
'B'.charCodeAt(0) - 65  // → 1
'C'.charCodeAt(0) - 65  // → 2

// Index to column letter
String.fromCharCode(65 + 0)  // → 'A'
String.fromCharCode(65 + 1)  // → 'B'
String.fromCharCode(65 + 2)  // → 'C'
```

## 📊 Comparison Table

| Feature | Old CLI | New CLI |
|---------|---------|---------|
| Position Input | 2 steps (row, col) | 1 step (combined) |
| Column Display | Numbers (0,1,2...) | Letters (A,B,C...) |
| Visual Feedback | None | Real-time highlighting |
| Error Messages | Generic | Specific with examples |
| Suggestions Format | (row,col) | ChessStyle (1A, 2B) |
| Copy-Paste Suggestions | No | Yes ✅ |
| Total Input Steps | 4 | 3 |
| Learning Curve | Medium | Low (familiar notation) |

## 🎯 Future Enhancements

Possible additional improvements:
- [ ] Allow `A1` format (column-first) as alternative
- [ ] Tab completion for valid positions
- [ ] Arrow keys to move between cells
- [ ] Batch input: `1A Ф ФАЛДА` (all in one line)
- [ ] Undo last move with `[u]` key
- [ ] Board history/replay mode

## 🐛 Troubleshooting

**Q: I typed `A1` but it doesn't work**
A: Use row-first format: `1A` (number then letter)

**Q: The cell doesn't highlight as I type**
A: Keep typing! Highlight appears when format is valid (e.g., after typing `1A`)

**Q: Can I use lowercase?**
A: Yes! `1a`, `2b`, `3c` all work (automatically converted to uppercase)

**Q: What if board is larger than 26 columns?**
A: Currently supports up to 26 columns (A-Z). Most Balda games use 3-7 size boards.

## ✅ Testing Checklist

- [x] Column letters display correctly (A, B, C...)
- [x] Position parser handles valid inputs
- [x] Position parser rejects invalid inputs
- [x] Real-time highlighting works
- [x] Suggestions show chess notation
- [x] Case insensitive input works
- [x] Error messages are helpful
- [x] No linter errors
- [x] Backward compatible with existing games

## 🎉 Ready to Use!

Start playing with the improved CLI:

```bash
bun run dev   # Start server
bun run cli   # Start CLI with new features
```

Try the new notation and enjoy the faster, more intuitive gameplay! 🎮

