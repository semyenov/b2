import type { GameState, Suggestion } from '../lib/client'
import { useState } from 'react'
import { findWordPath } from '../utils/gamePathFinder'

interface UseGameInteractionOptions {
  currentGame: GameState | null
  isMyTurn: () => boolean
}

interface UseGameInteractionReturn {
  selectedCell: { row: number, col: number } | undefined
  selectedLetter: string
  wordPath: Array<{ row: number, col: number }>
  handleCellClick: (row: number, col: number) => void
  handleLetterSelect: (letter: string) => void
  handleClearSelection: () => void
  handleSuggestionSelect: (suggestion: Suggestion) => void
  clearAll: () => void
}

export function useGameInteraction({
  currentGame,
  isMyTurn,
}: UseGameInteractionOptions): UseGameInteractionReturn {
  // Mouse interaction state
  const [selectedCell, setSelectedCell] = useState<
    { row: number, col: number } | undefined
  >()
  const [selectedLetter, setSelectedLetter] = useState<string>('')
  const [wordPath, setWordPath] = useState<
    Array<{ row: number, col: number }>
  >([])

  const handleCellClick = (row: number, col: number) => {
    if (!currentGame || !isMyTurn()) {
      return
    }

    // If no cell selected yet, select empty cell
    if (!selectedCell) {
      if (!currentGame.board[row][col]) {
        setSelectedCell({ row, col })
        setWordPath([])
      }
      return
    }

    // If we have cell and letter, build word path
    if (selectedLetter) {
      // Check if clicking the selected cell itself
      if (row === selectedCell.row && col === selectedCell.col) {
        // Add selected cell to path if not already there
        if (!wordPath.some(p => p.row === row && p.col === col)) {
          setWordPath([...wordPath, { row, col }])
        }
        return
      }

      // Check if cell is already in path
      const pathIndex = wordPath.findIndex(p => p.row === row && p.col === col)
      if (pathIndex >= 0) {
        // Remove from path by clicking again
        setWordPath(wordPath.slice(0, pathIndex))
        return
      }

      // First letter: can be any letter on board (no adjacency requirement)
      if (wordPath.length === 0) {
        // Check if cell has a letter (existing or the selected cell with new letter)
        const hasLetter = currentGame.board[row][col]
          || (row === selectedCell.row && col === selectedCell.col)
        if (hasLetter) {
          setWordPath([{ row, col }])
        }
      }
      else {
        // Subsequent letters: must be orthogonally adjacent to last letter in path
        const lastPos = wordPath[wordPath.length - 1]
        const isAdjacent = (Math.abs(row - lastPos.row) === 1 && col === lastPos.col)
          || (Math.abs(col - lastPos.col) === 1 && row === lastPos.row)

        const hasLetter = currentGame.board[row][col]
          || (row === selectedCell.row && col === selectedCell.col)
        if (isAdjacent && hasLetter) {
          setWordPath([...wordPath, { row, col }])
        }
      }
    }
  }

  const handleLetterSelect = (letter: string) => {
    if (selectedCell && !selectedLetter) {
      setSelectedLetter(letter)
      // DO NOT auto-add to path - user must explicitly click cells to build word
      setWordPath([])
    }
  }

  const handleClearSelection = () => {
    setSelectedCell(undefined)
    setSelectedLetter('')
    setWordPath([])
  }

  const handleSuggestionSelect = (suggestion: Suggestion) => {
    if (!currentGame) {
      return
    }

    setSelectedCell(suggestion.position)
    setSelectedLetter(suggestion.letter)

    // Build word path from suggestion using path-finding
    const path = findWordPath(
      currentGame.board,
      suggestion.position,
      suggestion.letter,
      suggestion.word.toUpperCase(),
    )

    if (path) {
      setWordPath(path)
    }
  }

  const clearAll = () => {
    setSelectedCell(undefined)
    setSelectedLetter('')
    setWordPath([])
  }

  return {
    selectedCell,
    selectedLetter,
    wordPath,
    handleCellClick,
    handleLetterSelect,
    handleClearSelection,
    handleSuggestionSelect,
    clearAll,
  }
}
