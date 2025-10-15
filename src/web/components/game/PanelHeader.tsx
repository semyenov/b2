import { cn } from '@utils/classNames'

export interface PanelHeaderProps {
  title: string
  iconColor?: 'info' | 'success' | 'warning'
  className?: string
}

/**
 * Shared Panel Header Component
 * Provides consistent header styling across all game panels
 */
export function PanelHeader({ title, iconColor = 'info', className }: PanelHeaderProps) {
  const iconColorClass = {
    info: 'bg-info-400',
    success: 'bg-success-400',
    warning: 'bg-warning-400',
  }[iconColor]

  return (
    <div className={cn(
      'px-4 py-4 border-b shrink-0 transition-all duration-300',
      'bg-surface-900 border-surface-700',
      className,
    )}
    >
      <div className="flex items-center justify-center">
        <div className="flex items-center gap-2">
          <div className={cn('w-3 h-3 rounded-full', iconColorClass)} />
          <div className="text-sm font-bold text-surface-300 uppercase">
            {title}
          </div>
        </div>
      </div>
    </div>
  )
}
