import type { GameState } from '@lib/client'
import { usePlayerStats } from '@hooks/usePlayerStats'
import { cn } from '@utils/classNames'
import { getRussianPluralForm } from '@utils/russianPlural'
import { calculateWordScore } from '@utils/wordScore'
import { memo } from 'react'

export interface SidebarProps {
  game: GameState
  playerIndex: 0 | 1
  onWordHover?: (playerIndex: number, wordIndex: number) => void
  onWordLeave?: () => void
}

/**
 * Sidebar Component - Player Stats Display
 * Modern player stats sidebar with enhanced visual design, better typography,
 * improved animations, and more intuitive score display
 */
export const Sidebar = memo(({ game, playerIndex, onWordHover, onWordLeave }: SidebarProps) => {
  const isCurrentTurn = game.currentPlayerIndex === playerIndex

  // Use extracted hook for player statistics
  const { playerWords, letterCount, isScoreTied, isLetterCountTied, isWinningByScore, isWinningByLetters, score } = usePlayerStats({ game, playerIndex })

  return (
    <div className={cn(
      'flex flex-col h-full w-full min-h-0 transition-all duration-300',
      'bg-surface-800 border border-surface-700 ring-1 ring-surface-600',
    )}
    >
      {/* Clean Header Panel */}
      <div className="px-4 py-4 border-b shrink-0 transition-all duration-300 bg-surface-900 border-surface-700 relative">
        {/* Move indicator - absolutely positioned at vertical center */}
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 z-10 flex flex-col gap-1">
          {Array.from({ length: 16 }, (_, i) => (
            <div
              key={i}
              className={cn(
                'w-[2px] h-[2px] transition-all duration-300',
                {
                  'bg-user-500/30 animate-pulse': isCurrentTurn,
                  'bg-surface-600/40': !isCurrentTurn,
                },
              )}
            />
          ))}
        </div>

        {/* Stats display */}
        <div className="grid grid-cols-2 gap-4">
          {/* Letters count */}
          <div className="bg-surface-800 border border-surface-700 p-4 transition-all duration-300 hover:bg-surface-700">
            <div className="text-center">
              <div className="flex flex-col items-center gap-2">
                <div className="text-4xl font-bold text-surface-300 transition-colors duration-300 tracking-wider">
                  {letterCount}
                </div>
                <div className="flex items-center gap-1">
                  <div className="text-xs font-medium text-surface-400 uppercase tracking-wider">
                    Счет
                  </div>
                  {!isLetterCountTied && (
                    <div className={cn(
                      'text-xs font-bold transition-all duration-300',
                      isWinningByLetters
                        ? 'text-user-400'
                        : 'text-danger-400',
                    )}
                    >
                      {isWinningByLetters ? '▲' : '▼'}
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Score */}
          <div className="bg-surface-800 border border-surface-700 p-4 transition-all duration-300 hover:bg-surface-700">
            <div className="text-center">
              <div className="flex flex-col items-center gap-2">
                <div className="text-4xl font-bold text-surface-300 transition-colors duration-300 tracking-wider">
                  {score}
                </div>
                <div className="flex items-center gap-1">
                  <div className="text-xs font-medium text-surface-400 uppercase tracking-wider">
                    Очки
                  </div>
                  {!isScoreTied && (
                    <div className={cn(
                      'text-xs font-bold transition-all duration-300',
                      isWinningByScore
                        ? 'text-user-400'
                        : 'text-danger-400',
                    )}
                    >
                      {isWinningByScore ? '▲' : '▼'}
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Enhanced words list */}
      <div className="flex-1 overflow-y-auto px-4 py-4 min-h-0 relative">
        <div className="space-y-2">
          {playerWords.length === 0
            ? (
                <div className="flex flex-col items-center justify-center h-full text-center px-6">
                  <div className="space-y-6">
                    <div className="space-y-0.5">
                      <div className="text-surface-500 text-2xl font-bold tracking-wide uppercase leading-tight">
                        ПУСТО
                      </div>
                      <div className="text-surface-600 text-sm leading-tight max-w-[200px]">
                        составляйте слова, чтобы увидеть их здесь
                      </div>
                    </div>
                    <div className="flex flex-col gap-3 opacity-30">
                      <div className="h-px w-24 bg-gradient-to-r from-transparent via-surface-700 to-transparent mx-auto" />
                      <div className="h-px w-16 bg-gradient-to-r from-transparent via-surface-700 to-transparent mx-auto" />
                      <div className="h-px w-20 bg-gradient-to-r from-transparent via-surface-700 to-transparent mx-auto" />
                    </div>
                  </div>
                </div>
              )
            : (
                playerWords.slice().reverse().map((word, i) => {
                  // Original index in moves array (not reversed)
                  const originalWordIndex = playerWords.length - 1 - i
                  const wordScore = calculateWordScore(word)
                  return (
                    <div
                      key={playerWords.length - i}
                      onMouseEnter={() => onWordHover?.(playerIndex, originalWordIndex)}
                      onMouseLeave={() => onWordLeave?.()}
                      className={cn(
                        'group relative transition-all duration-300',
                        'bg-surface-900/80 border border-surface-700 hover:border-info-400',
                        'hover:shadow-lg hover:shadow-info-400/10 hover:scale-[1.02]',
                        'hover:bg-surface-700',
                        'animate-fade-slide-in',
                      )}
                      style={{ animationDelay: `${i * 50}ms` }}
                    >
                    <div className="px-4 py-3 flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 bg-info-500/20 flex items-center justify-center text-xs font-bold text-info-300">
                          {wordScore}
                        </div>
                        <span className="font-bold text-xl text-surface-300 group-hover:text-info-100 transition-colors duration-200 tracking-wider">
                          {word}
                        </span>
                      </div>

                      <div className="flex items-center gap-2">
                        <div className="text-xs font-bold text-surface-500 group-hover:text-info-400 transition-colors duration-200">
                          {word.length}
                          {' '}
                          {getRussianPluralForm(word.length, ['буква', 'буквы', 'букв'])}
                        </div>
                        <div className="w-2 h-2 bg-info-400/50 group-hover:bg-info-400 transition-colors duration-200" />
                      </div>
                    </div>

                      {/* Hover effect overlay */}
                      <div className="absolute inset-0 bg-info-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                    </div>
                  )
                })
              )}
        </div>
      </div>
    </div>
  )
})

Sidebar.displayName = 'Sidebar'
