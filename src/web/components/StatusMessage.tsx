import { cn } from '../utils/classNames'

interface StatusMessageProps {
  step: 'waiting' | 'select-cell' | 'select-letter' | 'build-word'
}

const stepConfig = {
  'waiting': {
    icon: '⏳',
    text: 'Ждите хода...',
    className: 'text-orange-300 bg-orange-900 bg-opacity-50 border-orange-700',
  },
  'select-cell': {
    icon: '👆',
    text: 'Шаг 1: Выберите пустую клетку',
    className: 'text-cyan-200 bg-cyan-900 bg-opacity-30 border-cyan-700',
  },
  'select-letter': {
    icon: '🔤',
    text: 'Шаг 2: Выберите букву',
    className: 'text-blue-200 bg-blue-900 bg-opacity-30 border-blue-700',
  },
  'build-word': {
    icon: '✍️',
    text: 'Шаг 3: Составьте слово из букв',
    className: 'text-purple-200 bg-purple-900 bg-opacity-30 border-purple-700',
  },
}

export function StatusMessage({ step }: StatusMessageProps) {
  const config = stepConfig[step]

  return (
    <div className={cn(
      'px-[var(--spacing-resp-lg)] py-[var(--spacing-resp-xs)] border-2 shadow-depth-1 font-bold text-[var(--text-resp-sm)]',
      config.className,
    )}
    >
      {config.icon}
      {' '}
      {config.text}
    </div>
  )
}
