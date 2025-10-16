import type { Position } from '@types'
import { getGameStep } from '@utils/gameStepUtils'
import { isClearButtonDisabled } from '@utils/uiHelpers'
import { memo } from 'react'
import { Button, StatusMessage } from '../ui'

export interface ControlButtonsProps {
  isMyTurn: boolean
  selectedCell?: Position
  selectedLetter?: string
  wordPath: Position[]
  formedWord: string
  showSuggestions: boolean
  moveNumber?: number
  onSubmitMove: () => void
  onClearSelection: () => void
  onToggleSuggestions: () => void
  onHideSuggestions: () => void
  onExit: () => void
  onRestartWithNewWord: () => void
}

/**
 * Control Buttons Component
 * Bottom control bar with game actions: exit, fullscreen, status messages, submit, AI toggle, and clear
 * Displays different status messages based on current game step
 */
export const ControlButtons = memo<ControlButtonsProps>(({
  isMyTurn,
  selectedCell,
  selectedLetter,
  wordPath,
  formedWord,
  showSuggestions,
  moveNumber,
  onSubmitMove,
  onClearSelection,
  onToggleSuggestions,
  onHideSuggestions,
  onExit,
  onRestartWithNewWord,
}) => {
  const gameStep = getGameStep({
    isMyTurn,
    selectedCell,
    selectedLetter,
    wordPathLength: wordPath.length,
  })

  const isClearDisabled = isClearButtonDisabled(isMyTurn, selectedCell, selectedLetter, wordPath)

  // Handle clear button click: hide suggestions if open, otherwise clear selection
  const handleClearClick = () => {
    if (showSuggestions) {
      onHideSuggestions()
    }
    else {
      onClearSelection()
    }
  }

  return (
    <div className="flex items-center gap-3 sm:gap-4 flex-1 min-w-0 flex-wrap sm:flex-nowrap">
      {/* Left: Exit, New Game, and Fullscreen buttons */}
      <div className="flex items-center gap-3 flex-shrink-0">
        <Button
          type="button"
          variant="gray"
          size="md"
          onClick={onExit}
          aria-label="Выйти в главное меню"
        >
          Выход
        </Button>
        <Button
          type="button"
          variant="primary"
          size="md"
          onClick={onRestartWithNewWord}
          aria-label="Начать новую игру с теми же параметрами"
        >
          Новая игра
        </Button>
      </div>

      {/* Center: Status message or submit button */}
      <div className="flex-1 flex justify-center">
        {gameStep === 'waiting' && <StatusMessage step="waiting" />}
        {gameStep === 'select-cell' && <StatusMessage step="select-cell" moveNumber={moveNumber} />}
        {gameStep === 'select-letter' && <StatusMessage step="select-letter" />}
        {gameStep === 'build-word' && <StatusMessage step="build-word" />}
        {gameStep === 'ready-to-submit' && (
          <Button
            type="button"
            variant="success"
            size="md"
            onClick={onSubmitMove}
            aria-label={`Отправить слово ${formedWord}`}
            className="whitespace-nowrap uppercase tracking-wider"
          >
            Отправить слово «
            {formedWord}
            »
          </Button>
        )}
      </div>

      {/* Right side: AI and Clear buttons */}
      <div className="flex flex-shrink-0 w-0 sm:w-auto flex-row gap-3">
        {/* AI suggestions toggle button */}
        <Button
          type="button"
          variant="primary"
          size="md"
          onClick={onToggleSuggestions}
          disabled={!isMyTurn}
          aria-label={showSuggestions ? 'Скрыть подсказки AI' : 'Показать подсказки AI'}
          aria-pressed={showSuggestions}
          className={showSuggestions ? 'shadow-depth-3' : ''}
        >
          Подсказка
        </Button>

        {/* Clear button */}
        <Button
          type="button"
          variant={(isClearDisabled && !showSuggestions) ? 'muted' : 'danger'}
          size="md"
          onClick={handleClearClick}
          disabled={isClearDisabled && !showSuggestions}
          aria-label={showSuggestions ? 'Скрыть подсказки' : 'Отменить выбор ячейки и буквы'}
        >
          Отмена
        </Button>
      </div>
    </div>
  )
})

ControlButtons.displayName = 'ControlButtons'
