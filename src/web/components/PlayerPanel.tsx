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

  // Get words played by this player from moves history
  const playerWords = game.moves
    .filter(move => move.playerId === player)
    .map(move => move.word)

  return (
    <div className={cn(
      'flex flex-col bg-gray-800 border-2 h-full min-h-0 transition-all duration-200',
      {
        'border-yellow-500 shadow-depth-3 animate-pulse-glow': isCurrentTurn,
        'border-gray-600 shadow-depth-2': !isCurrentTurn,
      },
    )}
    >
      {/* Header with player info */}
      <div className={cn(
        'px-[var(--spacing-resp-sm)] py-2 flex flex-col gap-1 border-b-2 border-gray-700 shrink-0',
        {
          'bg-yellow-900 bg-opacity-30': isCurrentTurn,
          'bg-gray-750': !isCurrentTurn,
        },
      )}
      >
        {/* Removed turn and AI indicators */}
        <div className="flex items-center justify-center">
          <span className="text-3xl font-black text-gray-100 tabular-nums tracking-tight">
            {game.moves.filter(move => move.playerId === player).reduce((acc, move) => acc + move.word.length, 0)}
            /
            {score}
          </span>
        </div>
      </div>

      {/* Words list */}
      <div className="flex-1 overflow-y-auto px-[var(--spacing-resp-sm)] py-4 min-h-0">
        <div className="space-y-2">
          {playerWords.length === 0
            ? (
              <div className="text-gray-600 text-[var(--text-resp-xs)] italic py-2 text-center">Пока нет слов</div>
            )
            : (
              playerWords.map((word, i) => (
                <div
                  key={i}
                  className="px-[var(--spacing-resp-word-item)] py-1.5 bg-gray-750 hover:bg-gray-700 text-[var(--text-resp-word)] font-mono text-gray-200 transition-all duration-200 border border-gray-600 hover:border-gray-500 hover:shadow-depth-1 flex items-center justify-between group"
                >
                  <span className="font-black tracking-wide">{word}</span>
                  <span className="text-xs text-gray-500 group-hover:text-gray-400 font-bold">
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
