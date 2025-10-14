# Color Code System

This document defines the standardized color palette for the Balda game web interface. Consistent color usage improves UX by creating clear visual associations between colors and their semantic meanings.

## Core Color Palette

### Emerald - User Player Actions
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
- `emerald-900`: Darkest - New letter placement in path
- `emerald-800`: Dark - New letter in path
- `emerald-600`: Medium - Existing letters in path, selected letter
- `emerald-500`: Bright - Hover rings, overlays
- `emerald-400`: Light - Borders, winning indicators
- `emerald-300`: Lighter - Text accents
- `emerald-200`: Lightest - Letter number overlay
- `emerald-100`: Very light - Selected letter text

**Files**:
- `src/web/utils/cellStyling.ts` (hover effects, user path highlighting)
- `src/web/components/game/AlphabetPanel.tsx` (letter selection)
- `src/web/components/game/Sidebar.tsx` (turn indicator, winning stats)
- `src/web/components/ui/Button.tsx` (success variant)

---

### Amber - Opponent Player
**Purpose**: Opponent-controlled elements, opponent move visualization

**Usage**:
- Opponent's move paths
- Opponent's word highlights in history
- Recent opponent move animation (2s pulse)
- Opponent's new letter placement

**Shades**:
- `amber-800`: Dark - New letter in opponent path
- `amber-600`: Medium - Existing letters in opponent path
- `amber-500`: Bright - Glow effects
- `amber-400`: Light - Rings
- `amber-300`: Lighter - Borders
- `amber-200`: Lightest - Letter numbers

**Files**:
- `src/web/utils/cellStyling.ts` (opponent path highlighting)
- `src/web/components/screens/GameScreen.tsx` (opponent move detection)

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
- **Always** use `emerald` for user-controlled elements
- **Always** use `amber` for opponent-controlled elements
- **Never** mix these colors except in comparative scenarios (winning/losing indicators)

### 2. Information vs Action
- Use `cyan` for informational, non-committal elements (suggestions, help, previews)
- Use `emerald` for active user interactions and commitments (selections, moves, submissions)

### 3. Hover States
- User-interactive elements: `emerald` hover borders and rings
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

## Migration from Legacy Yellow

### Replaced Yellow Usage:
1. **Board hover effects** (yellow → emerald)
   - Rationale: Board interaction is a user action

2. **Alphabet panel letter hover** (yellow → emerald)
   - Rationale: Letter selection is a user action

3. **Alphabet panel selected letter** (cyan → emerald)
   - Rationale: Selected state represents user choice

4. **Alphabet panel header indicator** (yellow → cyan)
   - Rationale: Header is informational, not an action

5. **Suggestion card letter badge** (yellow → cyan)
   - Rationale: Suggestions are informational

6. **Sidebar turn indicator** (yellow → emerald)
   - Rationale: Turn indicator shows active player state

### Remaining Yellow Usage:
- `yellow-*` is **reserved exclusively for warning states** (Banner, Badge, Button warning variant)
- **Do not use** yellow for interactive elements, turn indicators, or user actions
- Current yellow usage (12 occurrences) is intentional and appropriate

---

## Examples

### User Path Highlighting
```tsx
// New letter in user's path
'bg-emerald-800 border-emerald-300 text-white ring-4 ring-emerald-400/70'

// Existing letter in user's path
'bg-emerald-600 border-emerald-200 text-white ring-2 ring-emerald-300/50'
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
// User action button
'bg-emerald-600 hover:bg-emerald-500 border-emerald-400'

// Info button
'bg-cyan-600 hover:bg-cyan-500 border-cyan-500'

// Danger button
'bg-red-600 hover:bg-red-500 border-red-500'
```

---

## Validation

Run the color analysis script to verify color usage:

```bash
bun run scripts/analyze-colors.ts
```

This script will:
- Count usage of each color shade across the codebase
- Identify any remaining yellow usage
- Report color distribution by component
- Flag potential color misuse

---

## Further Reading

- [Tailwind CSS Colors](https://tailwindcss.com/docs/customizing-colors)
- [Accessibility Color Contrast](https://webaim.org/articles/contrast/)
- [Color Psychology in UX](https://www.interaction-design.org/literature/article/color-theory)
