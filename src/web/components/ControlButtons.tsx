import { memo } from 'react'
import type { Suggestion } from '../lib/client'
import type { Position } from '../types/game'
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

export const ControlButtons = memo(function ControlButtons({
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
  const { toggleFullscreen, isFullscreen } = useFullscreen()

  const gameStep = getGameStep({
    isMyTurn,
    selectedCell,
    selectedLetter,
    wordPathLength: wordPath.length,
  })

  const isClearDisabled = isClearButtonDisabled(isMyTurn, selectedCell, selectedLetter, wordPath)
  const hasSuggestions = suggestions.length > 0

  return (
    <div className="flex items-center gap-2 sm:gap-3 flex-1 min-w-0 flex-wrap sm:flex-nowrap">
      {/* Left: System controls */}
      <div className="flex items-center gap-2 flex-shrink-0">
        <button
          type="button"
          onClick={onExit}
          aria-label="Выйти в главное меню"
          className={cn(
            'flex items-center gap-2 px-3 py-2 text-sm font-semibold transition-all duration-200',
            'bg-slate-700 hover:bg-slate-600 text-slate-200 hover:text-white',
            'border border-slate-600 hover:border-slate-500',
            'disabled:opacity-50 disabled:cursor-not-allowed',
          )}
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
          </svg>
          Выход
        </button>

        <button
          type="button"
          onClick={toggleFullscreen}
          aria-label={isFullscreen ? 'Выйти из полноэкранного режима' : 'Полноэкранный режим'}
          className={cn(
            'flex items-center gap-2 px-3 py-2 text-sm font-semibold transition-all duration-200',
            'bg-slate-700 hover:bg-slate-600 text-slate-200 hover:text-white',
            'border border-slate-600 hover:border-slate-500',
            'disabled:opacity-50 disabled:cursor-not-allowed',
          )}
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5l-5-5m5 5v-4m0 4h-4" />
          </svg>
          {isFullscreen ? 'Свернуть' : 'Полный экран'}
        </button>
      </div>

      {/* Center: Status message or submit button */}
      <div className="flex-1 flex justify-center min-w-0">
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
              'flex items-center gap-2 px-4 py-2 text-sm font-bold transition-all duration-200',
              'bg-green-600 hover:bg-green-500 text-white',
              'border-2 border-green-500 hover:border-green-400',
              'shadow-lg hover:shadow-xl transform hover:scale-105 active:scale-95',
              'disabled:opacity-50 disabled:cursor-not-allowed',
            )}
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
            <span className="uppercase tracking-wide">
              Отправить &quot;
              {formedWord}
              &quot;
            </span>
          </button>
        )}
      </div>

      {/* Right: Game controls */}
      <div className="flex items-center gap-2 flex-shrink-0">
        {/* AI suggestions toggle button */}
        <button
          type="button"
          onClick={onToggleSuggestions}
          disabled={!isMyTurn}
          aria-label={showSuggestions ? 'Скрыть подсказки AI' : 'Показать подсказки AI'}
          aria-pressed={showSuggestions}
          className={cn(
            'flex items-center gap-2 px-3 py-2 text-sm font-bold transition-all duration-200',
            'border-2 disabled:opacity-50 disabled:cursor-not-allowed',
            showSuggestions
              ? 'bg-yellow-600 hover:bg-yellow-500 text-white border-yellow-500 hover:border-yellow-400 shadow-lg'
              : 'bg-slate-700 hover:bg-slate-600 text-slate-200 hover:text-white border-slate-600 hover:border-slate-500',
          )}
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
          </svg>
          AI
          {hasSuggestions && (
            <span className="bg-white text-yellow-600 text-xs font-bold px-1.5 py-0.5 rounded-full min-w-[20px] text-center">
              {suggestions.length}
            </span>
          )}
        </button>

        {/* Clear button */}
        <button
          type="button"
          onClick={onClearSelection}
          disabled={isClearDisabled}
          aria-label="Отменить выбор ячейки и буквы"
          className={cn(
            'flex items-center gap-2 px-3 py-2 text-sm font-semibold transition-all duration-200',
            'bg-slate-700 hover:bg-slate-600 text-slate-200 hover:text-white',
            'border border-slate-600 hover:border-slate-500',
            'disabled:opacity-50 disabled:cursor-not-allowed',
          )}
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
          Отмена
        </button>
      </div>
    </div>
  )
})
