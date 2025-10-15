import type { GameState, MoveBody, Suggestion } from '@lib/client'
import type { Position } from '@types'
import { buildMoveBody, canSubmitMove } from '@utils/moveValidation'
import { getFormedWord } from '@utils/wordUtils'
import { useCallback, useMemo } from 'react'

/**
 * useGameActions Hook
 *
 * Encapsulates game action handlers and derived state for the game screen.
 * Manages move submission, suggestion selection, and word formation logic.
 *
 * **Design Pattern:**
 * - Extracts action handler logic from presentation components
 * - Memoizes expensive word formation calculations
 * - Provides stable callback references with useCallback
 * - Separates business logic from UI rendering
 *
 * @param params - Configuration object
 * @param params.game - Current game state
 * @param params.playerName - Current player's name
 * @param params.selectedCell - Currently selected cell position
 * @param params.selectedLetter - Currently selected letter
 * @param params.wordPath - Array of positions forming the word path
 * @param params.onSubmitMove - Callback to submit a move to the backend
 * @param params.onSuggestionSelect - Callback when a suggestion is selected
 * @param params.onHideSuggestions - Callback to hide the suggestions panel
 * @returns Object containing action handlers and derived state
 *
 * @example
 * ```tsx
 * function GameScreen({ game, playerName, ... }) {
 *   const { formedWord, handleSubmitMove, handleSuggestionSelect } = useGameActions({
 *     game,
 *     playerName,
 *     selectedCell,
 *     selectedLetter,
 *     wordPath,
 *     onSubmitMove: (move) => client.submitMove(gameId, move),
 *     onSuggestionSelect: (s) => selectSuggestion(s),
 *     onHideSuggestions: () => setShowSuggestions(false),
 *   })
 *
 *   return <ControlBar onSubmit={handleSubmitMove} word={formedWord} />
 * }
 * ```
 */
export function useGameActions({
  game,
  playerName,
  selectedCell,
  selectedLetter,
  wordPath,
  onSubmitMove,
  onSuggestionSelect,
  onHideSuggestions,
}: {
  game: GameState
  playerName: string
  selectedCell?: Position
  selectedLetter?: string
  wordPath: Position[]
  onSubmitMove: (move: MoveBody) => void
  onSuggestionSelect: (suggestion: Suggestion) => void
  onHideSuggestions: () => void
}) {
  /**
   * Compute the formed word from the current selection state
   * Memoized to avoid recalculation on every render
   */
  const formedWord = useMemo(
    () => selectedLetter ? getFormedWord(game, selectedCell, selectedLetter, wordPath) : '',
    [game, selectedCell, selectedLetter, wordPath],
  )

  /**
   * Handle move submission
   * Validates the move and calls the submission callback with properly formatted data
   */
  const handleSubmitMove = useCallback(() => {
    if (canSubmitMove(selectedCell, selectedLetter, wordPath) && selectedCell && selectedLetter) {
      const moveBody = buildMoveBody(playerName, selectedCell, selectedLetter, formedWord)
      onSubmitMove(moveBody)
    }
  }, [selectedCell, selectedLetter, wordPath, playerName, formedWord, onSubmitMove])

  /**
   * Handle suggestion selection
   * Selects the suggestion and automatically hides the suggestions panel
   */
  const handleSuggestionSelect = useCallback((suggestion: Suggestion) => {
    onSuggestionSelect(suggestion)
    onHideSuggestions()
  }, [onSuggestionSelect, onHideSuggestions])

  return {
    /**
     * The word formed by the current selection (empty string if incomplete)
     */
    formedWord,

    /**
     * Handler to submit the current move
     */
    handleSubmitMove,

    /**
     * Handler to select an AI suggestion
     */
    handleSuggestionSelect,
  }
}
