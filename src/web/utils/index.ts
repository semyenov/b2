/**
 * Utility Functions - Pure helper functions
 *
 * Centralized exports for all utility functions
 * Organized by domain: game logic, board validation, UI helpers, formatting
 */

// Board & Game Logic
export { canClickCell, getPositionPathIndex, isPositionInWordPath, isPositionSelected } from './boardValidation'
export { getCellClassName } from './cellStyling'
// Shared Utilities
export { cn } from './classNames'
// Coordinate & Labels
export { getCellAriaLabel, getCoordLabel } from './coordinateLabels'

export { formatTimeAgo, getBaseWord, getCurrentTurn, getGameStatus, getTotalMoves, getWinner } from './gameHelpers'
export { findWordPath } from './gamePathFinder'

// UI Helpers
export { getGameStep } from './gameStepUtils'

export type { GameStep } from './gameStepUtils'
// Logging
export { logger } from './logger'
// Move & Word Validation
export { buildMoveBody, canSubmitMove } from './moveValidation'

// Player Utilities
export { generatePlayerName, isValidPlayerName, promptPlayerName } from './playerNameUtils'

// Position Utilities
export { hasLetterAtPosition, isAdjacent, isSamePosition } from './positionUtils'
// Formatting & i18n
export { getRussianPluralForm } from './russianPlural'

// Suggestions
export { getScoreColor, getScoreTier, getSuggestionCoordLabel, groupSuggestionsByTier } from './suggestionHelpers'

export type { ScoreTier } from './suggestionHelpers'

export { isClearButtonDisabled, shouldShowAlphabetPanel } from './uiHelpers'

export { formWordFromPath, getFormedWord } from './wordUtils'
