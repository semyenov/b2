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
      'flex flex-col bg-gray-800 border h-full min-h-0 transition-colors duration-150',
      {
        'border-yellow-500 bg-gray-800/80': isCurrentTurn,
        'border-gray-600': !isCurrentTurn,
      },
    )}
    >
      {/* Header with player info */}
      <div className={cn(
        'px-2 py-2 flex flex-col gap-1 border-b shrink-0',
        {
          'bg-yellow-900/30 border-yellow-600': isCurrentTurn,
          'bg-gray-900 border-gray-700': !isCurrentTurn,
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
      <div className="flex-1 overflow-y-auto px-2 py-4 min-h-0">
        <div className="space-y-2">
          {playerWords.length === 0
            ? (
                <div className="text-gray-500 text-sm italic py-2 text-center">Пока нет слов</div>
              )
            : (
                playerWords.map((word, i) => (
                  <div
                    key={i}
                    className="px-2 py-1.5 bg-gray-900 hover:bg-gray-700 text-sm font-mono text-gray-100 transition-colors duration-150 border border-gray-700 hover:border-cyan-500 flex items-center justify-between group"
                  >
                    <span className="font-black tracking-wide">{word}</span>
                    <span className="text-xs text-gray-400 group-hover:text-cyan-400 font-bold">
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
