/**
 * Shared UI Type Definitions
 * Type definitions used across multiple layers (shared, web, server)
 *
 * These types are extracted here to avoid circular dependencies.
 * For example, BadgeVariant was originally in web/components/ui/Badge.tsx,
 * but shared/config/suggestions.ts needed it, creating a backwards dependency.
 */

/**
 * Badge color variants
 * Used for visual classification in UI components
 *
 * @example
 * ```typescript
 * const variant: BadgeVariant = 'success' // Green badge
 * const variant: BadgeVariant = 'warning' // Yellow badge
 * ```
 */
export type BadgeVariant = 'success' | 'warning' | 'danger' | 'info' | 'gray'

/**
 * Badge sizes
 * Controls badge padding and font size
 */
export type BadgeSize = 'sm' | 'md' | 'lg'
