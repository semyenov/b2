import type { CreateGameBody } from '../lib/client'
import { memo } from 'react'
import { BOARD_SIZES } from '../constants/game'
import { useCreateGameForm } from '../hooks/useCreateGameForm'
import { cn } from '../utils/classNames'

interface CreateGameProps {
  onSubmit: (body: CreateGameBody) => void
  onBack: () => void
}

export const CreateGame = memo(({ onSubmit, onBack }: CreateGameProps) => {
  const { size, baseWord, error, setSize, setBaseWord, handleSubmit } = useCreateGameForm({ onSubmit })

  return (
    <div className="flex flex-col items-center justify-center min-h-screen px-4">
      {/* Header */}
      <div className="text-center mb-8">
        <h1 className="text-4xl md:text-5xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-blue-500 mb-3">
          Создать игру
        </h1>
        <p className="text-slate-400 text-base">
          Настройте параметры новой игры
        </p>
      </div>

      {/* Form Card */}
      <div className="w-full max-w-lg">
        <div className="bg-slate-800 p-8 border-2 border-slate-700">
          <form onSubmit={handleSubmit} className="space-y-6" aria-label="Форма создания новой игры">
            {/* Board Size */}
            <div>
              <label id="board-size-label" className="block text-base font-bold text-slate-300 mb-3">
                Размер доски
              </label>
              <div
                className="grid grid-cols-3 sm:grid-cols-5 gap-2"
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
                      'py-3 font-bold text-base transition-colors duration-150 border-2',
                      size === String(s)
                        ? 'bg-blue-600 border-blue-500 text-white'
                        : 'bg-slate-700 border-slate-600 text-slate-300 hover:bg-slate-600',
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
              <label htmlFor="base-word-input" className="block text-base font-bold text-slate-300 mb-3">
                Базовое слово (
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
                className="w-full px-6 py-4 bg-slate-900 border-2 border-slate-700 focus:border-cyan-500 focus:outline-none uppercase text-center text-2xl font-bold tracking-widest text-cyan-400 placeholder-slate-600 transition-colors duration-150"
                placeholder={size === '5' ? 'БАЛДА' : size === '3' ? 'КОТ' : 'СЛОВО'}
                maxLength={Number.parseInt(size, 10)}
                required
              />
              <p id="base-word-help" className="text-xs text-slate-500 mt-2 text-center">
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
                <span className="text-red-300 font-medium">{error}</span>
              </div>
            )}

            {/* Action Buttons */}
            <div className="flex gap-3 pt-2">
              <button
                type="button"
                onClick={onBack}
                className="flex-1 py-3 bg-slate-700 hover:bg-slate-600 border-2 border-slate-600 font-bold text-base sm:text-lg text-slate-200 transition-colors duration-150"
              >
                Назад
              </button>
              <button
                type="submit"
                className="flex-1 py-3 bg-green-600 hover:bg-green-500 border-2 border-green-500 font-bold text-base sm:text-lg text-white transition-colors duration-150"
              >
                Создать
              </button>
            </div>
          </form>
        </div>

        {/* Help Text */}
        <div className="mt-6 text-center text-slate-500 text-sm space-y-1">
          <p>Совет: Выберите интересное слово для лучшей игры</p>
          <p>Игра начнётся автоматически после создания</p>
        </div>
      </div>
    </div>
  )
})

CreateGame.displayName = 'CreateGame'
