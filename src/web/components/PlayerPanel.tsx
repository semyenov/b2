import type { GameState } from '../lib/client'
import { memo } from 'react'
import { usePlayerStats } from '../hooks/usePlayerStats'
import { cn } from '../utils/classNames'

export interface PlayerPanelProps {
  game: GameState
  playerIndex: 0 | 1
}

/**
 * Player Panel Component
 * Displays player stats sidebar with score, word history, and current turn indicator
 * Shows win/lose indicator and highlights active player's turn
 */
export const PlayerPanel = memo(({ game, playerIndex }: PlayerPanelProps) => {
  const isCurrentTurn = game.currentPlayerIndex === playerIndex

  // Use extracted hook for player statistics
  const { scoreColor, playerWords, letterCount, isTied, isWinning, score } = usePlayerStats({ game, playerIndex })

  return (
    <div className={cn(
      'flex flex-col bg-slate-800 border-2 h-full min-h-0 transition-all duration-200',
      {
        'border-yellow-400 shadow-depth-3 animate-pulse-glow ring-2 ring-yellow-400/30': isCurrentTurn,
        'border-slate-600 shadow-depth-2': !isCurrentTurn,
      },
    )}
    >
      {/* Header with player info */}
      <div className={cn(
        'px-[var(--spacing-resp-sm)] py-2 flex flex-col gap-1 border-b-2 shrink-0',
        {
          'bg-yellow-900/40 border-yellow-600': isCurrentTurn,
          'bg-slate-900 border-slate-700': !isCurrentTurn,
        },
      )}
      >
        {/* Score display with status indicator */}
        <div className="flex items-center justify-center gap-2">
          <span className={cn('text-3xl font-black tabular-nums tracking-tight transition-colors duration-300', scoreColor)}>
            {letterCount}
            /
            {score}
          </span>
          {/* Status indicator */}
          {!isTied && (
            <div className={cn(
              'text-2xl font-black leading-none transition-all duration-300',
              isWinning ? 'text-green-400' : 'text-red-400',
            )}
            >
              {isWinning ? '▲' : '▼'}
            </div>
          )}
        </div>
      </div>

      {/* Words list */}
      <div className="flex-1 overflow-y-auto px-[var(--spacing-resp-sm)] py-4 min-h-0">
        <div className="space-y-2">
          {playerWords.length === 0
            ? (
                <div className="text-slate-500 text-[var(--text-resp-xs)] italic py-2 text-center">Пока нет слов</div>
              )
            : (
                playerWords.map((word, i) => (
                  <div
                    key={i}
                    className="px-[var(--spacing-resp-word-item)] py-1.5 bg-slate-900 hover:bg-slate-700 text-[var(--text-resp-word)] font-mono text-gray-100 transition-all duration-200 border-2 border-slate-700 hover:border-cyan-500 hover:shadow-depth-2 flex items-center justify-between group"
                  >
                    <span className="font-black tracking-wide">{word}</span>
                    <span className="text-xs text-slate-400 group-hover:text-cyan-400 font-bold">
                      #
                      {i + 1}
                    </span>
                  </div>
                ))
              )}
        </div>
      </div>
    </div>
  )
})

PlayerPanel.displayName = 'PlayerPanel'
