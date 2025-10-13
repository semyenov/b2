import type { HTMLAttributes, ReactNode } from 'react'
import { forwardRef, memo } from 'react'
import { cn } from '../../utils/classNames'

/**
 * Badge variants define color scheme
 */
export type BadgeVariant = 'success' | 'warning' | 'danger' | 'info' | 'gray'

/**
 * Badge sizes
 */
export type BadgeSize = 'sm' | 'md' | 'lg'

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
  success: 'bg-green-900 text-green-300 border-green-600',
  warning: 'bg-yellow-900 text-yellow-300 border-yellow-600',
  danger: 'bg-red-900 text-red-300 border-red-600',
  info: 'bg-blue-900 text-blue-300 border-blue-600',
  gray: 'bg-slate-700 text-slate-300 border-slate-600',
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
