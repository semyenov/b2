import type { ButtonHTMLAttributes, ReactNode } from 'react'
import { forwardRef, memo } from 'react'
import { cn } from '../../utils/classNames'

/**
 * Button variants define the color scheme and styling
 */
export type ButtonVariant
  = | 'primary'
    | 'secondary'
    | 'success'
    | 'warning'
    | 'danger'
    | 'ghost'
    | 'muted'
    | 'gray'

/**
 * Button sizes determine padding and text size
 */
export type ButtonSize = 'xs' | 'sm' | 'md' | 'lg' | 'xl'

interface ButtonProps extends Omit<ButtonHTMLAttributes<HTMLButtonElement>, 'className'> {
  /**
   * Visual variant of the button
   * @default 'primary'
   */
  variant?: ButtonVariant

  /**
   * Size of the button
   * @default 'md'
   */
  size?: ButtonSize

  /**
   * Button content (text, icons, etc.)
   */
  children: ReactNode

  /**
   * Optional icon to display before text
   */
  leftIcon?: ReactNode

  /**
   * Optional icon to display after text
   */
  rightIcon?: ReactNode

  /**
   * Make button full width
   * @default false
   */
  fullWidth?: boolean

  /**
   * Additional className for custom styling
   */
  className?: string

  /**
   * Loading state with spinner
   * @default false
   */
  loading?: boolean
}

/**
 * Variant styles mapping
 */
const variantStyles: Record<ButtonVariant, string> = {
  primary: 'bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-500 hover:to-blue-600 text-white border-2 border-blue-500 shadow-depth-2 hover:shadow-depth-3',
  secondary: 'bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-500 hover:to-purple-600 text-white border-2 border-purple-500 shadow-depth-2 hover:shadow-depth-3',
  success: 'bg-gradient-to-r from-green-600 to-green-700 hover:from-green-500 hover:to-green-600 text-white border-2 border-green-400 shadow-depth-2 hover:shadow-depth-3 animate-pulse-glow',
  warning: 'bg-gradient-to-r from-yellow-600 to-amber-600 hover:from-yellow-500 hover:to-amber-500 text-white border-2 border-yellow-500 shadow-depth-2 hover:shadow-depth-3',
  danger: 'bg-gradient-to-r from-red-600 to-red-700 hover:from-red-500 hover:to-red-600 text-white border-2 border-red-500 shadow-depth-2 hover:shadow-depth-3',
  ghost: 'bg-transparent hover:bg-gray-800 text-gray-300 hover:text-white border-2 border-transparent hover:border-gray-600',
  muted: 'bg-gray-600 hover:bg-gray-500 text-white shadow-depth-1 hover:shadow-depth-2',
  gray: 'bg-gray-700 hover:bg-gray-600 text-gray-200 border-2 border-gray-600 shadow-depth-1 hover:shadow-depth-2',
}

/**
 * Size styles mapping
 */
const sizeStyles: Record<ButtonSize, string> = {
  xs: 'px-2 py-1 text-xs',
  sm: 'px-4 py-3 text-sm',
  md: 'px-5 py-3.5 text-base',
  lg: 'px-7 py-4 text-lg',
  xl: 'px-9 py-5 text-xl',
}

/**
 * Button - Unified button primitive
 *
 * Consolidates all button patterns from MenuButton, ControlButtons, CreateGame, GameList
 * Supports multiple variants, sizes, icons, and loading states
 *
 * @example
 * ```tsx
 * <Button variant="success" size="lg" leftIcon="⚡">
 *   Quick Start
 * </Button>
 * ```
 */
export const Button = memo(
  forwardRef<HTMLButtonElement, ButtonProps>(
    (
      {
        variant = 'primary',
        size = 'md',
        children,
        leftIcon,
        rightIcon,
        fullWidth = false,
        className,
        loading = false,
        disabled,
        ...props
      },
      ref,
    ) => {
      return (
        <button
          ref={ref}
          disabled={disabled || loading}
          className={cn(
            // Base styles
            'font-bold transition-all duration-200 hover:scale-105 active:scale-95 flex items-center justify-center gap-2 relative overflow-hidden',
            // Variant styles
            variantStyles[variant],
            // Size styles
            sizeStyles[size],
            // Width
            fullWidth && 'w-full',
            // Disabled state
            (disabled || loading) && 'opacity-40 cursor-not-allowed hover:scale-100',
            // Custom className
            className,
          )}
          {...props}
        >
          {/* Hover effect overlay for gradient buttons */}
          {(variant === 'primary' || variant === 'secondary' || variant === 'success' || variant === 'warning') && (
            <div className="absolute inset-0 bg-white opacity-0 group-hover:opacity-20 transition-opacity duration-200" />
          )}

          {/* Content */}
          <div className="relative flex items-center justify-center gap-2">
            {loading && (
              <div className="animate-spin h-4 w-4 border-b-2 border-white" />
            )}
            {!loading && leftIcon && <span aria-hidden="true">{leftIcon}</span>}
            <span>{children}</span>
            {!loading && rightIcon && <span aria-hidden="true">{rightIcon}</span>}
          </div>
        </button>
      )
    },
  ),
)

Button.displayName = 'Button'
