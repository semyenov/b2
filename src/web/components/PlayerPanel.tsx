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
      flex flex-col bg-gray-800 border-2 h-full
      transition-all duration-200
      ${isCurrentTurn ? 'border-yellow-500 shadow-depth-3 animate-pulse-glow' : 'border-gray-600 shadow-depth-2'}
    `}
    >
      {/* Header with player info */}
      <div className={`
        p-2 flex flex-col gap-1 border-b-2 border-gray-700
        ${isCurrentTurn ? 'bg-yellow-900 bg-opacity-30' : 'bg-gray-750'}
      `}
      >
        {/* Indicators only - no player label */}
        {(isCurrentTurn || isAI) && (
          <div className="flex items-center justify-center gap-1.5">
            {isCurrentTurn && <span className="text-yellow-400 text-xl">▶</span>}
            {isAI && <span className="text-yellow-500 text-xl">🤖</span>}
          </div>
        )}
        <div className="flex items-center justify-center">
          <span className="text-6xl font-black text-gray-100 tabular-nums tracking-tight">
            {score}
          </span>
        </div>
        <div className="text-center text-[10px] text-gray-500 uppercase tracking-wider">
          Счёт
        </div>
      </div>

      {/* Words list */}
      <div className="flex-1 overflow-y-auto p-2">
        <div className="text-sm text-gray-400 mb-2 font-bold uppercase tracking-wide">
          Слова:
          {' '}
          {playerWords.length}
        </div>
        <div className="space-y-2">
          {playerWords.length === 0
            ? (
                <div className="text-gray-600 text-sm italic py-4 text-center">Пока нет слов</div>
              )
            : (
                playerWords.map((word, i) => (
                  <div
                    key={i}
                    className="px-3 py-2.5 bg-gray-750 hover:bg-gray-700 text-base font-mono text-gray-200 transition-all duration-200 border border-gray-600 hover:border-gray-500 hover:shadow-depth-1 flex items-center justify-between group"
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
}
