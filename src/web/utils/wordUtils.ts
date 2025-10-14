import type { GameState } from '@lib/client'
import type { Board, Position } from '@types'

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
  wordPath: Position[],
  board: Board,
  selectedCell?: Position,
  selectedLetter?: string,
): string {
  return wordPath
    .map((pos) => {
      const cell = board[pos.row]?.[pos.col]
      // If this position is the selected cell and it's empty, use the selected letter
      if (pos.row === selectedCell?.row && pos.col === selectedCell?.col && !cell) {
        return selectedLetter || ''
      }
      // Otherwise use the letter from the board
      return cell || ''
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
  selectedCell: Position | undefined,
  selectedLetter: string,
  wordPath: Position[],
): string {
  if (!currentGame || !selectedCell || !selectedLetter || wordPath.length < 2) {
    return ''
  }
  return formWordFromPath(wordPath, currentGame.board, selectedCell, selectedLetter)
}
