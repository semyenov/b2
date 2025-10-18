import type { CreateGameBody } from '@lib/client'
import { BOARD_SIZES } from '@constants/game'
import { UI_MESSAGES } from '@constants/messages'
import { useCreateGameForm } from '@hooks/useCreateGameForm'
import { cn } from '@utils/classNames'
import { memo } from 'react'
import { Button, Card, Input } from '../ui'

export interface CreateGameProps {
  onSubmit: (body: CreateGameBody) => void
  onBack: () => void
}

/**
 * Create Game Component
 * Form screen for creating a new game with custom board size and base word
 * Provides validation and feedback for user input
 */
export const CreateGame = memo(({ onSubmit, onBack }: CreateGameProps) => {
  const { size, baseWord, error, setSize, setBaseWord, handleSubmit } = useCreateGameForm({ onSubmit })

  return (
    <div className="flex flex-col items-center justify-center min-h-screen px-4">
      {/* Header */}
      <div className="text-center mb-8">
        <h1 className="text-4xl md:text-5xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-info-400 to-info-500 mb-3">
          {UI_MESSAGES.CREATE_GAME_TITLE}
        </h1>
        <p className="text-gray-400 text-base">
          {UI_MESSAGES.CREATE_GAME_SUBTITLE}
        </p>
      </div>

      {/* Form Card */}
      <div className="w-full max-w-lg">
        <Card variant="gradient" padding="spacious">
          <form onSubmit={handleSubmit} className="space-y-6" aria-label={UI_MESSAGES.CREATE_GAME_FORM_ARIA}>
            {/* Board Size */}
            <div>
              <label id="board-size-label" className="block text-base font-bold text-gray-300 mb-3">
                {UI_MESSAGES.BOARD_SIZE}
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
                    aria-label={UI_MESSAGES.BOARD_SIZE_ARIA(s)}
                    onClick={() => setSize(String(s))}
                    className={cn(
                      'py-3 font-bold text-base transition-all duration-200',
                      size === String(s)
                        ? 'bg-gradient-to-r from-info-500 to-info-500 text-info-100 shadow-depth-2 ring-2 ring-info-400'
                        : 'bg-gray-700 text-gray-300 hover:bg-gray-600',
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
            <Input
              id="base-word-input"
              label={UI_MESSAGES.BASE_WORD(Number.parseInt(size, 10))}
              type="text"
              value={baseWord}
              onChange={e => setBaseWord(e.target.value.toUpperCase())}
              error={error}
              helpText={UI_MESSAGES.BASE_WORD_HELP}
              className="uppercase text-center text-2xl tracking-widest text-info-400"
              placeholder={size === '5' ? 'БАЛДА' : size === '3' ? 'КОТ' : 'СЛОВО'}
              maxLength={Number.parseInt(size, 10)}
              required
            />

            {/* Action Buttons */}
            <div className="flex gap-3 pt-2">
              <Button
                type="button"
                variant="gray"
                size="lg"
                onClick={onBack}
                className="flex-1"
              >
                {UI_MESSAGES.BACK}
              </Button>
              <Button
                type="submit"
                variant="success"
                size="lg"
                className="flex-1"
              >
                {UI_MESSAGES.CREATE}
              </Button>
            </div>
          </form>
        </Card>

        {/* Help Text */}
        <div className="mt-6 text-center text-gray-500 text-sm space-y-1">
          <p>{UI_MESSAGES.CREATE_GAME_TIP}</p>
          <p>{UI_MESSAGES.CREATE_GAME_INFO}</p>
        </div>
      </div>
    </div>
  )
})

CreateGame.displayName = 'CreateGame'
