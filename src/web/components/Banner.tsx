import { memo } from 'react'
import { cn } from '../utils/classNames'

export interface BannerProps {
  variant: 'error' | 'loading' | 'warning'
  message: string
  onClose?: () => void
}

/**
 * Banner Component
 * Toast-style notification that appears in the top-right corner
 * Supports error, loading, and warning variants with optional close button
 */
const variantStyles = {
  error: 'bg-red-700 border-red-600',
  loading: 'bg-blue-600 border-blue-500',
  warning: 'bg-yellow-700 border-yellow-600',
}

export const Banner = memo(({ variant, message, onClose }: BannerProps) => {
  return (
    <div className={cn(
      'fixed top-4 right-4 text-white px-4 py-3 shadow-depth-3 z-50 border-2',
      variantStyles[variant],
    )}
    >
      <div className="flex items-center gap-2">
        {variant === 'loading' && (
          <div className="animate-spin h-4 w-4 border-b-2 border-white" />
        )}
        <span className="text-base">{message}</span>
        {onClose && (
          <button
            onClick={onClose}
            className="ml-4 hover:bg-slate-700 px-2 py-1 transition-all duration-200"
          >
            ✕
          </button>
        )}
      </div>
    </div>
  )
})

Banner.displayName = 'Banner'
