import type { ReactNode } from 'react'
import { cn } from '@utils/classNames'

export interface PanelContainerProps {
  children: ReactNode
  className?: string
}

/**
 * Shared Panel Container Component
 * Provides consistent flex layout for all game panels
 */
export function PanelContainer({ children, className }: PanelContainerProps) {
  return (
    <div className={cn('flex flex-col h-full w-full min-h-0', className)}>
      {children}
    </div>
  )
}
