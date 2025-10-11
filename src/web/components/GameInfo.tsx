import type { GameState } from '../lib/client'

interface GameInfoProps {
  game: GameState
  currentPlayerName: string | null
}

export function GameInfo({ game, currentPlayerName }: GameInfoProps) {
  const currentPlayer = game.players[game.currentPlayerIndex]
  const isMyTurn = currentPlayerName === currentPlayer

  return (
    <div className="bg-gray-800 rounded-lg p-4">
      <h3 className="text-xl font-bold mb-4 text-cyan-400">Информация об игре</h3>

      {/* Current turn */}
      <div className="mb-4">
        <div className="text-gray-400 mb-1">Текущий ход:</div>
        <div className={`text-lg font-bold ${isMyTurn ? 'text-green-400' : 'text-yellow-400'}`}>
          {isMyTurn ? '▶ Ваш ход!' : currentPlayer}
        </div>
      </div>

      {/* Scores */}
      <div className="mb-4">
        <div className="text-gray-400 mb-2">Счет:</div>
        {game.players.map((player) => {
          const score = game.scores[player] || 0
          const isCurrent = player === currentPlayer
          const isMe = player === currentPlayerName

          return (
            <div
              key={player}
              className={`
                flex justify-between items-center py-2 px-3 mb-1 rounded
                ${isCurrent ? 'bg-gray-700' : ''}
                ${isMe ? 'border border-green-400' : ''}
              `}
            >
              <div className="flex items-center gap-2">
                {isCurrent && <span className="text-yellow-400">▶</span>}
                <span className={isMe ? 'text-green-400 font-bold' : 'text-gray-300'}>
                  {player}
                </span>
              </div>
              <span className="text-2xl font-bold text-cyan-400">{score}</span>
            </div>
          )
        })}
      </div>

      {/* Game stats */}
      <div className="text-gray-400 space-y-1">
        <div>Ходов сделано: {game.moves.length}</div>
        <div>Слов использовано: {game.usedWords.length}</div>
      </div>
    </div>
  )
}