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
    icon: '⏳',
    text: 'Ждите хода...',
    className: 'text-orange-300 bg-orange-950 border-orange-700',
  },
  'select-cell': {
    icon: '👆',
    text: 'Шаг 1: Выберите пустую клетку',
    className: 'text-cyan-200 bg-cyan-950 border-cyan-700',
  },
  'select-letter': {
    icon: '🔤',
    text: 'Шаг 2: Выберите букву',
    className: 'text-cyan-200 bg-cyan-950 border-cyan-700',
  },
  'build-word': {
    icon: '✍️',
    text: 'Шаг 3: Составьте слово из букв',
    className: 'text-purple-200 bg-purple-950 border-purple-700',
  },
}

export const StatusMessage = memo(({ step }: StatusMessageProps) => {
  const config = stepConfig[step]

  return (
    <div className={cn(
      'px-4 py-3 border-2 shadow-depth-1 font-bold text-base',
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
