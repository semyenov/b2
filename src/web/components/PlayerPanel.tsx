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

  // Get words played by this player from moves history
  const playerWords = game.moves
    .filter(move => move.playerId === player)
    .map(move => move.word)

  return (
    <div className={`
      flex flex-col h-full bg-gray-100 border-2 rounded-lg
      ${isCurrentTurn ? 'border-yellow-500 shadow-lg' : 'border-gray-400'}
      ${isLeft ? 'mr-2' : 'ml-2'}
    `}>
      {/* Header with player info */}
      <div className={`
        p-4 rounded-t-lg
        ${isCurrentTurn ? 'bg-yellow-100' : 'bg-gray-200'}
      `}>
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            {isCurrentTurn && <span className="text-yellow-600 text-xl">▶</span>}
            <h3 className={`
              font-bold text-lg
              ${isMe ? 'text-blue-600' : 'text-gray-700'}
            `}>
              {isMe ? `${player} (You)` : player}
            </h3>
          </div>
        </div>
        <div className="text-3xl font-bold text-center text-gray-800">
          {score}
        </div>
        <div className="text-xs text-center text-gray-600 mt-1">
          очков
        </div>
      </div>

      {/* Words list */}
      <div className="flex-1 p-4 overflow-y-auto">
        <div className="text-xs font-semibold text-gray-600 mb-2 uppercase">
          Слова ({playerWords.length})
        </div>
        <div className="space-y-1">
          {playerWords.length === 0 ? (
            <div className="text-gray-400 text-sm italic">Нет слов</div>
          ) : (
            playerWords.map((word, i) => (
              <div
                key={i}
                className="px-2 py-1 bg-white rounded text-sm font-mono border border-gray-300"
              >
                {word}
              </div>
            ))
          )}
        </div>
      </div>

      {/* Turn indicator */}
      {isCurrentTurn && (
        <div className="p-2 bg-green-100 text-green-700 text-center text-sm font-semibold">
          {isMe ? 'Ваш ход!' : 'Ход противника'}
        </div>
      )}
    </div>
  )
}