/**
 * Coordinate label utilities
 *
 * Extracted from Board.tsx to separate coordinate logic
 * Provides pure functions for board coordinate calculations and ARIA labels
 */

import { A11Y_LABELS } from '../constants/game'

/**
 * Get coordinate label for a board position
 *
 * Format: "row + column letter"
 * Example: (0, 0) -> "0А", (1, 2) -> "1В"
 *
 * @param row - Row index (0-based)
 * @param col - Column index (0-based)
 * @returns Coordinate label string
 */
export function getCoordLabel(row: number, col: number): string {
  return `${row}${String.fromCharCode(1040 + col)}`
}

interface GetCellAriaLabelOptions {
  row: number
  col: number
  cell: string | null
  selected: boolean
  inPath: boolean
  pathIdx: number
  selectedLetter?: string
}

/**
 * Get ARIA label for board cell
 *
 * Provides accessible description of cell state for screen readers
 *
 * @param options - Cell state options
 * @returns ARIA label string
 */
export function getCellAriaLabel({
  row,
  col,
  cell,
  selected,
  inPath,
  pathIdx,
  selectedLetter,
}: GetCellAriaLabelOptions): string {
  const coord = getCoordLabel(row, col)

  if (selected && selectedLetter) {
    return A11Y_LABELS.BOARD_CELL_SELECTED(coord, selectedLetter)
  }

  if (inPath && pathIdx >= 0) {
    const letter = cell || selectedLetter || ''
    return A11Y_LABELS.BOARD_CELL_IN_PATH(coord, letter, pathIdx + 1)
  }

  if (cell) {
    return A11Y_LABELS.BOARD_CELL_FILLED(coord, cell)
  }

  return A11Y_LABELS.BOARD_CELL_EMPTY(coord)
}
