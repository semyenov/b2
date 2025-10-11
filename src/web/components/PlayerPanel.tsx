import type { GameState } from '../lib/client'

interface PlayerPanelProps {
  game: GameState
  playerIndex: 0 | 1
  currentPlayerName: string
  isLeft?: boolean
}

export function PlayerPanel({ game, playerIndex, currentPlayerName, isLeft = false }: PlayerPanelProps) {
  const player = game.players[playerIndex]
  const score = game.scores[player] || 0
  const isCurrentTurn = game.currentPlayerIndex === playerIndex
  const isMe = player === currentPlayerName
  const isAI = game.aiPlayers.includes(player)

  // Get words played by this player from moves history
  const playerWords = game.moves
    .filter(move => move.playerId === player)
    .map(move => move.word)

  return (
    <div className={`
      flex flex-col h-full bg-gray-800 border-2 rounded-lg
      transition-all duration-300
      ${isCurrentTurn ? 'border-yellow-500 shadow-depth-3 animate-pulse-glow' : 'border-gray-600 shadow-depth-2'}
    `}
    >
      {/* Header with player info */}
      <div className={`
        p-2 flex items-center justify-between border-b border-gray-700
        ${isCurrentTurn ? 'bg-yellow-900 bg-opacity-30' : 'bg-gray-750'}
      `}
      >
        <div className="flex items-center gap-1.5 flex-1 min-w-0">
          {isCurrentTurn && <span className="text-yellow-400 text-sm">▶</span>}
          {isAI && <span className="text-yellow-500 text-xs">🤖</span>}
          <h3 className={`
            font-bold text-sm truncate
            ${isMe ? 'text-cyan-400' : isAI ? 'text-yellow-300' : 'text-gray-300'}
          `}
          >
            {isMe ? player : player}
          </h3>
        </div>
        <div className="text-2xl font-bold text-gray-100 ml-2">
          {score}
        </div>
      </div>

      {/* Words list */}
      <div className="flex-1 p-2 overflow-y-auto">
        <div className="text-xs text-gray-500 mb-1">
          {playerWords.length}
          {' '}
          слов
        </div>
        <div className="space-y-0.5">
          {playerWords.length === 0
            ? (
                <div className="text-gray-600 text-xs italic">—</div>
              )
            : (
                playerWords.map((word, i) => (
                  <div
                    key={i}
                    className="px-1.5 py-0.5 bg-gray-750 hover:bg-gray-700 rounded text-xs font-mono text-gray-300 transition-colors duration-150 border border-transparent hover:border-gray-600"
                  >
                    {word}
                  </div>
                ))
              )}
        </div>
      </div>
    </div>
  )
}
