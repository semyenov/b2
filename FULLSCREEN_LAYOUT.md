# Full-Screen CLI Layout Implementation

## Overview
Redesigned the CLI game interface to use 100% of terminal space with a symmetrical, efficient layout.

## New Layout Structure

### Header (Top)
1. **Game ID Line**: Displays game code and current player name in a double-bordered box
   - Centered layout
   - Magenta border for visibility
   - Shows "ID: {game-id} | Вы: {player-name}"

2. **Scores Line**: Shows all players' scores horizontally
   - Evenly distributed across width
   - Current player highlighted in yellow with ▶ indicator
   - Cyan border

### Main Content (Center)
1. **Board**: Full-width, responsive square board
   - Dynamically calculates cell size based on terminal width
   - Maintains square aspect ratio
   - Centered on screen
   - Supports highlighting (row, position, preview letter)

2. **Used Words Lists**: Players' word lists side by side
   - Each player gets equal column width (flexGrow + flexBasis)
   - Shows player name, score, and list of words
   - Current player highlighted with yellow border
   - Empty state: "Нет слов"

3. **Input Area**: Appears when making a move
   - Compact single-line input
   - Shows either position input or word input

### Footer (Bottom)
**Status Bar**: Fixed to bottom
   - **Status Line**: Shows current game state
     - Loading indicator: "⏳ Обработка..."
     - Errors: "❌ {error}"
     - Turn indicator: "▶ Ваш ход!" or "⏳ Ожидание хода..."
     - Input prompts with real-time feedback
   - **Command Line**: Available keyboard shortcuts
     - Idle mode: [м] Ход  [р] Обновить  [с] Подсказки  [б] Назад  [ESC] Выход
     - Input mode: [ESC] Отмена  [Enter] Подтвердить

## New Components

### 1. FullScreenLayout.tsx
A layout wrapper that:
- Uses 100% of terminal height and width
- Divides screen into header, content, and footer sections
- Content area uses flexGrow to fill remaining space

### 2. StatusBar.tsx
Bottom status bar component that:
- Shows contextual status messages
- Displays loading states
- Shows errors with ❌ prefix
- Shows turn indicators with ▶ and ⏳ icons
- Provides real-time input feedback
- Lists available commands

### 3. UsedWords.tsx
Side-by-side word lists component that:
- Groups words by player
- Displays player name and score in header
- Shows numbered list of words
- Highlights current player
- Responsive column widths

## Updated Components

### Board.tsx
- Now uses full terminal width
- Dynamically calculates cell size: `Math.floor((terminalWidth - 6) / size)`
- Centers board using alignItems="center"
- Maintains all highlighting features (row, position, preview)

### GamePlay.tsx
- Complete restructure using FullScreenLayout
- Removed verbose input instructions (moved to status bar)
- Compact input area (single line instead of multi-line box)
- Integrated StatusBar with smart prompts
- Added UsedWords display
- Header shows game ID and scores horizontally

## Key Features

### Responsive Design
- Board scales with terminal size
- All components use 100% width
- Maintains square board proportions

### Visual Hierarchy
1. Game info (top) - most important context
2. Board (center) - main focus
3. Word lists (below board) - reference information
4. Status bar (bottom) - always visible guidance

### Space Efficiency
- No wasted space
- Information density optimized
- Borders used sparingly for structure
- Colors used for emphasis and status

### Symmetry
- Equal spacing for players (scores, word lists)
- Centered board
- Balanced header and footer

## Benefits

1. **Better Use of Space**: No empty areas, full terminal utilization
2. **Improved Readability**: Clear sections, logical flow
3. **Enhanced UX**: Status bar always visible, contextual prompts
4. **Professional Look**: Symmetrical, balanced design
5. **Scalability**: Works with different terminal sizes
6. **Accessibility**: Clear visual hierarchy and status indicators

## Technical Implementation

- Uses Ink's `useStdout()` hook to get terminal dimensions
- Flexbox layout for responsive design
- Smart height/width calculations
- Efficient re-rendering with React state management

## Future Enhancements

Potential improvements:
- Apply FullScreenLayout to other screens (GameList, Suggestions)
- Add terminal resize handling
- Support for very small terminals (minimum size warnings)
- Keyboard shortcuts overlay (press ? for help)
- Animated transitions between states

