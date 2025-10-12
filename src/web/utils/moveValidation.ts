/**
 * Move validation and construction utilities
 * Handles move submission logic
 */

import type { MoveBody } from '../lib/client'
import type { Position } from '../types/game'

/**
 * Validate if a move can be submitted
 * Requires: selected cell, selected letter, and word path with at least 2 letters
 */
export function canSubmitMove(
  selectedCell: Position | undefined,
  selectedLetter: string | undefined,
  wordPath: Position[],
): boolean {
  return !!(selectedCell && selectedLetter && wordPath.length >= 2)
}

/**
 * Build MoveBody object for API submission
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
