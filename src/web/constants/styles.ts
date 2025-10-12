/**
 * Reusable style constants for UI components
 * Extracts common className patterns to reduce duplication
 */

/**
 * Common button style patterns
 * Use with cn() utility to compose button classes
 */
export const BUTTON_STYLES = {
  /**
   * Base styles applied to all buttons
   * Includes: font weight, transitions, hover effects
   */
  base: 'font-bold transition-all duration-200 hover:shadow-depth-2 hover:scale-105 flex-shrink-0',

  /**
   * Standard button padding (responsive)
   * Small on mobile, medium on desktop
   */
  padding: {
    standard: 'px-[var(--spacing-resp-sm)] sm:px-[var(--spacing-resp-md)] py-[var(--spacing-resp-xs)]',
    compact: 'px-[var(--spacing-resp-xs)] sm:px-[var(--spacing-resp-sm)] py-[var(--spacing-resp-xs)]',
  },

  /**
   * Text size variants (responsive)
   */
  textSize: {
    standard: 'text-[var(--text-resp-xs)] sm:text-[var(--text-resp-sm)]',
    base: 'text-[var(--text-resp-base)]',
  },

  /**
   * Color variants for different button types
   */
  variants: {
    /** Gray button (exit, secondary actions) */
    gray: 'bg-gray-700 hover:bg-gray-600 border-2 border-gray-600 text-gray-200',

    /** Clear/cancel button */
    muted: 'bg-gray-600 hover:bg-gray-500 text-white',

    /** Success/submit button with gradient */
    success: 'bg-gradient-to-r from-green-600 to-green-700 hover:from-green-500 hover:to-green-600 border-2 border-green-400 text-white shadow-depth-3 hover:shadow-depth-4 hover:scale-110 animate-pulse-glow',

    /** Warning/AI button (active state) */
    warningActive: 'bg-yellow-700 hover:bg-yellow-600 text-white shadow-depth-3',

    /** Warning/AI button (inactive state) */
    warningInactive: 'bg-yellow-600 hover:bg-yellow-700 text-white',
  },

  /**
   * Disabled state styling
   */
  disabled: 'disabled:opacity-40 disabled:cursor-not-allowed',

  /**
   * Flex layout helpers for button content
   */
  layout: {
    row: 'flex items-center gap-1 sm:gap-2',
    centered: 'flex items-center justify-center gap-1 sm:gap-2',
  },

  /**
   * Text styling for button content
   */
  content: {
    uppercase: 'uppercase tracking-wider',
    nowrap: 'whitespace-nowrap',
  },
} as const

/**
 * Panel/container style patterns
 */
export const PANEL_STYLES = {
  /**
   * Overlay panel that slides up from bottom
   */
  slideUpOverlay: 'absolute bottom-0 left-0 right-0 z-10 bg-gray-800 border-2 border-gray-700 flex flex-col min-h-[180px] max-h-[280px] shadow-[0_-8px_24px_rgba(0,0,0,0.5)] transition-transform duration-300 ease-in-out',
} as const
