interface StatusMessageProps {
  step: 'waiting' | 'select-cell' | 'select-letter' | 'build-word' | 'ready'
  word?: string
}

const stepConfig = {
  waiting: {
    icon: '⏳',
    text: 'Ждите хода...',
    color: 'text-orange-300',
    bg: 'bg-orange-900 bg-opacity-50',
    border: 'border-orange-700',
  },
  'select-cell': {
    icon: '👆',
    text: 'Шаг 1: Выберите пустую клетку',
    color: 'text-cyan-200',
    bg: 'bg-cyan-900 bg-opacity-30',
    border: 'border-cyan-700',
  },
  'select-letter': {
    icon: '🔤',
    text: 'Шаг 2: Выберите букву',
    color: 'text-blue-200',
    bg: 'bg-blue-900 bg-opacity-30',
    border: 'border-blue-700',
  },
  'build-word': {
    icon: '✍️',
    text: 'Шаг 3: Составьте слово из букв',
    color: 'text-purple-200',
    bg: 'bg-purple-900 bg-opacity-30',
    border: 'border-purple-700',
  },
  ready: {
    icon: '📤',
    text: 'send:',
    color: 'text-green-300',
    bg: 'bg-green-900 bg-opacity-30',
    border: 'border-green-700',
  },
}

export function StatusMessage({ step, word }: StatusMessageProps) {
  const config = stepConfig[step]

  return (
    <div className={`px-[var(--spacing-resp-lg)] py-[var(--spacing-resp-xs)] ${config.color} ${config.bg} border-2 ${config.border} shadow-depth-1 font-bold text-[var(--text-resp-sm)]`}>
      {config.icon}
      {' '}
      {config.text}
      {step === 'ready' && word && (
        <>
          {' '}
          <span className="text-[var(--text-resp-base)] font-black tracking-wider">{word}</span>
        </>
      )}
    </div>
  )
}
