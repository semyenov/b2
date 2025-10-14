# Semantic Color System Reference

Complete reference for semantic color aliases in the Balda game.

## Quick Reference

| Semantic Name | Maps To | Purpose |
|--------------|---------|---------|
| `user-*` | `yellow-*` | User actions, selections, active states |
| `player-*` | `yellow-*` | Player-specific elements (alias of user) |
| `active-*` | `yellow-*` | Active/current state indicators (alias of user) |
| `success-*` | `yellow-*` | Success states, confirmations (alias of user) |
| `opponent-*` | `amber-*` | Opponent actions, moves |
| `warning-*` | `amber-*` | Warning states, cautions (alias of opponent) |
| `info-*` | `cyan-*` | Informational elements, help text |
| `suggestion-*` | `cyan-*` | AI suggestions (alias of info) |
| `surface-*` | `slate-*` | Backgrounds, panels, borders |
| `neutral-*` | `slate-*` | Neutral UI elements (alias of surface) |
| `danger-*` | `red-*` | Errors, destructive actions |
| `error-*` | `red-*` | Error states (alias of danger) |

---

## User/Player Colors (Yellow)

**Semantic aliases**: `user-*`, `player-*`, `active-*`, `success-*`

Use for user-controlled elements, active player indicators, and success states.

### Common Patterns

```tsx
// Selected cell
'bg-user-900 border-user-400 ring-4 ring-user-500/80'

// Active button (success)
'bg-gradient-to-r from-user-600 to-user-700 hover:from-user-500'

// Current player indicator
'text-user-300 font-bold'

// Hover state
'hover:border-user-400 hover:ring-2 hover:ring-user-500/50'

// Letter selection
'bg-user-600 border-user-300 ring-2 ring-user-400'
```

### Shade Usage Guide

| Shade | Usage | Example |
|-------|-------|---------|
| `user-50` | Very light backgrounds | Subtle highlights |
| `user-100` | Light text on dark | Selected letter text |
| `user-200` | Light accents | Letter number overlays |
| `user-300` | Medium text | Current player name, labels |
| `user-400` | Borders, indicators | Winning stats, hover borders |
| `user-500` | Bright accents | Hover rings, focus states |
| `user-600` | Primary backgrounds | Selected letters, buttons |
| `user-700` | Medium-dark | Button gradients |
| `user-800` | Dark backgrounds | New letter in path |
| `user-900` | Darkest backgrounds | Selected cells |
| `user-950` | Extra dark | Rarely used |

---

## Opponent/Warning Colors (Amber)

**Semantic aliases**: `opponent-*`, `warning-*`

Use for opponent-controlled elements and warning states.

### Common Patterns

```tsx
// Opponent move path
'bg-opponent-800 border-opponent-300 ring-4 ring-opponent-400/90 animate-pulse'

// Warning badge
'bg-opponent-900 text-opponent-300 border-opponent-600'

// Warning button
'bg-gradient-to-r from-opponent-600 to-opponent-700'

// Opponent turn indicator
'text-opponent-300'
```

### Shade Usage Guide

| Shade | Usage | Example |
|-------|-------|---------|
| `opponent-100` | Light text | Move number overlays |
| `opponent-200` | Light accents | Letter numbers |
| `opponent-300` | Medium text | Borders, warnings |
| `opponent-400` | Borders, rings | Hover effects |
| `opponent-500` | Bright accents | Glows, shadows |
| `opponent-600` | Primary backgrounds | Existing letters in path |
| `opponent-700` | Medium-dark | Warning buttons |
| `opponent-800` | Dark backgrounds | New letter in opponent path |
| `opponent-900` | Darkest backgrounds | Warning banners |

---

## Info/Suggestion Colors (Cyan)

**Semantic aliases**: `info-*`, `suggestion-*`

Use for informational elements, AI suggestions, and help text.

### Common Patterns

```tsx
// Suggestion card
'bg-surface-800 border-surface-700 hover:border-info-400'

// Info badge
'bg-info-500/20 text-info-300 border-info-500/30'

// Primary button (informational action)
'bg-gradient-to-r from-info-600 to-info-700'

// Info text
'text-info-300'

// Hover overlay
'bg-info-500/5 opacity-0 group-hover:opacity-100'
```

### Shade Usage Guide

| Shade | Usage | Example |
|-------|-------|---------|
| `info-100` | Very light text | Hover text |
| `info-200` | Light text | Coordinates in suggestions |
| `info-300` | Medium text | Badge text, labels |
| `info-400` | Borders, accents | Title text, hover borders |
| `info-500` | Primary backgrounds | Badge backgrounds, buttons |
| `info-600` | Medium backgrounds | Primary buttons |
| `info-700` | Dark backgrounds | Button gradients |
| `info-800` | Very dark | Panel borders |
| `info-900` | Darkest | Info badges |

---

## Surface/Neutral Colors (Slate)

**Semantic aliases**: `surface-*`, `neutral-*`

Use for backgrounds, panels, borders, and neutral UI elements.

### Common Patterns

```tsx
// Panel background
'bg-surface-800 border border-surface-700'

// Disabled state
'bg-surface-600 text-surface-400 cursor-not-allowed'

// Empty cell
'bg-surface-900 border-surface-700 text-surface-600'

// Neutral text
'text-surface-300'

// Borders
'border-surface-600'
```

### Shade Usage Guide

| Shade | Usage | Example |
|-------|-------|---------|
| `surface-50` | Lightest | Rarely used on dark theme |
| `surface-100` | Very light text | Banner text |
| `surface-200` | Light accents | Rarely used |
| `surface-300` | Primary text | Main text color |
| `surface-400` | Secondary text | Labels, hints |
| `surface-500` | Muted text | Disabled text, placeholders |
| `surface-600` | Light borders | Panel borders, hover states |
| `surface-700` | Medium backgrounds/borders | Primary borders, hover BG |
| `surface-800` | Dark backgrounds | Card backgrounds, panels |
| `surface-900` | Darkest backgrounds | App background, empty cells |
| `surface-950` | Extra dark | Rarely used |

---

## Danger/Error Colors (Red)

**Semantic aliases**: `danger-*`, `error-*`

Use for errors, destructive actions, and failure states.

### Common Patterns

```tsx
// Danger button
'bg-gradient-to-r from-danger-600 to-danger-700 hover:from-danger-500'

// Error badge
'bg-danger-900 text-danger-300 border-danger-600'

// Error text
'text-danger-400'

// Losing indicator
'text-danger-400 font-bold'
```

### Shade Usage Guide

| Shade | Usage | Example |
|-------|-------|---------|
| `danger-100` | Light text | Error banner text |
| `danger-300` | Medium text | Error labels |
| `danger-400` | Accents | Losing indicators, borders |
| `danger-500` | Primary | Error borders |
| `danger-600` | Backgrounds | Danger buttons |
| `danger-700` | Dark backgrounds | Button gradients, borders |
| `danger-800` | Very dark | Error panels |
| `danger-900` | Darkest | Error badges, banners |

---

## Usage Examples by Component Type

### Buttons

```tsx
// Success (user action)
<Button variant="success">  // Uses user-* colors
  Отправить слово
</Button>

// Info/Primary
<Button variant="primary">  // Uses info-* colors
  Подсказка
</Button>

// Warning
<Button variant="warning">  // Uses opponent-* colors
  Предупреждение
</Button>

// Danger
<Button variant="danger">  // Uses danger-* colors
  Отмена
</Button>

// Neutral
<Button variant="gray">  // Uses surface-* colors
  Выход
</Button>
```

### Badges

```tsx
// Success badge
<Badge variant="success">В процессе</Badge>  // user-* colors

// Info badge
<Badge variant="info">Информация</Badge>  // info-* colors

// Warning badge
<Badge variant="warning">Внимание</Badge>  // opponent-* colors

// Danger badge
<Badge variant="danger">Ошибка</Badge>  // danger-* colors
```

### Board Cells

```tsx
// Selected cell (user)
'bg-user-900 border-user-400 ring-4 ring-user-500/80'

// User path
'bg-user-600 border-user-200 ring-2 ring-user-300/50'

// Opponent path
'bg-opponent-600 border-opponent-200 ring-2 ring-opponent-300/50'

// Empty cell
'bg-surface-900 border-surface-700 text-surface-600'

// Filled cell
'bg-surface-800 border-surface-700 text-surface-300'
```

### Text Colors

```tsx
// Primary text
'text-surface-300'

// Secondary text
'text-surface-400'

// Muted text
'text-surface-500'

// User/active text
'text-user-300'

// Info text
'text-info-400'

// Error text
'text-danger-400'
```

---

## Migration Guide

### Automatic Migration

Use the migration script to automatically convert raw colors to semantic aliases:

```bash
# Preview changes
bun run scripts/migrate-colors.ts --dry-run

# Apply migration
bun run scripts/migrate-colors.ts --apply

# Rollback if needed
bun run scripts/migrate-colors.ts --rollback

# Clean up backups
bun run scripts/migrate-colors.ts --clean-backups
```

### Manual Migration

If you need to manually update colors:

**Before (Raw Colors)**:
```tsx
<div className="bg-yellow-600 text-yellow-100">
  User action
</div>

<div className="bg-amber-800 text-opponent-300">
  Opponent move
</div>

<div className="bg-cyan-500 text-cyan-100">
  Info message
</div>

<div className="bg-slate-800 text-slate-300">
  Neutral panel
</div>

<div className="bg-red-600 text-red-100">
  Error
</div>
```

**After (Semantic Aliases)**:
```tsx
<div className="bg-user-600 text-user-100">
  User action
</div>

<div className="bg-opponent-800 text-opponent-300">
  Opponent move
</div>

<div className="bg-info-500 text-info-100">
  Info message
</div>

<div className="bg-surface-800 text-surface-300">
  Neutral panel
</div>

<div className="bg-danger-600 text-danger-100">
  Error
</div>
```

---

## Choosing the Right Alias

Ask yourself:

1. **Is this a user action or user-controlled element?** → Use `user-*` (or `player-*`, `active-*`, `success-*`)

2. **Is this an opponent action or warning?** → Use `opponent-*` (or `warning-*`)

3. **Is this informational or a suggestion?** → Use `info-*` (or `suggestion-*`)

4. **Is this a background, border, or neutral element?** → Use `surface-*` (or `neutral-*`)

5. **Is this an error or destructive action?** → Use `danger-*` (or `error-*`)

---

## Benefits of Semantic Colors

### 1. Code Clarity
```tsx
// ❌ Unclear intent
<div className="bg-yellow-600">

// ✅ Clear intent
<div className="bg-user-600">
```

### 2. Easy Rebranding
Want to change user color from yellow to blue? One line in CSS:
```css
/* Before */
--color-user-600: var(--color-yellow-600);

/* After */
--color-user-600: var(--color-blue-600);
```

All 50+ usages update automatically!

### 3. Type Safety
TypeScript autocomplete shows semantic names, making it harder to use wrong colors.

### 4. Consistency
Forces developers to think semantically, leading to more consistent UX.

### 5. Maintenance
6 months later, `bg-user-600` is self-documenting. `bg-yellow-600` requires context.

---

## Best Practices

### ✅ DO

- Use semantic aliases everywhere
- Choose the most specific alias (`user` over `active` if it's specifically a user element)
- Use consistent shade patterns (e.g., always use `-600` for primary backgrounds)
- Document why you chose a particular semantic color in complex cases

### ❌ DON'T

- Use raw color names (`yellow-*`, `amber-*`, `cyan-*`, etc.)
- Mix semantic and raw colors in the same component
- Use semantic colors for their underlying color (e.g., using `user-*` just because you want yellow)
- Create custom color classes instead of using semantic system

---

## Implementation Details

Semantic colors are defined in `src/web/index.css` using Tailwind v4's `@theme` directive:

```css
@theme {
  /* User colors → Yellow */
  --color-user-100: var(--color-yellow-100);
  --color-user-200: var(--color-yellow-200);
  /* ... etc */

  /* Opponent colors → Amber */
  --color-opponent-100: var(--color-amber-100);
  /* ... etc */

  /* Info colors → Cyan */
  --color-info-100: var(--color-cyan-100);
  /* ... etc */
}
```

This creates utility classes:
- `bg-user-600`, `text-user-300`, `border-user-400`, etc.
- `bg-opponent-800`, `text-opponent-300`, etc.
- `bg-info-500`, `text-info-400`, etc.
- All standard Tailwind utilities work with semantic names

---

## Further Reading

- [COLOR_CODE.md](../COLOR_CODE.md) - Original color system documentation
- [Tailwind CSS @theme](https://tailwindcss.com/docs/theme) - Tailwind v4 theming
- [Migration Script](../scripts/migrate-colors.ts) - Automated color migration tool

---

**Questions or suggestions?** Check the migration script code or update this documentation!
