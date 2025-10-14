# Color Code System

This document defines the standardized color palette for the Balda game web interface. Consistent color usage improves UX by creating clear visual associations between colors and their semantic meanings.

## ⚠️ IMPORTANT: Use Semantic Color Aliases

**Always use semantic aliases** (`user-*`, `opponent-*`, `info-*`, etc.) instead of raw color names (`yellow-*`, `amber-*`, `cyan-*`).

**Why?**
- **Clarity**: `bg-user-600` is clearer than `bg-yellow-600`
- **Maintainability**: Change colors in one place (CSS theme)
- **Consistency**: Forces semantic thinking
- **Rebranding**: Easy to switch colors without code changes

See [SEMANTIC_COLORS.md](./docs/SEMANTIC_COLORS.md) for complete alias reference.

## Core Color Palette

### Yellow - User Player Actions
**Purpose**: User-controlled elements, active player indicators, and success states

**Usage**:
- User's selected cells and move paths
- User's word highlights in history
- Active letter selection in alphabet panel
- Board cell hover states (user interaction)
- Turn indicator for active player
- Success buttons and confirmations
- Winning score indicators

**Shades**:
- `yellow-900`: Darkest - New letter placement in path, selected cells
- `yellow-800`: Dark - New letter in path
- `yellow-700`: Medium-dark - Success button gradient
- `yellow-600`: Medium - Existing letters in path, selected letter
- `yellow-500`: Bright - Hover rings, overlays
- `yellow-400`: Light - Borders, winning indicators, hover effects
- `yellow-300`: Lighter - Text accents, current player name
- `yellow-200`: Lightest - Letter number overlay
- `yellow-100`: Very light - Selected letter text

**Files**:
- `src/web/utils/cellStyling.ts` (hover effects, user path highlighting)
- `src/web/components/game/Board.tsx` (selected text, move number overlay)
- `src/web/components/game/AlphabetPanel.tsx` (letter selection)
- `src/web/components/game/Sidebar.tsx` (turn indicator, winning stats)
- `src/web/components/forms/GameList.tsx` (current player highlighting)
- `src/web/components/ui/Button.tsx` (success variant)

---

### Amber - Opponent Player & Warnings
**Purpose**: Opponent-controlled elements, opponent move visualization, and warning states

**Usage**:
- Opponent's move paths
- Opponent's word highlights in history
- Recent opponent move animation (2s pulse)
- Opponent's new letter placement
- Warning buttons, banners, and badges

**Shades**:
- `amber-800`: Dark - New letter in opponent path
- `amber-700`: Medium-dark - Warning button gradient
- `amber-600`: Medium - Existing letters in opponent path, warning backgrounds
- `amber-500`: Bright - Glow effects, warning borders
- `amber-400`: Light - Rings
- `amber-300`: Lighter - Borders
- `amber-200`: Lightest - Letter numbers

**Files**:
- `src/web/utils/cellStyling.ts` (opponent path highlighting)
- `src/web/components/screens/GameScreen.tsx` (opponent move detection)
- `src/web/components/ui/Button.tsx` (warning variant)
- `src/web/components/ui/Banner.tsx` (warning banner)
- `src/web/components/ui/Badge.tsx` (warning badge)

---

### Cyan - Information & Suggestions
**Purpose**: Informational UI elements, AI suggestions, help text, neutral interactive elements

**Usage**:
- AI suggestion cards and panels
- Information indicators and badges
- Help text and descriptors
- Word hover effects in sidebar
- Alphabet panel header indicator
- Letter position coordinates in suggestions
- Primary buttons (information actions)

**Shades**:
- `cyan-800`: Dark - Panel borders
- `cyan-600`: Medium - Backgrounds
- `cyan-500`: Bright - Badges, backgrounds
- `cyan-400`: Light - Hover borders, accents, text
- `cyan-300`: Lighter - Text, numbers
- `cyan-200`: Lightest - Coordinate text
- `cyan-100`: Very light - Hover text

**Files**:
- `src/web/components/game/SuggestionCard.tsx` (suggestion display)
- `src/web/components/game/GamePanel.tsx` (panel borders)
- `src/web/components/game/Sidebar.tsx` (word hover effects)
- `src/web/components/game/AlphabetPanel.tsx` (header indicator)
- `src/web/components/ui/Button.tsx` (primary variant)

---

### Red - Danger & Errors
**Purpose**: Destructive actions, error states, losing indicators

**Usage**:
- Danger buttons (exit, clear)
- Error messages
- Losing score indicators

**Shades**:
- `red-700`: Dark - Button backgrounds
- `red-600`: Medium - Button backgrounds
- `red-500`: Bright - Borders, glow
- `red-400`: Light - Losing indicators

**Files**:
- `src/web/components/ui/Button.tsx` (danger variant)
- `src/web/components/game/Sidebar.tsx` (losing indicators)

---

### Slate - Neutral UI Elements
**Purpose**: Backgrounds, borders, disabled states, empty cells

**Usage**:
- Application backgrounds
- Panel borders
- Empty board cells
- Disabled UI elements
- Neutral text

**Shades**:
- `slate-900`: Darkest - Deep backgrounds, empty cells
- `slate-800`: Dark - Panel backgrounds, filled cells
- `slate-700`: Medium - Borders, hover states
- `slate-600`: Light - Inactive elements, coordinate labels
- `slate-500`: Lighter - Muted text
- `slate-400`: Text - Secondary text
- `slate-300`: Lightest text - Primary text

**Files**:
- All component files (universal backgrounds and borders)

---

## Color Usage Guidelines

### 1. Player vs Opponent Distinction
- **Always** use `yellow` for user-controlled elements
- **Always** use `amber` for opponent-controlled elements
- **Never** mix these colors except in comparative scenarios (winning/losing indicators)

### 2. Information vs Action
- Use `cyan` for informational, non-committal elements (suggestions, help, previews)
- Use `yellow` for active user interactions and commitments (selections, moves, submissions)
- Use `amber` for warnings and opponent actions

### 3. Hover States
- User-interactive elements: `yellow` hover borders and rings
- Informational elements: `cyan` hover effects
- Keep hover effects 1-2 shades brighter than base color

### 4. Opacity Levels
- Backgrounds: `/20` (20% opacity) for subtle fills
- Borders: `/30` (30% opacity) for border colors
- Overlays: `/5` (5% opacity) for hover overlays
- Indicators: `/30` (30% opacity) for subtle indicators

### 5. Animation Colors
- Pulse animations: Use base color with `animate-pulse`
- Glow effects: Use `/40` or `/50` opacity for shadow colors
- Fade effects: Use `animate-fadeInOut` with base color

---

## Migration History

### Initial Migration (Emerald Phase)
Temporarily used emerald for user actions, but this was later reversed.

### Final Color System (Yellow for User)
1. **Board interactions** - Yellow for selected cells, hover effects, and user paths
2. **Alphabet panel** - Yellow for selected and hovered letters
3. **Sidebar** - Yellow for turn indicator and winning stats
4. **Game list** - Yellow for current player highlighting
5. **Button success variant** - Yellow (was emerald)
6. **Button warning variant** - Amber (was yellow-amber gradient)

### Rationale
- **Yellow** is bright and attention-grabbing, perfect for user actions
- **Amber** works well for both opponent moves and warnings (warm, cautionary color)
- **Cyan** remains informational and neutral
- Clear visual separation between player (yellow) and opponent (amber)

---

## Examples

### User Path Highlighting
```tsx
// New letter in user's path
'bg-yellow-800 border-yellow-300 text-white ring-4 ring-yellow-400/70'

// Existing letter in user's path
'bg-yellow-600 border-yellow-200 text-white ring-2 ring-yellow-300/50'

// Selected cell
'bg-yellow-900 border-yellow-400 text-white ring-4 ring-yellow-500/80'
```

### Opponent Path Highlighting
```tsx
// New letter in opponent's path (with pulse)
'bg-amber-800 border-amber-300 text-white ring-4 ring-amber-400/90 animate-pulse'

// Existing letter in opponent's path
'bg-amber-600 border-amber-200 text-white ring-2 ring-amber-300/50'
```

### Informational Elements
```tsx
// Suggestion card hover
'bg-slate-800 border-slate-700 hover:border-cyan-400 hover:shadow-cyan-400/10'

// Info badge
'bg-cyan-500/20 text-cyan-300 border-cyan-500/30'
```

### Interactive Buttons
```tsx
// User action button (success)
'bg-gradient-to-r from-yellow-600 to-yellow-700 hover:from-yellow-500'

// Info button
'bg-gradient-to-r from-cyan-600 to-cyan-700 hover:from-cyan-500'

// Warning button
'bg-gradient-to-r from-amber-600 to-amber-700 hover:from-amber-500'

// Danger button
'bg-gradient-to-r from-red-600 to-red-700 hover:from-red-500'
```

---

## Validation

Run the color analysis script to verify color usage:

```bash
bun run scripts/analyze-colors.ts
```

This script will:
- Count usage of each color shade across the codebase
- Report color distribution by component
- Validate color consistency

---

## Maintenance Checklist

When adding new UI components:

- [ ] Does it represent a user action? → Use `yellow-*`
- [ ] Does it represent opponent state? → Use `amber-*`
- [ ] Is it informational/suggestive? → Use `cyan-*`
- [ ] Is it a warning/alert? → Use `amber-*`
- [ ] Is it an error/danger? → Use `red-*`
- [ ] Run `bun run scripts/analyze-colors.ts` to verify
- [ ] Check `COLOR_CODE.md` for shade guidelines

---

## Further Reading

- [Tailwind CSS Colors](https://tailwindcss.com/docs/customizing-colors)
- [Accessibility Color Contrast](https://webaim.org/articles/contrast/)
- [Color Psychology in UX](https://www.interaction-design.org/literature/article/color-theory)
