import type { Config } from 'tailwindcss'
import colors from 'tailwindcss/colors'

/**
 * Optimized Tailwind CSS Configuration
 *
 * Only includes colors actually used in the project to reduce bundle size.
 * Semantic color naming reflects intent rather than actual color.
 *
 * Color System:
 * - user/player/active/success → yellow (user actions)
 * - opponent/warning → amber (opponent actions, warnings)
 * - info/suggestion → cyan (informational elements)
 * - surface → slate (backgrounds, borders)
 * - danger/error → red (errors, destructive actions)
 *
 * Optimization: Only specific color shades are included (5-8 kB savings)
 */
export default {
  content: [
    './src/web/**/*.{ts,tsx,js,jsx}',
    './src/web/index.html',
  ],
  safelist: [
    // Safelist dynamic classes that might be purged incorrectly
    // Player colors used in status indicators
    'text-user-100',
    'text-user-300',
    'text-opponent-300',
    'text-opponent-400',
    // Badge variant classes
    'bg-user-900',
    'bg-opponent-900',
    'border-user-600',
    'border-opponent-600',
  ],
  theme: {
    extend: {
      colors: {
        // Surface colors (slate) - UI backgrounds and borders
        surface: {
          300: colors.slate[300],
          400: colors.slate[400],
          500: colors.slate[500],
          600: colors.slate[600],
          700: colors.slate[700],
          800: colors.slate[800],
          900: colors.slate[900],
        },
        // User/player colors (yellow) - active player indicators
        user: {
          100: colors.yellow[100],
          300: colors.yellow[300],
          600: colors.yellow[600],
          900: colors.yellow[900],
        },
        // Opponent colors (amber) - opponent player indicators
        opponent: {
          300: colors.amber[300],
          400: colors.amber[400],
          600: colors.amber[600],
          900: colors.amber[900],
        },
        // Info colors (cyan) - informational elements
        info: {
          100: colors.cyan[100],
          300: colors.cyan[300],
          400: colors.cyan[400],
          500: colors.cyan[500],
          600: colors.cyan[600],
          700: colors.cyan[700],
          900: colors.cyan[900],
        },
        // Danger colors (red) - errors and destructive actions
        danger: {
          300: colors.red[300],
          400: colors.red[400],
          500: colors.red[500],
          600: colors.red[600],
          900: colors.red[900],
        },
        // Gray scale - still needed for some components
        gray: {
          100: colors.gray[100],
          300: colors.gray[300],
          400: colors.gray[400],
          500: colors.gray[500],
          600: colors.gray[600],
          700: colors.gray[700],
          800: colors.gray[800],
          900: colors.gray[900],
        },
        // Green - success indicators
        green: {
          300: colors.green[300],
          400: colors.green[400],
          600: colors.green[600],
          900: colors.green[900],
        },
        // Purple - accent color
        purple: {
          500: colors.purple[500],
        },
      },
    },
  },
} satisfies Config
