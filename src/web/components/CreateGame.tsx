import type { CreateGameBody } from '../lib/client'
import { BOARD_SIZES } from '../constants/game'
import { useCreateGameForm } from '../hooks/useCreateGameForm'
import { cn } from '../utils/classNames'

interface CreateGameProps {
  onSubmit: (body: CreateGameBody) => void
  onBack: () => void
}

export function CreateGame({ onSubmit, onBack }: CreateGameProps) {
  const { size, baseWord, error, setSize, setBaseWord, handleSubmit } = useCreateGameForm({ onSubmit })

  return (
    <div className="flex flex-col items-center justify-center min-h-screen px-4">
      {/* Header */}
      <div className="text-center mb-8">
        <h1 className="text-4xl md:text-5xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-blue-500 mb-3">
          Создать игру
        </h1>
        <p className="text-gray-400 text-base">
          Настройте параметры новой игры
        </p>
      </div>

      {/* Form Card */}
      <div className="w-full max-w-lg">
        <div className="bg-gradient-to-br from-gray-800 to-gray-900 shadow-depth-3 p-8 border-2 border-gray-700">
          <form onSubmit={handleSubmit} className="space-y-6" aria-label="Форма создания новой игры">
            {/* Board Size */}
            <div>
              <label id="board-size-label" className="block text-base font-bold text-gray-300 mb-3">
                📐 Размер доски
              </label>
              <div
                className="grid grid-cols-5 gap-2"
                role="radiogroup"
                aria-labelledby="board-size-label"
              >
                {BOARD_SIZES.map(s => (
                  <button
                    key={s}
                    type="button"
                    role="radio"
                    aria-checked={size === String(s)}
                    aria-label={`Размер доски ${s} на ${s}`}
                    onClick={() => setSize(String(s))}
                    className={cn(
                      'py-3 font-bold text-base transition-all duration-200',
                      size === String(s)
                        ? 'bg-gradient-to-r from-cyan-500 to-blue-500 text-white shadow-depth-2 scale-105 ring-2 ring-cyan-400'
                        : 'bg-gray-700 text-gray-300 hover:bg-gray-600 hover:scale-105',
                    )}
                  >
                    {s}
                    ×
                    {s}
                  </button>
                ))}
              </div>
            </div>

            {/* Base Word */}
            <div>
              <label htmlFor="base-word-input" className="block text-base font-bold text-gray-300 mb-3">
                📝 Базовое слово (
                {size}
                {' '}
                русских букв)
              </label>
              <input
                id="base-word-input"
                type="text"
                value={baseWord}
                onChange={e => setBaseWord(e.target.value.toUpperCase())}
                aria-required="true"
                aria-invalid={error ? 'true' : 'false'}
                aria-describedby="base-word-help"
                className="w-full px-6 py-4 bg-gray-900 border-2 border-gray-700 focus:border-cyan-400 focus:outline-none uppercase text-center text-2xl font-bold tracking-widest text-cyan-400 placeholder-gray-600 transition-all duration-200"
                placeholder={size === '5' ? 'БАЛДА' : size === '3' ? 'КОТ' : 'СЛОВО'}
                maxLength={Number.parseInt(size, 10)}
                required
              />
              <p id="base-word-help" className="text-xs text-gray-500 mt-2 text-center">
                Слово будет размещено в центре доски
              </p>
            </div>

            {/* Error Message */}
            {error && (
              <div
                role="alert"
                aria-live="assertive"
                className="bg-red-900 bg-opacity-40 border-2 border-red-600 p-4 flex items-center gap-3"
              >
                <span className="text-2xl" aria-hidden="true">⚠️</span>
                <span className="text-red-300 font-medium">{error}</span>
              </div>
            )}

            {/* Action Buttons */}
            <div className="flex gap-3 pt-2">
              <button
                type="button"
                onClick={onBack}
                className="flex-1 py-4 bg-gray-700 hover:bg-gray-600 font-bold text-base text-gray-200 transition-all duration-200 hover:scale-105 shadow-depth-2"
              >
                ← Назад
              </button>
              <button
                type="submit"
                className="flex-1 py-4 bg-gradient-to-r from-green-600 to-green-700 hover:from-green-500 hover:to-green-600 font-bold text-base text-white transition-all duration-200 hover:scale-105 shadow-depth-2 hover:shadow-depth-3"
              >
                ✓ Создать
              </button>
            </div>
          </form>
        </div>

        {/* Help Text */}
        <div className="mt-6 text-center text-gray-500 text-sm space-y-1">
          <p>💡 Совет: Выберите интересное слово для лучшей игры</p>
          <p>🎮 Игра начнётся автоматически после создания</p>
        </div>
      </div>
    </div>
  )
}
