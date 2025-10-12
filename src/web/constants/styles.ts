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
    standard: 'px-4 sm:px-6 py-2.5 sm:py-3',
    compact: 'px-3 py-2.5',
  },

  /**
   * Text size variants
   */
  textSize: {
    standard: 'text-base sm:text-lg',
    base: 'text-lg',
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
    row: 'flex items-center gap-2 sm:gap-3',
    centered: 'flex items-center justify-center gap-2 sm:gap-3',
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
 * Card/container style patterns
 */
export const CARD_STYLES = {
  /**
   * Base card styling
   */
  base: 'bg-gray-800 border-2 border-gray-700',

  /**
   * Card padding variants
   */
  padding: {
    small: 'p-4',
    medium: 'p-6',
    large: 'p-8',
  },

  /**
   * Hover states for interactive cards
   */
  hover: 'hover:border-cyan-500 hover:bg-gray-750 transition-colors duration-150',

  /**
   * Interactive card (clickable)
   */
  interactive: 'cursor-pointer',
} as const

/**
 * Input field style patterns
 */
export const INPUT_STYLES = {
  /**
   * Base text input styling
   */
  base: 'w-full px-6 py-4 bg-gray-900 border-2 border-gray-700 focus:border-cyan-500 focus:outline-none transition-colors duration-150',

  /**
   * Input text styling
   */
  text: {
    standard: 'text-base font-medium text-gray-200',
    large: 'text-2xl font-bold text-cyan-400',
    centered: 'text-center',
    uppercase: 'uppercase tracking-widest',
  },

  /**
   * Placeholder styling
   */
  placeholder: 'placeholder-gray-600',
} as const

/**
 * Text hierarchy patterns
 */
export const TEXT_STYLES = {
  /**
   * Heading sizes
   */
  heading: {
    h1: 'text-4xl md:text-5xl font-bold',
    h2: 'text-3xl font-bold',
    h3: 'text-2xl font-bold',
    h4: 'text-xl font-bold',
  },

  /**
   * Body text sizes
   */
  body: {
    large: 'text-lg',
    base: 'text-base',
    small: 'text-sm',
    xs: 'text-xs',
  },

  /**
   * Text colors
   */
  color: {
    primary: 'text-cyan-400',
    secondary: 'text-gray-400',
    muted: 'text-gray-500',
    error: 'text-red-400',
    success: 'text-green-400',
    warning: 'text-yellow-400',
  },
} as const

/**
 * Spacing/gap patterns
 */
export const SPACING_STYLES = {
  gap: {
    xs: 'gap-2',
    sm: 'gap-3',
    md: 'gap-4',
    lg: 'gap-6',
  },
  space: {
    xs: 'space-y-2',
    sm: 'space-y-3',
    md: 'space-y-4',
    lg: 'space-y-6',
  },
} as const
