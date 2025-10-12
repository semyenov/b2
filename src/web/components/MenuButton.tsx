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
  primary: 'bg-blue-600 hover:bg-blue-500 border-blue-500',
  secondary: 'bg-purple-600 hover:bg-purple-500 border-purple-500',
  success: 'bg-green-600 hover:bg-green-500 border-green-500',
  warning: 'bg-yellow-600 hover:bg-yellow-500 border-yellow-500',
}

export const MenuButton = memo(({ icon, label, variant, size = 'normal', onClick }: MenuButtonProps) => {
  return (
    <button
      onClick={onClick}
      className={cn(
        'w-full px-4 py-3 border font-bold text-white transition-colors duration-150',
        variantStyles[variant],
        {
          'text-lg': size === 'large',
          'text-base': size === 'normal',
        },
      )}
    >
      <div className="flex items-center justify-center gap-2">
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
