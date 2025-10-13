import type { Position } from '../types/game'
import { useFullscreen } from '../hooks/useFullscreen'
import { getGameStep } from '../utils/gameStepUtils'
import { isClearButtonDisabled } from '../utils/uiHelpers'
import { StatusMessage } from './StatusMessage'
import { Button } from './ui'

interface ControlButtonsProps {
  isMyTurn: boolean
  selectedCell?: Position
  selectedLetter?: string
  wordPath: Position[]
  formedWord: string
  showSuggestions: boolean
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
    <div className="flex items-center gap-[var(--spacing-resp-xs)] sm:gap-[var(--spacing-resp-sm)] flex-1 min-w-0 flex-wrap sm:flex-nowrap">
      {/* Left: Exit and Fullscreen buttons */}
      <div className="flex items-center gap-[var(--spacing-resp-xs)] flex-shrink-0">
        <Button
          type="button"
          variant="gray"
          size="sm"
          onClick={onExit}
          aria-label="Выйти в главное меню"
        >
          ← Выход
        </Button>
        <Button
          type="button"
          variant="gray"
          size="sm"
          onClick={toggleFullscreen}
          aria-label="Полноэкранный режим"
        >
          ⛶
        </Button>
      </div>

      {/* Center: Status message or submit button */}
      <div className="flex-1 flex justify-center">
        {gameStep === 'waiting' && <StatusMessage step="waiting" />}
        {gameStep === 'select-cell' && <StatusMessage step="select-cell" />}
        {gameStep === 'select-letter' && <StatusMessage step="select-letter" />}
        {gameStep === 'build-word' && <StatusMessage step="build-word" />}
        {gameStep === 'ready-to-submit' && (
          <Button
            type="button"
            variant="success"
            size="sm"
            onClick={onSubmitMove}
            aria-label={`Отправить слово ${formedWord}`}
            leftIcon="📤"
            className="whitespace-nowrap uppercase tracking-wider"
          >
            Отправить слово &quot;
            {formedWord}
            &quot;
          </Button>
        )}
      </div>

      {/* Right side: AI and Clear buttons */}
      <div className="flex flex-shrink-0 w-0 sm:w-auto flex-row gap-[var(--spacing-resp-xs)] sm:gap-[var(--spacing-resp-sm)]">
        {/* AI suggestions toggle button */}
        <Button
          type="button"
          variant="warning"
          size="sm"
          onClick={onToggleSuggestions}
          disabled={!isMyTurn}
          aria-label={showSuggestions ? 'Скрыть подсказки AI' : 'Показать подсказки AI'}
          aria-pressed={showSuggestions}
          className={showSuggestions ? 'shadow-depth-3' : ''}
        >
          AI
        </Button>

        {/* Clear button */}
        <Button
          type="button"
          variant="muted"
          size="sm"
          onClick={onClearSelection}
          disabled={isClearDisabled}
          aria-label="Отменить выбор ячейки и буквы"
        >
          ✕ Отмена
        </Button>
      </div>
    </div>
  )
}
