import type { Suggestion } from '../lib/client'
import type { Position } from '../types/game'
import { BUTTON_STYLES } from '../constants/styles'
import { useFullscreen } from '../hooks/useFullscreen'
import { cn } from '../utils/classNames'
import { getGameStep } from '../utils/gameStepUtils'
import { isClearButtonDisabled } from '../utils/uiHelpers'
import { StatusMessage } from './StatusMessage'

interface ControlButtonsProps {
  isMyTurn: boolean
  selectedCell?: Position
  selectedLetter?: string
  wordPath: Position[]
  formedWord: string
  showSuggestions: boolean
  suggestions: Suggestion[]
  onSubmitMove: () => void
  onClearSelection: () => void
  onToggleSuggestions: () => void
  onExit: () => void
}

export function ControlButtons({
  isMyTurn,
  selectedCell,
  selectedLetter,
  wordPath,
  formedWord,
  showSuggestions,
  suggestions: _suggestions,
  onSubmitMove,
  onClearSelection,
  onToggleSuggestions,
  onExit,
}: ControlButtonsProps) {
  const { toggleFullscreen } = useFullscreen()

  const gameStep = getGameStep({
    isMyTurn,
    selectedCell,
    selectedLetter,
    wordPathLength: wordPath.length,
  })

  const isClearDisabled = isClearButtonDisabled(isMyTurn, selectedCell, selectedLetter, wordPath)

  return (
    <div className="flex items-center gap-[var(--spacing-resp-sm)] sm:gap-[var(--spacing-resp-md)] flex-1 min-w-0 flex-wrap sm:flex-nowrap">
      {/* Left: Exit and Fullscreen buttons */}
      <div className="flex items-center gap-[var(--spacing-resp-sm)] flex-shrink-0">
        <button
          type="button"
          onClick={onExit}
          aria-label="Выйти в главное меню"
          className={cn(BUTTON_STYLES.base, BUTTON_STYLES.padding.standard, BUTTON_STYLES.textSize.standard, BUTTON_STYLES.variants.gray)}
        >
          Выход
        </button>
        <button
          type="button"
          onClick={toggleFullscreen}
          aria-label="Полноэкранный режим"
          className={cn(BUTTON_STYLES.base, BUTTON_STYLES.padding.standard, BUTTON_STYLES.textSize.standard, BUTTON_STYLES.variants.gray)}
        >
          [ ]
        </button>
      </div>

      {/* Center: Status message or submit button */}
      <div className="flex-1 flex justify-center">
        {gameStep === 'waiting' && <StatusMessage step="waiting" />}
        {gameStep === 'select-cell' && <StatusMessage step="select-cell" />}
        {gameStep === 'select-letter' && <StatusMessage step="select-letter" />}
        {gameStep === 'build-word' && <StatusMessage step="build-word" />}
        {gameStep === 'ready-to-submit' && (
          <button
            type="button"
            onClick={onSubmitMove}
            aria-label={`Отправить слово ${formedWord}`}
            className={cn(
              BUTTON_STYLES.base,
              BUTTON_STYLES.padding.standard,
              BUTTON_STYLES.textSize.standard,
              BUTTON_STYLES.variants.success,
              BUTTON_STYLES.layout.row,
              BUTTON_STYLES.content.nowrap,
            )}
          >
            <span className={BUTTON_STYLES.content.uppercase}>
              Отправить слово
              {' '}
              &quot;
              {formedWord}
              &quot;
            </span>
          </button>
        )}
      </div>

      {/* Right side: Empty for now, can be used for future controls */}
      <div className="flex flex-shrink-0 w-0 sm:w-auto flex-row gap-[var(--spacing-resp-sm)] sm:gap-[var(--spacing-resp-md)]">
        {/* AI suggestions toggle button */}
        <button
          type="button"
          onClick={onToggleSuggestions}
          disabled={!isMyTurn}
          aria-label={showSuggestions ? 'Скрыть подсказки AI' : 'Показать подсказки AI'}
          aria-pressed={showSuggestions}
          className={cn(
            BUTTON_STYLES.base,
            BUTTON_STYLES.padding.standard,
            BUTTON_STYLES.textSize.standard,
            BUTTON_STYLES.layout.centered,
            BUTTON_STYLES.disabled,
            showSuggestions ? BUTTON_STYLES.variants.warningActive : BUTTON_STYLES.variants.warningInactive,
          )}
        >
          AI
        </button>

        {/* Clear button */}
        <button
          type="button"
          onClick={onClearSelection}
          disabled={isClearDisabled}
          aria-label="Отменить выбор ячейки и буквы"
          className={cn(
            BUTTON_STYLES.base,
            BUTTON_STYLES.padding.standard,
            BUTTON_STYLES.textSize.standard,
            BUTTON_STYLES.variants.muted,
            BUTTON_STYLES.disabled,
          )}
        >
          Отмена
        </button>

      </div>
    </div>
  )
}
