import { UI_MESSAGES } from '@constants/messages'
import { cn } from '@utils/classNames'
import { memo, useEffect } from 'react'

export interface BannerProps {
  variant: 'error' | 'loading' | 'warning'
  message: string
  onClose?: () => void
  /**
   * Auto-dismiss duration in milliseconds
   * @default 5000 (5 seconds)
   */
  autoDismissMs?: number
}

/**
 * Banner Component
 * Status panel notification that appears in the top-right corner
 * Auto-dismisses after 5 seconds (configurable) with smooth animations
 * Supports error, loading, and warning variants with optional close button
 */
const variantStyles = {
  error: 'bg-danger-900/95 border-danger-700/80 text-danger-100',
  loading: 'bg-surface-800/95 border-surface-600/80 text-surface-100',
  warning: 'bg-user-900/95 border-user-700/80 text-user-100',
}

export const Banner = memo(({ variant, message, onClose, autoDismissMs = 5000 }: BannerProps) => {
  // Auto-dismiss after specified duration (except for loading variant)
  useEffect(() => {
    if (variant !== 'loading' && onClose && autoDismissMs > 0) {
      const timer = setTimeout(() => {
        onClose()
      }, autoDismissMs)

      return () => clearTimeout(timer)
    }
    return undefined
  }, [variant, onClose, autoDismissMs])

  return (
    <div
      className={cn(
        'fixed top-4 right-4 px-5 py-3 z-50 border',
        'shadow-2xl backdrop-blur-sm',
        'animate-slide-in-right',
        'min-w-[280px] max-w-[400px]',
        variantStyles[variant],
      )}
    >
      <div className="flex items-center gap-3">
        {variant === 'loading' && (
          <div className="animate-spin h-5 w-5 border-2 border-surface-400 border-t-transparent rounded-full" />
        )}
        <span className="text-base font-semibold flex-1 uppercase tracking-wide">{message}</span>
        {onClose && variant !== 'loading' && (
          <button
            onClick={onClose}
            className="ml-2 hover:bg-white/10 px-2 py-1 transition-all duration-200 text-sm opacity-70 hover:opacity-100"
            aria-label={UI_MESSAGES.BANNER_CLOSE_ARIA}
          >
            ✕
          </button>
        )}
      </div>
    </div>
  )
})

Banner.displayName = 'Banner'
