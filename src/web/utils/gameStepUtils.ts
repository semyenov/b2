/**
 * Game step determination utilities
 * Determines the current step in the game flow for UI rendering
 */

import type { GameStep, Position } from '@types'

// Re-export for modules that use this utility
export type { GameStep }

interface GameStepParams {
  isMyTurn: boolean
  selectedCell?: Position
  selectedLetter?: string
  wordPathLength: number
}

/**
 * Determine the current game step based on player state
 */
export function getGameStep(params: GameStepParams): GameStep {
  const { isMyTurn, selectedCell, selectedLetter, wordPathLength } = params

  if (!isMyTurn)
    return 'waiting'

  if (!selectedCell)
    return 'select-cell'

  if (!selectedLetter)
    return 'select-letter'

  if (wordPathLength < 2)
    return 'build-word'

  return 'ready-to-submit'
}
