import { memo } from 'react'
import { cn } from '../utils/classNames'

interface BannerProps {
  variant: 'error' | 'loading' | 'warning'
  message: string
  onClose?: () => void
}

const variantStyles = {
  error: 'bg-red-700 border-red-600',
  loading: 'bg-blue-600 border-blue-500',
  warning: 'bg-yellow-700 border-yellow-600',
}

export const Banner = memo(({ variant, message, onClose }: BannerProps) => {
  return (
    <div className={cn(
      'fixed top-4 right-4 text-white px-4 sm:px-6 py-2.5 sm:py-3 z-50 border-2',
      variantStyles[variant],
    )}
    >
      <div className="flex items-center gap-3">
        {variant === 'loading' && (
          <div className="animate-spin h-4 w-4 border-b-2 border-white" />
        )}
        <span className="text-base sm:text-lg font-medium">{message}</span>
        {onClose && (
          <button
            onClick={onClose}
            className="ml-4 hover:bg-opacity-80 px-3 py-1.5 transition-opacity duration-150 font-bold"
            aria-label="Закрыть уведомление"
          >
            ×
          </button>
        )}
      </div>
    </div>
  )
})

Banner.displayName = 'Banner'
