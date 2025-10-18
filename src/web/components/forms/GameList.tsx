import type { GameState } from '@lib/client'
import type { BadgeVariant } from '../ui'
import { UI_MESSAGES } from '@constants/messages'
import { STATUS_CONFIG } from '@constants/statusConfig'
import { useKeyboardNavigation } from '@hooks/useKeyboardNavigation'
import { formatTimeAgo, getBaseWord, getGameStatus } from '@utils/gameHelpers'
import { getRussianPluralForm } from '@utils/russianPlural'
import { memo } from 'react'
import { Badge, Button, Card } from '../ui'

export interface GameListProps {
  games: GameState[]
  onJoin: (gameId: string, playerName: string) => void
  onBack: () => void
}

/**
 * Game List Component
 * Displays available games for joining with game status, board size, and player info
 * Shows empty state when no games are available
 */
export const GameList = memo(({ games, onJoin, onBack }: GameListProps) => {
  const { handleKeyDown } = useKeyboardNavigation()

  const handleJoin = (game: GameState) => {
    const playerName = `Player_${Date.now()}`
    onJoin(game.id, playerName)
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-900 to-gray-800 py-8">
      <div className="max-w-7xl mx-auto px-6">
        {/* Header */}
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-3xl font-bold text-info-400 mb-2">{UI_MESSAGES.AVAILABLE_GAMES}</h1>
            <p className="text-surface-400 text-base">{UI_MESSAGES.AVAILABLE_GAMES_SUBTITLE}</p>
          </div>
          <Button variant="gray" size="md" onClick={onBack}>
            {UI_MESSAGES.BACK_TO_MENU}
          </Button>
        </div>

        {/* Games Grid */}
        {games.length === 0
          ? (
              <Card variant="default" padding="spacious" className="text-center">
                <div className="text-6xl mb-4">🎮</div>
                <h3 className="text-xl font-bold text-surface-300 mb-2">{UI_MESSAGES.NO_GAMES_AVAILABLE}</h3>
                <p className="text-surface-400 text-base mb-6">{UI_MESSAGES.NO_GAMES_MESSAGE}</p>
                <Button variant="primary" size="lg" onClick={onBack}>
                  {UI_MESSAGES.CREATE_NEW_GAME}
                </Button>
              </Card>
            )
          : (
              <>
                <div className="text-surface-400 mb-4">
                  {games.length}
                  {' '}
                  {getRussianPluralForm(games.length, UI_MESSAGES.GAME_PLURAL)}
                  {' '}
                  {getRussianPluralForm(games.length, UI_MESSAGES.AVAILABLE_PLURAL)}
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {games.map((game) => {
                    const status = getGameStatus(game)
                    const baseWord = getBaseWord(game)
                    const turnNumber = Math.floor(game.moves.length / 2) + 1
                    const currentPlayer = game.players[game.currentPlayerIndex]
                    const timeAgo = formatTimeAgo(game.createdAt)

                    const statusInfo = STATUS_CONFIG[status]

                    // Map status to badge variant
                    const badgeVariant: BadgeVariant = status === 'waiting'
                      ? 'warning'
                      : status === 'in_progress'
                        ? 'success'
                        : 'gray'

                    return (
                      <Card
                        key={game.id}
                        variant="default"
                        padding="default"
                        interactive
                        role="button"
                        tabIndex={0}
                        onClick={() => handleJoin(game)}
                        onKeyDown={e => handleKeyDown(e, () => handleJoin(game))}
                        aria-label={UI_MESSAGES.JOIN_GAME_ARIA(baseWord, game.size, statusInfo.label)}
                      >
                        {/* Header: Status + Time */}
                        <div className="flex justify-between items-start mb-4">
                          <Badge variant={badgeVariant} size="md">
                            {statusInfo.label}
                          </Badge>
                          <div className="text-xs text-surface-500">{timeAgo}</div>
                        </div>

                        {/* Base Word */}
                        <div className="mb-4">
                          <div className="text-2xl font-bold text-info-400 tracking-wider mb-1">
                            {baseWord}
                          </div>
                          <div className="text-xs text-surface-500 font-mono">
                            {game.id.substring(0, 8)}
                            ...
                          </div>
                        </div>

                        {/* Game Info */}
                        <div className="space-y-2 mb-5 text-sm">
                          <div className="flex items-center justify-between">
                            <span className="text-surface-400">{UI_MESSAGES.BOARD_LABEL}</span>
                            <span className="text-surface-300 font-mono">
                              {game.size}
                              ×
                              {game.size}
                            </span>
                          </div>
                          <div className="flex items-center justify-between">
                            <span className="text-surface-400">{UI_MESSAGES.TURN_LABEL}</span>
                            <span className="text-surface-300 font-bold">{turnNumber}</span>
                          </div>
                          {status === 'in_progress' && (
                            <div className="flex items-center justify-between">
                              <span className="text-surface-400">{UI_MESSAGES.CURRENT_PLAYER_LABEL}</span>
                              <span className="text-user-300 font-bold text-xs">
                                {currentPlayer}
                              </span>
                            </div>
                          )}
                        </div>

                        {/* Players & Scores */}
                        <div className="border-t border-surface-700 pt-4 mb-5">
                          <div className="space-y-2">
                            {game.players.map((player, idx) => (
                              <div
                                key={player}
                                className="flex items-center justify-between text-sm"
                              >
                                <div className="flex items-center gap-1">
                                  <span className={
                                    idx === game.currentPlayerIndex
                                      ? 'text-user-300 font-bold'
                                      : 'text-surface-400'
                                  }
                                  >
                                    {player}
                                  </span>
                                </div>
                                <span className="font-mono font-bold text-xl text-surface-300">
                                  {game.scores[player] || 0}
                                </span>
                              </div>
                            ))}
                          </div>
                        </div>

                        {/* Join Button */}
                        <Button
                          variant="success"
                          size="md"
                          fullWidth
                          onClick={(e) => {
                            e.stopPropagation()
                            handleJoin(game)
                          }}
                        >
                          {UI_MESSAGES.JOIN}
                        </Button>
                      </Card>
                    )
                  })}
                </div>
              </>
            )}
      </div>
    </div>
  )
})

GameList.displayName = 'GameList'
