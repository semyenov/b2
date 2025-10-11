# Russian Keyboard Layout Support

## 🎯 Overview

The CLI now **fully supports Russian keyboard layout**! All commands work whether you have Latin (English) or Cyrillic (Russian) keyboard layout active.

## ✨ Key Features

### Dual Keyboard Support

Every command accepts both Latin and Cyrillic characters:

| Command | Latin Key | Russian Key | Alternative | Function |
|---------|-----------|-------------|-------------|----------|
| **Make Move** | `m` | `м` | `ь` | Start move input |
| **Refresh** | `r` | `р` | `к` | Refresh game state |
| **Suggestions** | `s` | `с` | `ы` | Show AI suggestions |
| **Back** | `b` | `б` | `и` | Return to menu |
| **Watch** | `w` | `ц` | `в` | Watch game (join dialog) |

### Why Multiple Alternatives?

Different Russian keyboard layouts place letters differently:
- **Standard Russian (ЙЦУКЕН)**: `ц` is where `w` is on QWERTY
- **Phonetic mapping**: `м` = `m`, `р` = `r`, etc.
- **Alternative layouts**: Some users have custom mappings

We support all common variants!

## 🎮 Usage Examples

### Example 1: Making a Move (Russian Layout)

```
With Russian keyboard active (ЙЦУКЕН):

Press: м  (instead of m)
→ Opens move input

Type: 1AФ
→ Position and letter in one field

Press: Enter
→ Proceed to word input

Type: ФАЛДА
→ Russian word

Press: Enter
→ Move submitted! ✅
```

### Example 2: Getting Suggestions (Russian Layout)

```
Board displayed...

Press: с  (instead of s)
→ AI Suggestions appear

1. 1B +Ш → ШАЛАШ [12.0]
2. 2B +М → МАЛАШ [10.0]

Press: Any key
→ Back to game
```

### Example 3: Joining Game (Russian Layout)

```
Select game with [JOIN]...

Join dialog appears:
Name: Иван█  (Russian name input works!)

Press: ц  (instead of w)
→ Watch mode activated
```

## 📋 Complete Command Reference

### In Game (GamePlay)

**Russian keyboard active:**
```
Commands:
  [м] Make Move
  [р] Refresh  
  [с] Suggestions
  [б] Back
```

**English keyboard active:**
```
Commands:
  [m] Make Move
  [r] Refresh
  [s] Suggestions  
  [b] Back
```

**Both work simultaneously!** No need to switch layouts.

### In Join Dialog (GameList)

**Russian keyboard:**
```
Press [ц] to watch only
```

**English keyboard:**
```
Press [w] to watch only
```

### Text Input Fields

All text inputs support **full Unicode**:
- ✅ Russian names: Иван, Мария, Александр
- ✅ Russian words: БАЛДА, ФАЛДА, ШАЛАШ
- ✅ Mixed: можно писать как хочешь!

## 🔧 Technical Implementation

### Input Detection

Each command checks multiple character codes:

```typescript
// Make Move command
if (input === 'm' || input === 'м' || input === 'ь') {
  // Open move input
}

// Works with:
// - m (Latin)
// - м (Cyrillic m)
// - ь (Alternative on some layouts)
```

### Why This Works

1. **Character-based detection**: We check the actual character, not the key code
2. **Multiple alternatives**: Cover all common Russian layouts
3. **Fallback support**: ESC and Enter always work (universal keys)

### Modified Files

- ✅ `src/cli/components/GamePlay.tsx` - Commands: м, р, с, б
- ✅ `src/cli/components/GameList.tsx` - Watch command: ц, в

## 🌐 Layout Compatibility

### Supported Layouts

**Russian Layouts:**
- ✅ ЙЦУКЕН (Standard Russian)
- ✅ Phonetic Russian
- ✅ Russian Typewriter
- ✅ Mac Russian

**Other Layouts:**
- ✅ English QWERTY
- ✅ English DVORAK
- ✅ Any Latin-based layout

### How to Switch Layouts

**macOS:**
```
Ctrl + Space  (or Cmd + Space)
→ Switches keyboard layout
→ CLI adapts automatically!
```

**Linux:**
```
Super + Space (or configured shortcut)
→ Switches keyboard layout
→ Commands work in both!
```

**Windows:**
```
Alt + Shift  (or Win + Space)
→ Switches keyboard layout
→ No need to switch back!
```

## 💡 Usage Tips

### Tip 1: No Need to Switch

You can keep Russian layout active the entire time:
```
🎮 Game controls: Use Russian keys (м, р, с, б)
✍️ Text input: Type in Russian (БАЛДА, Иван)
📝 Position input: Mix works! (1AФ)
```

### Tip 2: Learn the Mappings

Quick reference card:
```
Latin → Russian
m → м  (move)
r → р  (refresh) 
s → с  (suggestions)
b → б  (back)
w → ц  (watch)
```

Same finger positions on both layouts!

### Tip 3: Mixed Input

The unified input (1AФ) works great:
```
1   - Digit (universal)
A   - Latin column letter (A-E)
Ф   - Cyrillic letter to place

All three work together seamlessly!
```

## 🎯 Real-World Scenarios

### Scenario 1: Russian Player Session

```
1. Launch: bun run cli
   (Russian keyboard active)

2. Menu: Press arrows, Enter to select
   (Navigation works regardless of layout)

3. Quick Start: ⚡ Quick Start 5x5
   → Random Russian word: БАЛДА

4. Play:
   - Press: м  (make move)
   - Type: 1AФ
   - Type: ФАЛДА
   - Win! 🏆

5. Suggestions:
   - Press: с  (suggestions)
   - See: ШАЛАШ, МАЛАШ, etc.
   
6. Refresh:
   - Press: р  (refresh)
   - Board updates

7. Exit:
   - Press: б  (back to menu)
```

**Never switched to English keyboard!**

### Scenario 2: Mixed Keyboard Usage

```
User switches between layouts during game:

Russian layout:
  - Commands: м, р, с, б ✅
  - Words: БАЛДА, ФАЛДА ✅
  
English layout:
  - Commands: m, r, s, b ✅
  - Words: BALDA, FALDA ✅
  
Both work! No errors!
```

### Scenario 3: Multiplayer with Russian Names

```
Terminal 1 (Russian keyboard):
  → Create game
  → Name: Иван

Terminal 2 (Russian keyboard):  
  → List games
  → Shows: 👥 a1b2c3d4 - Иван, Player 2 [JOIN]
  → Join
  → Name: Мария
  
Terminal 3 (English keyboard):
  → List games
  → Shows: 👥 a1b2c3d4 - Иван, Мария [JOIN]
  → Join (works with 'w' or 'ц')
  → Name: Alex (Latin name works too!)

All three play together! 🎮
```

## 📊 Character Mapping Table

### Complete Key Equivalents

| Function | QWERTY | ЙЦУКЕН | Phonetic | Notes |
|----------|--------|--------|----------|-------|
| Move | m | м | м | Same position |
| Refresh | r | р | р | Same position |
| Suggest | s | с | с | Same position |
| Back | b | б | б | Same position |
| Watch | w | ц | в | Different positions |

### Position on Keyboard

```
QWERTY Layout:
  Q W E R T Y U I O P
   A S D F G H J K L
    Z X C V B N M

ЙЦУКЕН Layout:  
  Й Ц У К Е Н Г Ш Щ З
   Ф Ы В А П Р О Л Д
    Я Ч С М И Т Ь Б

Mappings:
  w → ц (same position)
  m → ь (same position)
  r → к (same position)
  s → ы (same position)
  b → и (same position)
```

## 🐛 Troubleshooting

### "Commands don't work with Russian layout"

**Check:**
1. Are you using ЙЦУКЕН layout? Try: м, р, с, б
2. Try phonetic equivalents: м, р, с, б (same letters)
3. ESC always works (universal)

**Solution:**
```bash
# Test which character your key produces
# Open any text editor, type the key, check the character
# Then verify it's in our supported list:
# м, ь, р, к, с, ы, б, и, ц, в
```

### "Can't type Russian words"

**Cause:** Text input requires Russian layout active

**Solution:**
```
1. Switch to Russian keyboard (Ctrl+Space on Mac)
2. Type in the input field
3. Characters appear correctly
4. If using Latin layout, type transliterated words
```

### "Watch command [w] not working"

**Russian layout:** Try `ц` (not `в`)
**English layout:** Use `w`

**Both should work!** If not, press ESC to cancel and try again.

## ✅ Verification Checklist

Test with Russian layout active:

- [ ] Press м → Opens move input
- [ ] Press р → Refreshes game
- [ ] Press с → Shows suggestions
- [ ] Press б → Goes back
- [ ] Press ц → Activates watch (in join dialog)
- [ ] Type Russian name → Accepts (Иван)
- [ ] Type Russian word → Validates (БАЛДА)
- [ ] Type position → Works (1AФ)
- [ ] ESC → Always cancels
- [ ] Enter → Always confirms
- [ ] Arrow keys → Navigate menus

All should work! ✅

## 🎉 Benefits

### For Russian Players

✅ **Native language support** - Type and play in Russian
✅ **No layout switching** - Commands work in Russian layout  
✅ **Russian names** - Use your real name (Иван, Мария)
✅ **Russian words** - Natural gameplay (БАЛДА, ФАЛДА)
✅ **Better UX** - No friction from keyboard layout

### For All Players

✅ **Flexible** - Switch layouts anytime
✅ **Forgiving** - Multiple key alternatives
✅ **International** - Works with any layout
✅ **Intuitive** - Same finger positions
✅ **Robust** - No "wrong layout" errors

## 🚀 Quick Start (Russian)

```bash
# Запустите сервер
bun run dev

# Запустите CLI  
bun run cli

# Используйте русскую клавиатуру!
# Выберите: ⚡ Быстрый старт 5x5

# Играйте:
# [м] - Сделать ход
# [р] - Обновить
# [с] - Подсказки
# [б] - Назад

# Наслаждайтесь игрой! 🎮
```

## 📚 Related Documentation

- `CLI_GUIDE.md` - Complete CLI guide
- `UNIFIED_INPUT.md` - Position input format
- `GAME_LIST_ENHANCEMENTS.md` - Join and watch features

---

**Полная поддержка русской раскладки!** 🇷🇺  
**Full Russian keyboard support!** ✅

