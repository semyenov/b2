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

export function MenuButton({ icon, label, variant, size = 'normal', onClick }: MenuButtonProps) {
  const sizeClass = size === 'large' ? 'text-lg' : 'text-base'

  return (
    <button
      onClick={onClick}
      className={`w-full group relative px-[var(--spacing-resp-lg)] py-[var(--spacing-resp-md)] bg-gradient-to-r ${variantStyles[variant]} ${sizeClass} font-bold text-white shadow-depth-2 hover:shadow-depth-3 transition-all duration-200 transform hover:scale-105 overflow-hidden`}
    >
      <div className="absolute inset-0 bg-white opacity-0 group-hover:opacity-20 transition-opacity duration-200"></div>
      <div className="relative flex items-center justify-center gap-[var(--spacing-resp-sm)]">
        <span className={size === 'large' ? 'text-xl' : 'text-lg'}>{icon}</span>
        <span>{label}</span>
      </div>
    </button>
  )
}
