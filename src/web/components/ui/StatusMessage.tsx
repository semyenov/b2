import { memo } from 'react'
import { cn } from '../../utils/classNames'

export interface StatusMessageProps {
  step: 'waiting' | 'select-cell' | 'select-letter' | 'build-word'
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
    className: 'text-orange-300',
  },
  'select-cell': {
    icon: '',
    text: 'Выбери пустую клетку',
    className: 'text-cyan-200',
  },
  'select-letter': {
    icon: '',
    text: 'Выбери букву',
    className: 'text-cyan-200',
  },
  'build-word': {
    icon: '',
    text: 'Составь слово',
    className: 'text-purple-200',
  },
}

export const StatusMessage = memo(({ step }: StatusMessageProps) => {
  const config = stepConfig[step]

  return (
    <div className={cn(
      'px-4 py-3 font-bold text-2xl uppercase',
      config.className,
    )}
    >
      {config.icon}
      {' '}
      {config.text}
    </div>
  )
})

StatusMessage.displayName = 'StatusMessage'
