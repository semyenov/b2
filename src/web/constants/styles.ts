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
    /** Slate button (exit, secondary actions) */
    gray: 'bg-slate-700 hover:bg-slate-600 border-2 border-slate-600 text-slate-200',

    /** Clear/cancel button */
    muted: 'bg-slate-600 hover:bg-slate-500 border-2 border-slate-500 text-white',

    /** Success/submit button */
    success: 'bg-green-600 hover:bg-green-500 border-2 border-green-500 text-white',

    /** Warning/AI button (active state) */
    warningActive: 'bg-yellow-600 hover:bg-yellow-500 border-2 border-yellow-500 text-white',

    /** Warning/AI button (inactive state) */
    warningInactive: 'bg-yellow-700 hover:bg-yellow-600 border-2 border-yellow-600 text-white',
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
  base: 'bg-slate-800 border-2 border-slate-700',

  /**
   * Card padding variants
   */
  padding: {
    small: 'p-[var(--spacing-resp-sm)]',
    medium: 'p-[var(--spacing-resp-md)]',
    large: 'p-[var(--spacing-resp-lg)]',
  },

  /**
   * Hover states for interactive cards
   */
  hover: 'hover:border-cyan-500 hover:bg-slate-700 transition-colors duration-150',

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
  base: 'w-full px-6 py-4 bg-slate-900 border-2 border-slate-700 focus:border-cyan-500 focus:outline-none transition-colors duration-150',

  /**
   * Input text styling
   */
  text: {
    standard: 'text-base font-medium text-slate-200',
    large: 'text-2xl font-bold text-cyan-400',
    centered: 'text-center',
    uppercase: 'uppercase tracking-widest',
  },

  /**
   * Placeholder styling
   */
  placeholder: 'placeholder-slate-600',
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
    secondary: 'text-slate-400',
    muted: 'text-slate-500',
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

/**
 * Padding patterns using CSS variables
 */
export const PADDING_STYLES = {
  /**
   * Container/wrapper padding
   */
  container: 'p-[var(--spacing-resp-md)]',

  /**
   * Card padding variants
   */
  card: {
    small: 'p-[var(--spacing-resp-sm)]',
    medium: 'p-[var(--spacing-resp-md)]',
    large: 'p-[var(--spacing-resp-lg)]',
  },

  /**
   * Section padding (directional)
   */
  section: {
    x: 'px-[var(--spacing-resp-md)]',
    y: 'py-[var(--spacing-resp-md)]',
    both: 'px-[var(--spacing-resp-md)] py-[var(--spacing-resp-md)]',
  },
} as const

/**
 * Margin patterns (standardized Tailwind values)
 */
export const MARGIN_STYLES = {
  /**
   * Bottom margins
   */
  bottom: {
    xs: 'mb-2',
    sm: 'mb-4',
    md: 'mb-6',
    lg: 'mb-8',
  },

  /**
   * Top margins
   */
  top: {
    xs: 'mt-2',
    sm: 'mt-4',
    md: 'mt-6',
    lg: 'mt-8',
  },
} as const
