import type { GameState } from '../lib/client'

/**
 * Word utility functions
 * Handles word formation and validation
 */

/**
 * Forms a word from the current path on the board
 * @param wordPath - Array of positions in the word
 * @param board - Current game board state
 * @param selectedCell - Cell with new letter placement
 * @param selectedLetter - Letter to place
 * @returns Formed word as uppercase string
 */
export function formWordFromPath(
  wordPath: Array<{ row: number, col: number }>,
  board: (string | null)[][],
  selectedCell?: { row: number, col: number },
  selectedLetter?: string,
): string {
  return wordPath
    .map((pos) => {
      // If this position is the selected cell, use the selected letter
      if (
        selectedCell
        && pos.row === selectedCell.row
        && pos.col === selectedCell.col
        && selectedLetter
      ) {
        return selectedLetter
      }
      // Otherwise use the letter from the board
      return board[pos.row][pos.col] || ''
    })
    .join('')
    .toUpperCase()
}

/**
 * Calculate formed word for display in UI
 * @param currentGame - Current game state
 * @param selectedCell - Selected cell for new letter
 * @param selectedLetter - Letter to place
 * @param wordPath - Path of positions forming the word
 * @returns Formed word or empty string if invalid
 */
export function getFormedWord(
  currentGame: GameState | null,
  selectedCell: { row: number, col: number } | undefined,
  selectedLetter: string,
  wordPath: Array<{ row: number, col: number }>,
): string {
  if (!currentGame || !selectedCell || !selectedLetter || wordPath.length < 2) {
    return ''
  }
  return formWordFromPath(wordPath, currentGame.board, selectedCell, selectedLetter)
}
