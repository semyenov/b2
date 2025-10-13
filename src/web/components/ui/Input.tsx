import type { InputHTMLAttributes, ReactNode } from 'react'
import { forwardRef, memo } from 'react'
import { cn } from '../../utils/classNames'

interface InputProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'className'> {
  /**
   * Input label
   */
  label?: ReactNode

  /**
   * Help text displayed below input
   */
  helpText?: string

  /**
   * Error message (shows error state)
   */
  error?: string

  /**
   * Additional className for input element
   */
  className?: string

  /**
   * Additional className for wrapper div
   */
  wrapperClassName?: string
}

/**
 * Input - Form input component with label and validation
 *
 * Consolidates input patterns from CreateGame
 * Provides consistent styling and error handling
 *
 * @example
 * ```tsx
 * <Input
 *   label="Базовое слово"
 *   placeholder="БАЛДА"
 *   error={error}
 *   helpText="Слово будет размещено в центре доски"
 * />
 * ```
 */
export const Input = memo(
  forwardRef<HTMLInputElement, InputProps>(
    (
      {
        label,
        helpText,
        error,
        className,
        wrapperClassName,
        id,
        ...props
      },
      ref,
    ) => {
      const inputId = id || `input-${Math.random().toString(36).substring(7)}`
      const helpTextId = `${inputId}-help`
      const errorId = `${inputId}-error`

      return (
        <div className={cn('space-y-2', wrapperClassName)}>
          {/* Label */}
          {label && (
            <label
              htmlFor={inputId}
              className="block text-base font-bold text-gray-300"
            >
              {label}
            </label>
          )}

          {/* Input */}
          <input
            ref={ref}
            id={inputId}
            aria-invalid={error ? 'true' : 'false'}
            aria-describedby={cn(
              helpText && helpTextId,
              error && errorId,
            )}
            className={cn(
              // Base styles
              'w-full px-6 py-4 font-bold transition-all duration-200',
              // Colors
              'bg-gray-900 text-gray-100 placeholder-gray-600',
              // Border
              'border-2',
              error
                ? 'border-red-500 focus:border-red-400'
                : 'border-gray-700 focus:border-cyan-400',
              // Focus
              'focus:outline-none focus:ring-2',
              error
                ? 'focus:ring-red-400'
                : 'focus:ring-cyan-400',
              // Custom className
              className,
            )}
            {...props}
          />

          {/* Help text */}
          {helpText && !error && (
            <p id={helpTextId} className="text-xs text-gray-500">
              {helpText}
            </p>
          )}

          {/* Error message */}
          {error && (
            <p
              id={errorId}
              role="alert"
              className="text-xs text-red-400 font-medium flex items-center gap-1"
            >
              <span aria-hidden="true">⚠️</span>
              {error}
            </p>
          )}
        </div>
      )
    },
  ),
)

Input.displayName = 'Input'
