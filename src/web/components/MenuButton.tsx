import { memo } from 'react'
import { cn } from '../utils/classNames'

interface MenuButtonProps {
  icon: string
  label: string
  variant: 'primary' | 'secondary' | 'success' | 'warning'
  size?: 'large' | 'normal'
  onClick: () => void
}

const variantStyles = {
  primary: 'from-blue-600 to-blue-700 hover:from-blue-500 hover:to-blue-600',
  secondary: 'from-purple-600 to-purple-700 hover:from-purple-500 hover:to-purple-600',
  success: 'from-green-600 to-green-700 hover:from-green-500 hover:to-green-600',
  warning: 'from-yellow-600 to-amber-600 hover:from-yellow-500 hover:to-amber-500',
}

export const MenuButton = memo(({ icon, label, variant, size = 'normal', onClick }: MenuButtonProps) => {
  return (
    <button
      onClick={onClick}
      className={cn(
        'w-full group relative px-4 lg:px-8 py-3 lg:py-6 bg-gradient-to-r font-bold text-white shadow-depth-2 hover:shadow-depth-3 transition-all duration-200 transform hover:scale-105 overflow-hidden',
        variantStyles[variant],
        {
          'text-lg': size === 'large',
          'text-base': size === 'normal',
        },
      )}
    >
      <div className="absolute inset-0 bg-white opacity-0 group-hover:opacity-20 transition-opacity duration-200"></div>
      <div className="relative flex items-center justify-center gap-2 lg:gap-4">
        <span className={cn({
          'text-xl': size === 'large',
          'text-lg': size === 'normal',
        })}
        >
          {icon}
        </span>
        <span>{label}</span>
      </div>
    </button>
  )
})

MenuButton.displayName = 'MenuButton'
