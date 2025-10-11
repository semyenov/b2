import type { GameState } from '../lib/client'

interface GameListProps {
  games: GameState[]
  onJoin: (gameId: string, playerName: string) => void
  onBack: () => void
}

// Helper: Extract base word from board center
function getBaseWord(game: GameState): string {
  const centerRow = Math.floor(game.size / 2)
  return game.board[centerRow]
    .map(cell => cell || '')
    .join('')
    .trim()
}

// Helper: Get game status
function getGameStatus(game: GameState): 'waiting' | 'in_progress' | 'finished' {
  if (game.moves.length === 0) {
    return 'waiting'
  }
  // Game is finished if board is full (rough heuristic)
  const emptyCount = game.board.flat().filter(cell => cell === null).length
  if (emptyCount <= 2) {
    return 'finished'
  }
  return 'in_progress'
}

// Helper: Format time ago
function formatTimeAgo(timestamp: number): string {
  const seconds = Math.floor((Date.now() - timestamp) / 1000)
  if (seconds < 60)
    return 'just now'
  const minutes = Math.floor(seconds / 60)
  if (minutes < 60)
    return `${minutes}m ago`
  const hours = Math.floor(minutes / 60)
  if (hours < 24)
    return `${hours}h ago`
  const days = Math.floor(hours / 24)
  return `${days}d ago`
}

export function GameList({ games, onJoin, onBack }: GameListProps) {
  const handleJoin = (game: GameState) => {
    const playerName = `Player_${Date.now()}`
    onJoin(game.id, playerName)
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-900 to-gray-800 py-8">
      <div className="mx-auto px-4">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-cyan-400 mb-2">Available Games</h1>
            <p className="text-gray-400 text-base">Join an existing game or create a new one</p>
          </div>
          <button
            onClick={onBack}
            className="px-6 py-3 bg-gray-700 hover:bg-gray-600 border-2 border-gray-600 font-bold text-base transition-all duration-200 hover:shadow-depth-2 hover:scale-105 text-gray-200"
          >
            ← Back to Menu
          </button>
        </div>

        {/* Games Grid */}
        {games.length === 0
          ? (
              <div className="bg-gray-800 border-2 border-gray-700 p-12 text-center shadow-depth-2">
                <div className="text-6xl mb-4">🎮</div>
                <h3 className="text-xl font-bold text-gray-300 mb-2">No Games Available</h3>
                <p className="text-gray-400 text-base mb-6">Be the first to create a game!</p>
                <button
                  onClick={onBack}
                  className="px-8 py-3 bg-blue-600 hover:bg-blue-700 border-2 border-blue-500 font-bold text-base text-white shadow-depth-2 hover:shadow-depth-3 transition-all duration-200 transform hover:scale-105"
                >
                  Create New Game
                </button>
              </div>
            )
          : (
              <>
                <div className="text-gray-400 mb-4">
                  {games.length}
                  {' '}
                  {games.length === 1 ? 'game' : 'games'}
                  {' '}
                  available
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {games.map((game) => {
                    const status = getGameStatus(game)
                    const baseWord = getBaseWord(game)
                    const turnNumber = Math.floor(game.moves.length / 2) + 1
                    const currentPlayer = game.players[game.currentPlayerIndex]
                    const timeAgo = formatTimeAgo(game.createdAt)

                    const statusConfig = {
                      waiting: {
                        label: 'Waiting',
                        color: 'bg-yellow-900 text-yellow-300 border-yellow-600',
                      },
                      in_progress: {
                        label: 'In Progress',
                        color: 'bg-green-900 text-green-300 border-green-600',
                      },
                      finished: {
                        label: 'Finished',
                        color: 'bg-gray-700 text-gray-300 border-gray-600',
                      },
                    }

                    const statusInfo = statusConfig[status]

                    return (
                      <div
                        key={game.id}
                        onClick={() => handleJoin(game)}
                        className="bg-gray-800 border-2 border-gray-700 p-5 cursor-pointer transition-all duration-200 hover:border-cyan-500 hover:shadow-depth-3 hover:scale-105 hover:bg-gray-750 shadow-depth-1"
                      >
                        {/* Header: Status + Time */}
                        <div className="flex justify-between items-start mb-3">
                          <div className={`px-2.5 py-1 text-xs font-bold border ${statusInfo.color}`}>
                            {statusInfo.label}
                          </div>
                          <div className="text-xs text-gray-500">{timeAgo}</div>
                        </div>

                        {/* Base Word */}
                        <div className="mb-3">
                          <div className="text-2xl font-bold text-cyan-400 tracking-wider mb-1">
                            {baseWord}
                          </div>
                          <div className="text-xs text-gray-500 font-mono">
                            {game.id.substring(0, 8)}
                            ...
                          </div>
                        </div>

                        {/* Game Info */}
                        <div className="space-y-2 mb-4 text-sm">
                          <div className="flex items-center justify-between">
                            <span className="text-gray-400">Board:</span>
                            <span className="text-gray-200 font-mono">
                              {game.size}
                              ×
                              {game.size}
                            </span>
                          </div>
                          <div className="flex items-center justify-between">
                            <span className="text-gray-400">Turn:</span>
                            <span className="text-gray-200 font-bold">{turnNumber}</span>
                          </div>
                          {status === 'in_progress' && (
                            <div className="flex items-center justify-between">
                              <span className="text-gray-400">Current:</span>
                              <span className="text-yellow-300 font-bold text-xs">
                                {game.aiPlayers.includes(currentPlayer) && '🤖 '}
                                {currentPlayer}
                              </span>
                            </div>
                          )}
                        </div>

                        {/* Players & Scores */}
                        <div className="border-t border-gray-700 pt-3 mb-4">
                          <div className="space-y-1.5">
                            {game.players.map((player, idx) => (
                              <div
                                key={player}
                                className="flex items-center justify-between text-sm"
                              >
                                <div className="flex items-center gap-1">
                                  {game.aiPlayers.includes(player) && (
                                    <span className="text-xs">🤖</span>
                                  )}
                                  <span className={
                                    idx === game.currentPlayerIndex
                                      ? 'text-yellow-300 font-bold'
                                      : 'text-gray-400'
                                  }
                                  >
                                    {player}
                                  </span>
                                </div>
                                <span className="font-mono font-bold text-gray-200">
                                  {game.scores[player] || 0}
                                </span>
                              </div>
                            ))}
                          </div>
                        </div>

                        {/* Join Button */}
                        <button
                          className="w-full py-2.5 bg-green-600 hover:bg-green-700 border-2 border-green-500 font-bold text-base text-white transition-all duration-200 hover:shadow-depth-2 hover:scale-105"
                          onClick={(e) => {
                            e.stopPropagation()
                            handleJoin(game)
                          }}
                        >
                          Join Game →
                        </button>
                      </div>
                    )
                  })}
                </div>
              </>
            )}
      </div>
    </div>
  )
}
