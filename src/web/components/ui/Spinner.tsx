import type { HTMLAttributes } from 'react'
import { memo } from 'react'
import { cn } from '../../utils/classNames'

/**
 * Spinner sizes
 */
export type SpinnerSize = 'sm' | 'md' | 'lg' | 'xl'

interface SpinnerProps extends Omit<HTMLAttributes<HTMLDivElement>, 'className'> {
  /**
   * Spinner size
   * @default 'md'
   */
  size?: SpinnerSize

  /**
   * Label text displayed next to spinner
   */
  label?: string

  /**
   * Additional className
   */
  className?: string
}

/**
 * Size styles mapping
 */
const sizeStyles: Record<SpinnerSize, { spinner: string, text: string }> = {
  sm: {
    spinner: 'h-4 w-4 border-2',
    text: 'text-xs',
  },
  md: {
    spinner: 'h-6 w-6 border-2',
    text: 'text-sm',
  },
  lg: {
    spinner: 'h-8 w-8 border-4',
    text: 'text-base',
  },
  xl: {
    spinner: 'h-12 w-12 border-4',
    text: 'text-lg',
  },
}

/**
 * Spinner - Loading indicator component
 *
 * Consolidates spinner patterns from SuggestionsPanel, Banner
 * Provides consistent loading UI
 *
 * @example
 * ```tsx
 * <Spinner size="lg" label="Загрузка подсказок..." />
 * ```
 */
export const Spinner = memo(
  ({
    size = 'md',
    label,
    className,
    ...props
  }: SpinnerProps) => {
    const styles = sizeStyles[size]

    return (
      <div
        className={cn(
          'flex items-center justify-center gap-3',
          className,
        )}
        role="status"
        aria-live="polite"
        {...props}
      >

        {/* Label */}
        {label && (
          <span className={cn('text-gray-400 font-semibold', styles.text)}>
            {label}
          </span>
        )}

        {/* Screen reader text */}
        <span className="sr-only">
          {label || 'Загрузка...'}
        </span>
      </div>
    )
  },
)

Spinner.displayName = 'Spinner'
