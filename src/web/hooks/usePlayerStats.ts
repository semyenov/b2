import type { GameState } from '../lib/client'
import { useMemo } from 'react'

interface UsePlayerStatsOptions {
  game: GameState
  playerIndex: 0 | 1
}

interface PlayerStats {
  player: string
  score: number
  opponentPlayer: string
  opponentScore: number
  isWinning: boolean
  isTied: boolean
  scoreColor: string
  playerWords: string[]
  letterCount: number
}

/**
 * Player statistics hook
 *
 * Calculates player score status, win/tie/loss state, and word history
 * Extracted from PlayerPanel.tsx to separate logic from presentation
 *
 * @example
 * ```tsx
 * const stats = usePlayerStats({ game, playerIndex: 0 })
 * console.log(stats.isWinning, stats.scoreColor, stats.playerWords)
 * ```
 */
export function usePlayerStats({ game, playerIndex }: UsePlayerStatsOptions): PlayerStats {
  return useMemo(() => {
    const player = game.players[playerIndex]
    const score = game.scores[player] || 0

    // Calculate opponent score for comparison
    const opponentIndex = playerIndex === 0 ? 1 : 0
    const opponentPlayer = game.players[opponentIndex]
    const opponentScore = game.scores[opponentPlayer] || 0

    // Determine score status
    const isWinning = score > opponentScore
    const isTied = score === opponentScore

    // Score color based on status (green for winning, gray for tied, red for losing)
    const scoreColor = isWinning
      ? 'text-green-400'
      : isTied
        ? 'text-gray-100'
        : 'text-red-400'

    // Get words played by this player from moves history
    const playerWords = game.moves
      .filter(move => move.playerId === player)
      .map(move => move.word)

    // Calculate total letter count (sum of word lengths)
    const letterCount = game.moves
      .filter(move => move.playerId === player)
      .reduce((acc, move) => acc + move.word.length, 0)

    return {
      player,
      score,
      opponentPlayer,
      opponentScore,
      isWinning,
      isTied,
      scoreColor,
      playerWords,
      letterCount,
    }
  }, [game, playerIndex])
}
