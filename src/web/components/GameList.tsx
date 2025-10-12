import type { GameState } from '../lib/client'
import { formatTimeAgo, getBaseWord, getGameStatus } from '../utils/gameHelpers'
import { getRussianPluralForm } from '../utils/russianPlural'

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
    <div className="min-h-screen bg-slate-900 py-8">
      <div className="max-w-7xl mx-auto px-6">
        {/* Header */}
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-3xl font-bold text-cyan-400 mb-2">Доступные игры</h1>
            <p className="text-slate-400 text-base">Присоединитесь к существующей игре или создайте новую</p>
          </div>
          <button
            onClick={onBack}
            className="px-4 sm:px-6 py-2.5 sm:py-3 bg-slate-700 hover:bg-slate-600 border-2 border-slate-600 font-bold text-base sm:text-lg transition-colors duration-150 text-slate-200"
          >
            Назад в меню
          </button>
        </div>

        {/* Games Grid */}
        {games.length === 0
          ? (
              <div className="bg-slate-800 border-2 border-slate-700 p-12 text-center">
                <h3 className="text-xl font-bold text-slate-300 mb-2">Нет доступных игр</h3>
                <p className="text-slate-400 text-base mb-6">Станьте первым, кто создаст игру!</p>
                <button
                  onClick={onBack}
                  className="px-4 sm:px-6 py-2.5 sm:py-3 bg-blue-600 hover:bg-blue-500 border-2 border-blue-500 font-bold text-base sm:text-lg text-white transition-colors duration-150"
                >
                  Создать новую игру
                </button>
              </div>
            )
          : (
              <>
                <div className="text-slate-400 mb-4">
                  {games.length}
                  {' '}
                  {getRussianPluralForm(games.length, ['игра', 'игры', 'игр'])}
                  {' '}
                  {getRussianPluralForm(games.length, ['доступна', 'доступно', 'доступно'])}
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-6">
                  {games.map((game) => {
                    const status = getGameStatus(game)
                    const baseWord = getBaseWord(game)
                    const turnNumber = Math.floor(game.moves.length / 2) + 1
                    const currentPlayer = game.players[game.currentPlayerIndex]
                    const timeAgo = formatTimeAgo(game.createdAt)

                    const statusConfig = {
                      waiting: {
                        label: 'Ожидание',
                        color: 'bg-yellow-900 text-yellow-300 border-yellow-600',
                      },
                      in_progress: {
                        label: 'В процессе',
                        color: 'bg-green-900 text-green-300 border-green-600',
                      },
                      finished: {
                        label: 'Завершена',
                        color: 'bg-slate-700 text-slate-300 border-slate-600',
                      },
                    }

                    const statusInfo = statusConfig[status]

                    return (
                      <div
                        key={game.id}
                        role="button"
                        tabIndex={0}
                        onClick={() => handleJoin(game)}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter' || e.key === ' ') {
                            e.preventDefault()
                            handleJoin(game)
                          }
                        }}
                        aria-label={`Присоединиться к игре ${baseWord}, размер ${game.size}×${game.size}, ${statusInfo.label}`}
                        className="bg-slate-800 border-2 border-slate-700 p-6 cursor-pointer transition-colors duration-150 hover:border-cyan-500 hover:bg-slate-700"
                      >
                        {/* Header: Status + Time */}
                        <div className="flex justify-between items-start mb-4">
                          <div className={`px-2.5 py-1 text-xs font-bold border-2 ${statusInfo.color}`}>
                            {statusInfo.label}
                          </div>
                          <div className="text-xs text-slate-500">{timeAgo}</div>
                        </div>

                        {/* Base Word */}
                        <div className="mb-4">
                          <div className="text-2xl font-bold text-cyan-400 tracking-wider mb-1">
                            {baseWord}
                          </div>
                          <div className="text-xs text-slate-500 font-mono">
                            {game.id.substring(0, 8)}
                            ...
                          </div>
                        </div>

                        {/* Game Info */}
                        <div className="space-y-2 mb-5 text-sm">
                          <div className="flex items-center justify-between">
                            <span className="text-slate-400">Доска:</span>
                            <span className="text-slate-200 font-mono">
                              {game.size}
                              ×
                              {game.size}
                            </span>
                          </div>
                          <div className="flex items-center justify-between">
                            <span className="text-slate-400">Ход:</span>
                            <span className="text-slate-200 font-bold">{turnNumber}</span>
                          </div>
                          {status === 'in_progress' && (
                            <div className="flex items-center justify-between">
                              <span className="text-slate-400">Сейчас:</span>
                              <span className="text-yellow-300 font-bold text-xs">
                                {currentPlayer}
                              </span>
                            </div>
                          )}
                        </div>

                        {/* Players & Scores */}
                        <div className="border-t border-slate-700 pt-4 mb-5">
                          <div className="space-y-2">
                            {game.players.map((player, idx) => (
                              <div
                                key={player}
                                className="flex items-center justify-between text-sm"
                              >
                                <div className="flex items-center gap-1">
                                  <span className={
                                    idx === game.currentPlayerIndex
                                      ? 'text-yellow-300 font-bold'
                                      : 'text-slate-400'
                                  }
                                  >
                                    {player}
                                  </span>
                                </div>
                                <span className="font-mono font-bold text-xl text-slate-200">
                                  {game.scores[player] || 0}
                                </span>
                              </div>
                            ))}
                          </div>
                        </div>

                        {/* Join Button */}
                        <button
                          className="w-full py-2.5 sm:py-3 bg-green-600 hover:bg-green-500 border-2 border-green-500 font-bold text-base sm:text-lg text-white transition-colors duration-150"
                          onClick={(e) => {
                            e.stopPropagation()
                            handleJoin(game)
                          }}
                        >
                          Присоединиться
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
