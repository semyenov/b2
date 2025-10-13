import type { GameState } from '../../lib/client'
import { memo } from 'react'
import { usePlayerStats } from '../../hooks/usePlayerStats'
import { cn } from '../../utils/classNames'

export interface SidebarProps {
  game: GameState
  playerIndex: 0 | 1
}

/**
 * Sidebar Component - Player Stats Display
 * Modern player stats sidebar with enhanced visual design, better typography,
 * improved animations, and more intuitive score display
 */
export const Sidebar = memo(({ game, playerIndex }: SidebarProps) => {
  const isCurrentTurn = game.currentPlayerIndex === playerIndex

  // Use extracted hook for player statistics
  const { playerWords, letterCount, isScoreTied, isLetterCountTied, isWinningByScore, isWinningByLetters, score } = usePlayerStats({ game, playerIndex })

  return (
    <div className={cn(
      'flex flex-col h-full w-full min-h-0 transition-all duration-300',
      'bg-slate-800 border-2 border-slate-600',
    )}
    >
      {/* Clean Header Panel */}
      <div className="px-4 py-4 border-b shrink-0 transition-all duration-300 bg-slate-900 border-slate-700 relative">
        {/* Move indicator - absolutely positioned at vertical center */}
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 z-10 flex flex-col gap-1">
          {Array.from({ length: 16 }, (_, i) => (
            <div
              key={i}
              className={cn(
                'w-[2px] h-[2px] transition-all duration-300',
                {
                  'bg-yellow-500/30 animate-pulse': isCurrentTurn,
                  'bg-slate-600/40': !isCurrentTurn,
                },
              )}
            />
          ))}
        </div>

        {/* Stats display */}
        <div className="grid grid-cols-2 gap-4">
          {/* Letters count */}
          <div className="bg-slate-800 border border-slate-700 p-4 transition-all duration-300 hover:bg-slate-700">
            <div className="text-center">
              <div className="flex flex-col items-center gap-2">
                <div className="text-4xl font-bold text-slate-300 transition-colors duration-300">
                  {letterCount}
                </div>
                <div className="flex items-center gap-1">
                  <div className="text-xs font-medium text-slate-400 uppercase tracking-wider">
                    Буквы
                  </div>
                  {!isLetterCountTied && (
                    <div className={cn(
                      'text-xs font-bold transition-all duration-300',
                      isWinningByLetters
                        ? 'text-emerald-400'
                        : 'text-red-400',
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
          <div className="bg-slate-800 border border-slate-700 p-4 transition-all duration-300 hover:bg-slate-700">
            <div className="text-center">
              <div className="flex flex-col items-center gap-2">
                <div className="text-4xl font-bold text-slate-300 transition-colors duration-300">
                  {score}
                </div>
                <div className="flex items-center gap-1">
                  <div className="text-xs font-medium text-slate-400 uppercase tracking-wider">
                    Счёт
                  </div>
                  {!isScoreTied && (
                    <div className={cn(
                      'text-xs font-bold transition-all duration-300',
                      isWinningByScore
                        ? 'text-emerald-400'
                        : 'text-red-400',
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
        <div className="space-y-3">
          {playerWords.length === 0
            ? (
                <div className="flex flex-col items-center justify-center py-8 text-center">
                  <div className="w-16 h-16 bg-slate-800 flex items-center justify-center mb-4">
                    <span className="text-2xl text-slate-400">•</span>
                  </div>
                  <div className="text-slate-400 text-sm font-medium">
                    Пока нет слов
                  </div>
                  <div className="text-slate-500 text-xs mt-1">
                    Слова появятся здесь
                  </div>
                </div>
              )
            : (
                playerWords.slice().reverse().map((word, i) => (
                  <div
                    key={playerWords.length - i}
                    className={cn(
                      'group relative transition-all duration-300',
                      'bg-slate-900/50n border border-slate-700 hover:border-cyan-400',
                      'hover:shadow-lg hover:shadow-cyan-400/10 hover:scale-[1.02]',
                      'hover:bg-slate-700',
                      'animate-fade-slide-in',
                    )}
                    style={{ animationDelay: `${i * 50}ms` }}
                  >
                    <div className="px-4 py-3 flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 bg-cyan-500/20 flex items-center justify-center text-xs font-bold text-cyan-300">
                          {playerWords.length - i}
                        </div>
                        <span className="font-bold text-xl text-slate-300 group-hover:text-slate-300 transition-colors duration-200">
                          {word}
                        </span>
                      </div>

                      <div className="flex items-center gap-2">
                        <div className="text-xs font-bold text-slate-500 group-hover:text-cyan-400 transition-colors duration-200">
                          {word.length}
                          {' '}
                          букв
                        </div>
                        <div className="w-2 h-2 bg-cyan-400/50 group-hover:bg-cyan-400 transition-colors duration-200" />
                      </div>
                    </div>

                    {/* Hover effect overlay */}
                    <div className="absolute inset-0 bg-cyan-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                  </div>
                ))
              )}
        </div>
      </div>
    </div>
  )
})

Sidebar.displayName = 'Sidebar'
