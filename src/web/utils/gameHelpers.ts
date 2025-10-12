/**
 * Game Helper Utilities
 * Reusable functions for game state analysis and formatting
 */

import type { GameState } from '../lib/client'

export type GameStatus = 'waiting' | 'in_progress' | 'finished'

/**
 * Extract the base word from the center row of the game board
 */
export function getBaseWord(game: GameState): string {
  const centerRow = Math.floor(game.size / 2)
  return game.board[centerRow]
    .map(cell => cell || '')
    .join('')
    .trim()
}

/**
 * Determine the current status of a game
 */
export function getGameStatus(game: GameState): GameStatus {
  if (game.moves.length === 0)
    return 'waiting'

  // Game is finished if board is nearly full
  const emptyCount = game.board.flat().filter(cell => cell === null).length
  if (emptyCount <= 2)
    return 'finished'

  return 'in_progress'
}

/**
 * Format timestamp as time ago string (e.g., "5m ago", "2h ago")
 */
export function formatTimeAgo(timestamp: number): string {
  const seconds = Math.floor((Date.now() - timestamp) / 1000)

  if (seconds < 60) {
    return 'just now'
  }

  const minutes = Math.floor(seconds / 60)
  if (minutes < 60) {
    return `${minutes}m ago`
  }

  const hours = Math.floor(minutes / 60)
  if (hours < 24) {
    return `${hours}h ago`
  }

  const days = Math.floor(hours / 24)
  return `${days}d ago`
}

/**
 * Get the winner of a finished game
 * @param game - The game state
 * @returns Winner's name or null if game not finished/tied
 */
export function getWinner(game: GameState): string | null {
  const status = getGameStatus(game)
  if (status !== 'finished') {
    return null
  }

  const scores = game.players.map(player => ({
    player,
    score: game.scores[player] || 0,
  }))

  scores.sort((a, b) => b.score - a.score)

  // Return null if tie
  if (scores[0].score === scores[1]?.score) {
    return null
  }

  return scores[0].player
}

/**
 * Calculate total moves made in the game
 * @param game - The game state
 * @returns Number of moves
 */
export function getTotalMoves(game: GameState): number {
  return game.moves.length
}

/**
 * Get current turn number (1-indexed)
 * @param game - The game state
 * @returns Current turn number
 */
export function getCurrentTurn(game: GameState): number {
  return Math.floor(game.moves.length / game.players.length) + 1
}
