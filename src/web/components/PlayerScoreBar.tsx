import type { GameState } from '../lib/client'

interface PlayerScoreBarProps {
  game: GameState
  currentPlayerName: string
}

export function PlayerScoreBar({ game, currentPlayerName }: PlayerScoreBarProps) {
  const currentPlayerIndex = game.currentPlayerIndex
  const player1 = game.players[0]
  const player2 = game.players[1]
  const score1 = game.scores[player1] || 0
  const score2 = game.scores[player2] || 0
  const isPlayer1Current = currentPlayerIndex === 0
  const isPlayer2Current = currentPlayerIndex === 1
  const isPlayer1AI = game.aiPlayers.includes(player1)
  const isPlayer2AI = game.aiPlayers.includes(player2)
  const isPlayer1Me = player1 === currentPlayerName
  const isPlayer2Me = player2 === currentPlayerName

  // Count words for each player
  const player1Words = game.moves.filter(m => m.playerId === player1).length
  const player2Words = game.moves.filter(m => m.playerId === player2).length

  return (
    <div className="bg-gray-800 border-2 border-gray-700 rounded-lg p-4 shadow-depth-2">
      <div className="flex items-center justify-between max-w-4xl mx-auto">
        {/* Player 1 */}
        <div className={`flex items-center gap-3 flex-1 ${isPlayer1Current ? 'animate-pulse-glow' : ''}`}>
          {isPlayer1Current && (
            <div className="text-yellow-400 text-2xl animate-bounce">▶</div>
          )}
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-1">
              {isPlayer1AI && <span className="text-yellow-500 text-lg">🤖</span>}
              <span className={`font-bold text-lg ${
                isPlayer1Me
                  ? 'text-cyan-400'
                  : isPlayer1AI
                    ? 'text-yellow-300'
                    : isPlayer1Current
                      ? 'text-yellow-200'
                      : 'text-gray-300'
              }`}
              >
                {player1}
              </span>
            </div>
            <div className="text-xs text-gray-500">
              {player1Words}
              {' '}
              слов
            </div>
          </div>
          <div className={`text-4xl font-bold tabular-nums ${
            isPlayer1Current ? 'text-yellow-300' : 'text-gray-200'
          }`}
          >
            {score1}
          </div>
        </div>

        {/* Divider */}
        <div className="px-6 text-gray-600 font-bold text-2xl">
          vs
        </div>

        {/* Player 2 */}
        <div className={`flex items-center gap-3 flex-1 flex-row-reverse ${isPlayer2Current ? 'animate-pulse-glow' : ''}`}>
          {isPlayer2Current && (
            <div className="text-yellow-400 text-2xl animate-bounce">◀</div>
          )}
          <div className="flex-1 text-right">
            <div className="flex items-center gap-2 mb-1 justify-end">
              <span className={`font-bold text-lg ${
                isPlayer2Me
                  ? 'text-cyan-400'
                  : isPlayer2AI
                    ? 'text-yellow-300'
                    : isPlayer2Current
                      ? 'text-yellow-200'
                      : 'text-gray-300'
              }`}
              >
                {player2}
              </span>
              {isPlayer2AI && <span className="text-yellow-500 text-lg">🤖</span>}
            </div>
            <div className="text-xs text-gray-500">
              {player2Words}
              {' '}
              слов
            </div>
          </div>
          <div className={`text-4xl font-bold tabular-nums ${
            isPlayer2Current ? 'text-yellow-300' : 'text-gray-200'
          }`}
          >
            {score2}
          </div>
        </div>
      </div>
    </div>
  )
}
