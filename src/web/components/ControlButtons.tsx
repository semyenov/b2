import type { Suggestion } from '../lib/client'
import type { Position } from '../types/game'
import { cn } from '../utils/classNames'
import { getGameStep } from '../utils/gameStepUtils'
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
  suggestions,
  onSubmitMove,
  onClearSelection,
  onToggleSuggestions,
  onExit,
}: ControlButtonsProps) {
  const gameStep = getGameStep({
    isMyTurn,
    selectedCell,
    selectedLetter,
    wordPathLength: wordPath.length,
  })

  const isClearDisabled = !isMyTurn || (!selectedCell && !selectedLetter && wordPath.length === 0)

  return (
    <div className="flex items-center gap-[var(--spacing-resp-xs)] sm:gap-[var(--spacing-resp-sm)] flex-1 min-w-0 flex-wrap sm:flex-nowrap">
      {/* Left: Exit and Fullscreen buttons */}
      <div className="flex items-center gap-[var(--spacing-resp-xs)] flex-shrink-0">
        <button
          type="button"
          onClick={onExit}
          aria-label="Выйти в главное меню"
          className="px-[var(--spacing-resp-sm)] sm:px-[var(--spacing-resp-md)] py-[var(--spacing-resp-xs)] bg-gray-700 hover:bg-gray-600 border-2 border-gray-600 text-[var(--text-resp-xs)] sm:text-[var(--text-resp-sm)] font-bold transition-all duration-200 hover:shadow-depth-2 hover:scale-105 text-gray-200 flex-shrink-0"
        >
          ← Выход
        </button>
        <button
          type="button"
          onClick={() => {
            if (!document.fullscreenElement) {
              document.documentElement.requestFullscreen()
            }
            else {
              document.exitFullscreen()
            }
          }}
          aria-label="Полноэкранный режим"
          className="px-[var(--spacing-resp-xs)] sm:px-[var(--spacing-resp-sm)] py-[var(--spacing-resp-xs)] bg-gray-700 hover:bg-gray-600 border-2 border-gray-600 text-[var(--text-resp-base)] font-bold transition-all duration-200 hover:shadow-depth-2 hover:scale-105 text-gray-200 flex-shrink-0"
        >
          ⛶
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
            className="px-[var(--spacing-resp-sm)] sm:px-[var(--spacing-resp-md)] py-[var(--spacing-resp-xs)] bg-gradient-to-r from-green-600 to-green-700 hover:from-green-500 hover:to-green-600 border-2 border-green-400 text-white font-bold text-[var(--text-resp-xs)] sm:text-[var(--text-resp-sm)] transition-all duration-200 shadow-depth-3 hover:shadow-depth-4 hover:scale-110 flex items-center gap-1 sm:gap-2 animate-pulse-glow whitespace-nowrap flex-shrink-0"
          >
            <span aria-hidden="true">📤</span>
            <span className="uppercase tracking-wider">
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
      <div className="flex flex-shrink-0 w-0 sm:w-auto flex-row gap-[var(--spacing-resp-xs)] sm:gap-[var(--spacing-resp-sm)]">
        {/* AI suggestions toggle button */}
        <button
          type="button"
          onClick={onToggleSuggestions}
          disabled={!isMyTurn}
          aria-label={showSuggestions ? 'Скрыть подсказки AI' : 'Показать подсказки AI'}
          aria-pressed={showSuggestions}
          className={cn(
            'px-[var(--spacing-resp-sm)] sm:px-[var(--spacing-resp-md)] py-[var(--spacing-resp-xs)] font-bold text-[var(--text-resp-xs)] sm:text-[var(--text-resp-sm)] transition-all duration-200 hover:shadow-depth-2 hover:scale-105 flex items-center justify-center gap-1 sm:gap-2 disabled:opacity-40 disabled:cursor-not-allowed flex-shrink-0',
            showSuggestions
              ? 'bg-yellow-700 hover:bg-yellow-600 text-white shadow-depth-3'
              : 'bg-yellow-600 hover:bg-yellow-700 text-white',
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
          className="px-[var(--spacing-resp-sm)] sm:px-[var(--spacing-resp-md)] py-[var(--spacing-resp-xs)] bg-gray-600 hover:bg-gray-500 text-white font-bold text-[var(--text-resp-xs)] sm:text-[var(--text-resp-sm)] transition-all duration-200 hover:shadow-depth-2 hover:scale-105 disabled:opacity-40 disabled:cursor-not-allowed flex-shrink-0"
        >
          ✕ Отмена
        </button>

      </div>
    </div>
  )
}
