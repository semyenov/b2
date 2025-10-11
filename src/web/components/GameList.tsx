import type { GameState } from '../lib/client'

interface GameListProps {
  games: GameState[]
  onJoin: (gameId: string, playerName: string) => void
  onBack: () => void
}

export function GameList({ games, onJoin, onBack }: GameListProps) {
  const handleJoin = (game: GameState) => {
    const playerName = `Player_${Date.now()}`
    onJoin(game.id, playerName)
  }

  return (
    <div className="max-w-4xl mx-auto mt-8">
      <div className="bg-gray-800 rounded-lg p-6">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-cyan-400">Available Games</h2>
          <button
            onClick={onBack}
            className="px-4 py-2 bg-gray-700 hover:bg-gray-600 rounded transition"
          >
            ← Back
          </button>
        </div>

        {games.length === 0 ? (
          <div className="text-center py-8 text-gray-400">
            No games available. Create a new one!
          </div>
        ) : (
          <div className="space-y-2">
            {games.map((game) => (
              <div
                key={game.id}
                className="p-4 bg-gray-700 hover:bg-gray-600 rounded cursor-pointer transition"
                onClick={() => handleJoin(game)}
              >
                <div className="flex justify-between items-center">
                  <div>
                    <div className="font-mono text-cyan-400">{game.id}</div>
                    <div className="text-sm text-gray-400 mt-1">
                      Size: {game.size}x{game.size} | Moves: {game.moves.length}
                    </div>
                    <div className="text-sm text-gray-400">
                      Players: {game.players.join(' vs ')}
                    </div>
                  </div>
                  <button className="px-4 py-2 bg-green-600 hover:bg-green-700 rounded transition">
                    Join →
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}