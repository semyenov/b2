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
   * Includes: font weight, transitions
   */
  base: 'font-bold transition-colors duration-150 flex-shrink-0',

  /**
   * Standard button padding
   */
  padding: {
    standard: 'px-2 sm:px-4 py-1.5',
    compact: 'px-2 py-1.5',
  },

  /**
   * Text size variants
   */
  textSize: {
    standard: 'text-sm sm:text-base',
    base: 'text-base',
  },

  /**
   * Color variants for different button types
   */
  variants: {
    /** Gray button (exit, secondary actions) */
    gray: 'bg-gray-700 hover:bg-gray-600 border border-gray-600 text-gray-200',

    /** Clear/cancel button */
    muted: 'bg-gray-600 hover:bg-gray-500 border border-gray-500 text-white',

    /** Success/submit button */
    success: 'bg-green-600 hover:bg-green-500 border border-green-500 text-white',

    /** Warning/AI button (active state) */
    warningActive: 'bg-yellow-600 hover:bg-yellow-500 border border-yellow-500 text-white',

    /** Warning/AI button (inactive state) */
    warningInactive: 'bg-yellow-700 hover:bg-yellow-600 border border-yellow-600 text-white',
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
  slideUpOverlay: 'absolute bottom-0 left-0 right-0 z-10 bg-gray-800 border border-gray-700 flex flex-col min-h-[180px] max-h-[280px]',
} as const
