import type { BadgeSize, BadgeVariant } from '@shared/config/types/ui-types'
import type { HTMLAttributes, ReactNode } from 'react'
import { cn } from '@utils/classNames'
import { forwardRef, memo } from 'react'

interface BadgeProps extends Omit<HTMLAttributes<HTMLSpanElement>, 'className'> {
  /**
   * Visual variant
   * @default 'gray'
   */
  variant?: BadgeVariant

  /**
   * Size
   * @default 'md'
   */
  size?: BadgeSize

  /**
   * Badge content
   */
  children: ReactNode

  /**
   * Additional className
   */
  className?: string
}

/**
 * Variant styles mapping
 */
const variantStyles: Record<BadgeVariant, string> = {
  success: 'bg-user-900 text-user-300 border-user-600',
  warning: 'bg-opponent-900 text-opponent-300 border-opponent-600',
  danger: 'bg-danger-900 text-danger-300 border-danger-600',
  info: 'bg-info-900 text-info-300 border-info-600',
  gray: 'bg-surface-700 text-surface-300 border-surface-600',
}

/**
 * Size styles mapping
 */
const sizeStyles: Record<BadgeSize, string> = {
  sm: 'px-1.5 py-0.5 text-xs',
  md: 'px-2.5 py-1 text-xs',
  lg: 'px-3 py-1.5 text-sm',
}

/**
 * Badge - Status indicator component
 *
 * Used for game status, player indicators, etc.
 * Consolidates badge patterns from GameList
 *
 * @example
 * ```tsx
 * <Badge variant="success" size="md">
 *   В процессе
 * </Badge>
 * ```
 */
export const Badge = memo(
  forwardRef<HTMLSpanElement, BadgeProps>(
    (
      {
        variant = 'gray',
        size = 'md',
        children,
        className,
        ...props
      },
      ref,
    ) => {
      return (
        <span
          ref={ref}
          className={cn(
            // Base styles
            'inline-block font-bold border transition-all duration-200',
            // Variant styles
            variantStyles[variant],
            // Size styles
            sizeStyles[size],
            // Custom className
            className,
          )}
          {...props}
        >
          {children}
        </span>
      )
    },
  ),
)

Badge.displayName = 'Badge'
