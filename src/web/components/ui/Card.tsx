import type { HTMLAttributes, ReactNode } from 'react'
import { forwardRef, memo } from 'react'
import { cn } from '../../utils/classNames'

/**
 * Card variants define visual style
 */
export type CardVariant = 'default' | 'elevated' | 'bordered' | 'gradient'

/**
 * Card padding presets
 */
export type CardPadding = 'none' | 'compact' | 'default' | 'spacious'

interface CardProps extends Omit<HTMLAttributes<HTMLDivElement>, 'className'> {
  /**
   * Visual variant
   * @default 'default'
   */
  variant?: CardVariant

  /**
   * Padding preset
   * @default 'default'
   */
  padding?: CardPadding

  /**
   * Card content
   */
  children: ReactNode

  /**
   * Additional className
   */
  className?: string

  /**
   * Make card interactive (cursor pointer, hover effects)
   * @default false
   */
  interactive?: boolean
}

/**
 * Variant styles mapping
 */
const variantStyles: Record<CardVariant, string> = {
  default: 'bg-gray-800 border-2 border-gray-700 shadow-depth-2',
  elevated: 'bg-gradient-to-br from-gray-800 to-gray-900 border-2 border-gray-700 shadow-depth-3',
  bordered: 'bg-gray-800 border-2 border-gray-600 shadow-depth-1',
  gradient: 'bg-gradient-to-br from-gray-800 to-gray-900 shadow-depth-3 border-2 border-gray-700',
}

/**
 * Padding styles mapping
 */
const paddingStyles: Record<CardPadding, string> = {
  none: 'p-0',
  compact: 'p-4',
  default: 'p-6',
  spacious: 'p-8',
}

/**
 * Card - Unified container component
 *
 * Consolidates card patterns from CreateGame, GameList, menu screens
 * Provides consistent styling for content containers
 *
 * @example
 * ```tsx
 * <Card variant="elevated" padding="spacious">
 *   <h2>Card Title</h2>
 *   <p>Card content</p>
 * </Card>
 * ```
 */
export const Card = memo(
  forwardRef<HTMLDivElement, CardProps>(
    (
      {
        variant = 'default',
        padding = 'default',
        children,
        className,
        interactive = false,
        ...props
      },
      ref,
    ) => {
      return (
        <div
          ref={ref}
          className={cn(
            // Base styles
            'transition-all duration-200',
            // Variant styles
            variantStyles[variant],
            // Padding
            paddingStyles[padding],
            // Interactive
            interactive && 'cursor-pointer hover:scale-105 hover:border-cyan-500 hover:shadow-depth-3',
            // Custom className
            className,
          )}
          {...props}
        >
          {children}
        </div>
      )
    },
  ),
)

Card.displayName = 'Card'
