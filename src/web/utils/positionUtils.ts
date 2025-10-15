/**
 * Position utility functions
 * Helper functions for working with board positions
 */

import type { Board, Position } from '@types'

/**
 * Check if two positions are the same
 */
export function isSamePosition(pos1: Position, pos2: Position): boolean {
  return pos1.row === pos2.row && pos1.col === pos2.col
}

/**
 * Check if a position has a letter (either existing on board or newly placed)
 */
export function hasLetterAtPosition(
  board: Board,
  position: Position,
  selectedCell?: Position,
  selectedLetter?: string,
): boolean {
  // Position is guaranteed to be valid board coordinates by caller
  const existingLetter = board[position.row]![position.col]
  const isSelectedPosition = selectedCell ? isSamePosition(position, selectedCell) : false

  return !!existingLetter || (isSelectedPosition && !!selectedLetter)
}

/**
 * Check if two positions are orthogonally adjacent
 */
export function isAdjacent(pos1: Position, pos2: Position): boolean {
  return (Math.abs(pos1.row - pos2.row) === 1 && pos1.col === pos2.col)
    || (Math.abs(pos1.col - pos2.col) === 1 && pos1.row === pos2.row)
}
