import { cn } from '@utils/classNames'
import { memo } from 'react'

export interface StatusMessageProps {
  step: 'waiting' | 'select-cell' | 'select-letter' | 'build-word'
  moveNumber?: number
}

/**
 * Status Message Component
 * Displays step-by-step game instructions in the control bar
 * Shows different messages with icons for each game phase
 */
const stepConfig = {
  'waiting': {
    icon: '',
    text: 'Ход противника',
    className: 'text-amber-300',
  },
  'select-cell': {
    icon: '',
    text: (moveNumber: number) => `Ход №${moveNumber}`,
    className: 'text-emerald-100',
  },
  'select-letter': {
    icon: '',
    text: 'Выбери букву',
    className: 'text-emerald-100',
  },
  'build-word': {
    icon: '',
    text: 'Составь слово',
    className: 'text-emerald-100',
  },
}

export const StatusMessage = memo(({ step, moveNumber = 1 }: StatusMessageProps) => {
  const config = stepConfig[step]
  const text = typeof config.text === 'function' ? config.text(moveNumber) : config.text

  return (
    <div className={cn(
      'px-4 py-3 font-bold text-2xl uppercase',
      config.className,
    )}
    >
      {config.icon}
      {' '}
      {text}
    </div>
  )
})

StatusMessage.displayName = 'StatusMessage'
