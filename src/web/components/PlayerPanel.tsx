import type { GameState } from '../lib/client'
import { memo } from 'react'

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

  // Get words played by this player from moves history
  const playerWords = game.moves
    .filter(move => move.playerId === player)
    .map(move => move.word)

  return (
    <div className={`
      flex flex-col bg-gray-800 border-2 h-full min-h-0
      transition-all duration-200
      ${isCurrentTurn ? 'border-yellow-500 shadow-depth-3 animate-pulse-glow' : 'border-gray-600 shadow-depth-2'}
    `}
    >
      {/* Header with player info */}
      <div className={`
        p-[var(--spacing-resp-sm)] flex flex-col gap-[var(--spacing-resp-xs)] border-b-2 border-gray-700 shrink-0
        ${isCurrentTurn ? 'bg-yellow-900 bg-opacity-30' : 'bg-gray-750'}
      `}
      >
        {/* Indicators only - no player label */}
        {(isCurrentTurn || isAI) && (
          <div className="flex items-center justify-center gap-[var(--spacing-resp-xs)]">
            {isCurrentTurn && <span className="text-yellow-400 text-xl">▶</span>}
            {isAI && <span className="text-yellow-500 text-xl">🤖</span>}
          </div>
        )}
        <div className="flex items-center justify-center">
          <span className="text-[var(--text-resp-score)] font-black text-gray-100 tabular-nums tracking-tight">
            {score}
          </span>
        </div>
        <div className="text-center text-[10px] text-gray-500 uppercase tracking-wider">
          Счёт
        </div>
      </div>

      {/* Words list */}
      <div className="flex-1 overflow-y-auto p-[var(--spacing-resp-sm)] min-h-0">
        <div className="space-y-[var(--spacing-resp-sm)]">
          {playerWords.length === 0
            ? (
                <div className="text-gray-600 text-[var(--text-resp-xs)] italic py-[var(--spacing-resp-md)] text-center">Пока нет слов</div>
              )
            : (
                playerWords.map((word, i) => (
                  <div
                    key={i}
                    className="px-[var(--spacing-resp-word-item)] py-[var(--spacing-resp-word-padding)] bg-gray-750 hover:bg-gray-700 text-[var(--text-resp-word)] font-mono text-gray-200 transition-all duration-200 border border-gray-600 hover:border-gray-500 hover:shadow-depth-1 flex items-center justify-between group"
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
