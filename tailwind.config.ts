import type { Config } from 'tailwindcss'

/**
 * Tailwind CSS Configuration with Semantic Color Aliases
 *
 * This configuration extends Tailwind v4 with semantic color naming
 * that reflects the intent and meaning rather than the actual color.
 *
 * Benefits:
 * - Clearer code: `bg-user-600` vs `bg-yellow-600`
 * - Easy rebranding: Change colors in one place
 * - Type safety: Autocomplete for semantic names
 * - Consistency: Forces semantic thinking
 *
 * Color System:
 * - user/player/active/success → yellow (user actions)
 * - opponent/warning → amber (opponent actions, warnings)
 * - info/suggestion → cyan (informational elements)
 * - neutral/surface → slate (backgrounds, borders)
 * - danger/error → red (errors, destructive actions)
 */
export default {
  content: [
    './src/web/**/*.{ts,tsx,js,jsx}',
    './index.html',
  ],
} satisfies Config
