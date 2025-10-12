import type { Position } from '../types/game'

/**
 * UI Helper Functions
 * Component-level calculations and UI logic extracted for reusability
 */

/**
 * Determines if the alphabet/suggestions panel should be shown
 * Shows when: suggestions are active OR user needs to select a letter
 *
 * @param showSuggestions - Whether suggestions panel is active
 * @param selectedCell - Currently selected board cell
 * @param selectedLetter - Currently selected letter
 * @returns True if panel should be visible
 */
export function shouldShowAlphabetPanel(
  showSuggestions: boolean,
  selectedCell: Position | undefined,
  selectedLetter: string | undefined,
): boolean {
  return showSuggestions || (!!selectedCell && !selectedLetter)
}

/**
 * Determines if the clear button should be disabled
 * Disabled when: not player's turn OR nothing to clear
 *
 * @param isMyTurn - Whether it's the current player's turn
 * @param selectedCell - Currently selected board cell
 * @param selectedLetter - Currently selected letter
 * @param wordPath - Current word path
 * @returns True if button should be disabled
 */
export function isClearButtonDisabled(
  isMyTurn: boolean,
  selectedCell: Position | undefined,
  selectedLetter: string | undefined,
  wordPath: Position[],
): boolean {
  return !isMyTurn || (!selectedCell && !selectedLetter && wordPath.length === 0)
}

/**
 * Determines if a letter button in the alphabet grid should be disabled
 *
 * @param disabled - Global disabled state
 * @param selectedCell - Currently selected board cell
 * @param selectedLetter - Currently selected letter
 * @param letter - The letter being checked
 * @returns True if button should be disabled
 */
export function isLetterButtonDisabled(
  disabled: boolean,
  selectedCell: Position | undefined,
  selectedLetter: string | undefined,
  letter: string,
): boolean {
  const isSelected = selectedLetter === letter
  return (disabled || !selectedCell || !!selectedLetter) && !isSelected
}
