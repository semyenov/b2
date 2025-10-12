import type { GameState } from '../lib/client'
import { memo } from 'react'
import { cn } from '../utils/classNames'

interface PlayerPanelProps {
  game: GameState
  playerIndex: 0 | 1
  currentPlayerName: string
}

export const PlayerPanel = memo(({ game, playerIndex, currentPlayerName: _currentPlayerName }: PlayerPanelProps) => {
  const player = game.players[playerIndex]
  const score = game.scores[player] || 0
  const isCurrentTurn = game.currentPlayerIndex === playerIndex
  // const _isAI = game.aiPlayers.includes(player)

  // Calculate opponent score for comparison
  const opponentIndex = playerIndex === 0 ? 1 : 0
  const opponentPlayer = game.players[opponentIndex]
  const opponentScore = game.scores[opponentPlayer] || 0

  // Determine score status
  const isWinning = score > opponentScore
  const isTied = score === opponentScore

  // Score color based on status (green for winning, gray for tied, red for losing)
  const scoreColor = isWinning
    ? 'text-green-400'
    : isTied
      ? 'text-gray-100'
      : 'text-red-400'

  // Get words played by this player from moves history
  const playerWords = game.moves
    .filter(move => move.playerId === player)
    .map(move => move.word)

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
            {game.moves.filter(move => move.playerId === player).reduce((acc, move) => acc + move.word.length, 0)}
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
