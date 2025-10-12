import type { GameState } from '../lib/client'
import { memo, useMemo } from 'react'
import { cn } from '../utils/classNames'

interface PlayerPanelProps {
  game: GameState
  playerIndex: 0 | 1
  currentPlayerName: string
}

export const PlayerPanel = memo(({ game, playerIndex, currentPlayerName }: PlayerPanelProps) => {
  const player = game.players[playerIndex]
  const score = game.scores[player] || 0
  const isCurrentTurn = game.currentPlayerIndex === playerIndex
  const isAI = game.aiPlayers.includes(player)
  const isCurrentUser = player === currentPlayerName

  // Calculate opponent score for comparison
  const opponentIndex = playerIndex === 0 ? 1 : 0
  const opponentPlayer = game.players[opponentIndex]
  const opponentScore = game.scores[opponentPlayer] || 0

  // Determine score status
  const isWinning = score > opponentScore
  const isTied = score === opponentScore
  const scoreDifference = Math.abs(score - opponentScore)

  // Enhanced player info
  const playerDisplayName = isAI ? `🤖 ${player}` : player
  const playerType = isAI ? 'AI' : isCurrentUser ? 'Вы' : 'Игрок'

  // Score color based on status (green for winning, gray for tied, red for losing)
  const scoreColor = isWinning
    ? 'text-green-400'
    : isTied
      ? 'text-slate-100'
      : 'text-red-400'

  // Get words played by this player from moves history with enhanced info
  const playerMoves = useMemo(() => {
    return game.moves
      .filter(move => move.playerId === player)
      .map((move, index) => ({
        word: move.word,
        score: move.word.length,
        moveNumber: index + 1,
        isRecent: index === game.moves.filter(m => m.playerId === player).length - 1
      }))
  }, [game.moves, player])

  const totalWords = playerMoves.length
  const averageWordLength = totalWords > 0 ? Math.round(playerMoves.reduce((sum, move) => sum + move.score, 0) / totalWords * 10) / 10 : 0

  return (
    <div className={cn(
      'flex flex-col bg-slate-800 border-2 h-full min-h-0 transition-all duration-300 shadow-depth-2 overflow-hidden',
      {
        'border-slate-600 hover:border-slate-500': true,
      },
    )}
    >
      {/* Enhanced Header with player info */}
      <div className={cn(
        'px-4 py-3 flex flex-col gap-3 border-b-2 shrink-0',
        {
          'bg-gradient-to-r from-yellow-900/50 to-yellow-800/30 border-yellow-600': isCurrentTurn,
          'bg-gradient-to-r from-slate-900 to-slate-800 border-slate-700': !isCurrentTurn,
        },
      )}
      >
        {/* Player name and type */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-slate-300 font-bold text-sm uppercase tracking-wide">
              {playerDisplayName}
            </span>
            <span className={cn(
              'text-xs px-2 py-1 rounded-full font-semibold',
              {
                'bg-yellow-600 text-yellow-100': isCurrentTurn,
                'bg-slate-600 text-slate-300': !isCurrentTurn,
              }
            )}>
              {playerType}
            </span>
          </div>

          {/* Turn indicator */}
          {isCurrentTurn && (
            <div className="flex items-center gap-1 text-yellow-400">
              <div className="w-2 h-2 bg-yellow-400 rounded-full animate-pulse"></div>
              <span className="text-xs font-bold">ХОД</span>
            </div>
          )}
        </div>

      </div>

      {/* Enhanced words list */}
      <div className="flex-1 overflow-y-auto px-4 py-3 min-h-0">
        <div className="space-y-2">
          {totalWords === 0
            ? (
              <div className="text-center py-8">
                <div className="text-slate-500 text-sm italic mb-2">Пока нет слов</div>
                <div className="text-slate-600 text-xs">Слова появятся здесь после ходов</div>
              </div>
            )
            : (
              playerMoves.map((move) => (
                <div
                  key={move.moveNumber}
                  className={cn(
                    'px-3 py-2 bg-slate-900 hover:bg-slate-700 text-slate-100 transition-all duration-200 border-2 flex items-center justify-between group',
                    {
                      'border-cyan-500 bg-cyan-900/20': move.isRecent,
                      'border-slate-700 hover:border-cyan-500': !move.isRecent,
                    }
                  )}
                >
                  <div className="flex items-center gap-3">
                    <span className="font-black tracking-wide text-sm">{move.word}</span>
                    <span className="text-xs text-slate-400 font-mono">
                      {move.score}б
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    {move.isRecent && (
                      <span className="text-xs bg-cyan-600 text-cyan-100 px-2 py-1 rounded-full font-bold">
                        НОВОЕ
                      </span>
                    )}
                    <span className="text-xs text-slate-400 group-hover:text-cyan-400 font-bold">
                      #{move.moveNumber}
                    </span>
                  </div>
                </div>
              ))
            )}
        </div>
      </div>

      {/* Score and Statistics at bottom */}
      <div className="px-4 py-3 border-t-2 border-slate-700 bg-slate-900/50">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <span className="text-xs text-slate-400 leading-tight">Слов: {totalWords}</span>
            <span className="text-xs text-slate-400 leading-tight">Ср. длина: {averageWordLength}</span>
          </div>
          <span className={cn('text-xl font-black tabular-nums tracking-tight transition-colors duration-300', scoreColor)}>
            {score}
          </span>
        </div>
      </div>
    </div>
  )
})

PlayerPanel.displayName = 'PlayerPanel'
