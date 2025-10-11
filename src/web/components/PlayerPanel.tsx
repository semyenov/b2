import type { GameState } from '../lib/client'

interface PlayerPanelProps {
  game: GameState
  playerIndex: 0 | 1
  currentPlayerName: string
  isLeft?: boolean
}

export function PlayerPanel({ game, playerIndex, currentPlayerName, isLeft: _isLeft = false }: PlayerPanelProps) {
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
      flex flex-col h-full bg-gray-800 border-2
      transition-all duration-200
      ${isCurrentTurn ? 'border-yellow-500 shadow-depth-3 animate-pulse-glow' : 'border-gray-600 shadow-depth-2'}
    `}
    >
      {/* Header with player info */}
      <div className={`
        p-3 flex items-center justify-between border-b-2 border-gray-700
        ${isCurrentTurn ? 'bg-yellow-900 bg-opacity-30' : 'bg-gray-750'}
      `}
      >
        <div className="flex items-center gap-2 flex-1 min-w-0">
          {isCurrentTurn && <span className="text-yellow-400 text-base">▶</span>}
          {isAI && <span className="text-yellow-500 text-sm">🤖</span>}
          <h3 className={`
            font-bold text-base truncate
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
      <div className="flex-1 p-3 overflow-y-auto">
        <div className="text-xs text-gray-500 mb-2">
          {playerWords.length}
          {' '}
          слов
        </div>
        <div className="space-y-1">
          {playerWords.length === 0
            ? (
                <div className="text-gray-600 text-xs italic">—</div>
              )
            : (
                playerWords.map((word, i) => (
                  <div
                    key={i}
                    className="px-2 py-1 bg-gray-750 hover:bg-gray-700 text-xs font-mono text-gray-300 transition-all duration-200 border border-transparent hover:border-gray-600 hover:shadow-depth-1"
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
