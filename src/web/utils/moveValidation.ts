/**
 * Move validation and construction utilities
 * Handles word formation and move submission logic
 */

import type { MoveBody } from '../lib/client'

export type Position = { row: number, col: number }
export type Board = (string | null)[][]

/**
 * Build word string from path on board
 * @param wordPath Array of positions forming the word
 * @param board Current game board
 * @param selectedCell Position of newly placed letter
 * @param selectedLetter The newly placed letter
 * @returns Formed word as string
 */
export function formWordFromPath(
  wordPath: Position[],
  board: Board,
  selectedCell?: Position,
  selectedLetter?: string,
): string {
  return wordPath.map((pos) => {
    const cell = board[pos.row]?.[pos.col]
    // If this position is the selected cell and it's empty, use the selected letter
    if (pos.row === selectedCell?.row && pos.col === selectedCell?.col && !cell) {
      return selectedLetter || '?'
    }
    return cell || ''
  }).join('')
}

/**
 * Validate if a move can be submitted
 * @param selectedCell Position where letter will be placed
 * @param selectedLetter The letter to place
 * @param wordPath Path of cells forming the word
 * @returns true if move is valid for submission
 */
export function canSubmitMove(
  selectedCell: Position | undefined,
  selectedLetter: string | undefined,
  wordPath: Position[],
): boolean {
  // Need: selected cell, selected letter, and word path with at least 2 letters
  return !!(selectedCell && selectedLetter && wordPath.length >= 2)
}

/**
 * Build MoveBody object for API submission
 * @param playerName Name of the player making the move
 * @param selectedCell Position where letter will be placed
 * @param selectedLetter The letter to place
 * @param word The formed word (uppercase)
 * @returns MoveBody object ready for API
 */
export function buildMoveBody(
  playerName: string,
  selectedCell: Position,
  selectedLetter: string,
  word: string,
): MoveBody {
  return {
    playerId: playerName,
    position: selectedCell,
    letter: selectedLetter,
    word: word.toUpperCase(),
  }
}
