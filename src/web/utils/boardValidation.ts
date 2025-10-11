/**
 * Board interaction validation utilities
 * Contains game rules for cell click validation
 */

export interface Position { row: number, col: number }
export type Board = (string | null)[][]

interface CanClickCellParams {
  row: number
  col: number
  board: Board
  disabled: boolean
  selectedCell?: Position
  selectedLetter?: string
  wordPath: Position[]
}

/**
 * Helper: Check if position is in word path
 */
function isInWordPath(row: number, col: number, wordPath: Position[]): boolean {
  return wordPath.some(pos => pos.row === row && pos.col === col)
}

/**
 * Helper: Check if position is the selected cell
 */
function isSelected(row: number, col: number, selectedCell?: Position): boolean {
  return selectedCell?.row === row && selectedCell?.col === col
}

/**
 * Determine if a cell can be clicked based on current game state
 * Implements Balda game rules for cell selection
 *
 * @param params Cell position and current game state
 * @returns true if cell can be clicked
 */
export function canClickCell(params: CanClickCellParams): boolean {
  const { row, col, board, disabled, selectedCell, selectedLetter, wordPath } = params

  if (disabled) {
    return false
  }

  const cell = board[row][col]

  // If no cell selected yet, can only click empty cells
  if (!selectedCell) {
    return !cell
  }

  // If cell selected but no letter, can't click anything
  if (!selectedLetter) {
    return false
  }

  // If we have selected cell and letter, can click letters to form word
  const hasLetter = !!cell || isSelected(row, col, selectedCell)

  // First letter: can be any letter on board (no adjacency requirement)
  if (wordPath.length === 0) {
    return hasLetter
  }

  // Subsequent letters: must be orthogonally adjacent to last letter in path
  const lastPos = wordPath[wordPath.length - 1]
  const isAdjacent = (Math.abs(row - lastPos.row) === 1 && col === lastPos.col)
    || (Math.abs(col - lastPos.col) === 1 && row === lastPos.row)

  return isAdjacent && hasLetter && !isInWordPath(row, col, wordPath)
}

/**
 * Helper: Check if position is in word path (exported for component use)
 */
export function isPositionInWordPath(row: number, col: number, wordPath: Position[]): boolean {
  return isInWordPath(row, col, wordPath)
}

/**
 * Helper: Get index of position in word path
 */
export function getPositionPathIndex(row: number, col: number, wordPath: Position[]): number {
  return wordPath.findIndex(pos => pos.row === row && pos.col === col)
}

/**
 * Helper: Check if position is selected cell
 */
export function isPositionSelected(row: number, col: number, selectedCell?: Position): boolean {
  return isSelected(row, col, selectedCell)
}
