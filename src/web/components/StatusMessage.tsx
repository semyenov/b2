import { memo } from 'react'
import { cn } from '../utils/classNames'

interface StatusMessageProps {
  step: 'waiting' | 'select-cell' | 'select-letter' | 'build-word'
}

const stepConfig = {
  'waiting': {
    text: 'Ждите хода...',
    className: 'text-orange-300 bg-orange-900 bg-opacity-50 border-orange-700',
  },
  'select-cell': {
    text: 'Шаг 1: Выберите пустую клетку',
    className: 'text-cyan-200 bg-cyan-900 bg-opacity-30 border-cyan-700',
  },
  'select-letter': {
    text: 'Шаг 2: Выберите букву',
    className: 'text-blue-200 bg-blue-900 bg-opacity-30 border-blue-700',
  },
  'build-word': {
    text: 'Шаг 3: Составьте слово из букв',
    className: 'text-purple-200 bg-purple-900 bg-opacity-30 border-purple-700',
  },
}

export const StatusMessage = memo(({ step }: StatusMessageProps) => {
  const config = stepConfig[step]

  return (
    <div className={cn(
      'px-4 sm:px-6 py-2.5 sm:py-3 border font-bold text-base sm:text-lg',
      config.className,
    )}
    >
      {config.text}
    </div>
  )
})

StatusMessage.displayName = 'StatusMessage'
