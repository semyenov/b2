import type { GameState, Suggestion } from '@lib/client'
import type { Position } from '@types'
import { findWordPath } from '@utils/gamePathFinder'
import { hasLetterAtPosition, isAdjacent, isSamePosition } from '@utils/positionUtils'
import { useCallback, useState } from 'react'

interface UseGameInteractionOptions {
  currentGame: GameState | null
  isMyTurn: () => boolean
}

interface UseGameInteractionReturn {
  selectedCell: Position | undefined
  selectedLetter: string
  wordPath: Position[]
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
  const [selectedCell, setSelectedCell] = useState<Position | undefined>()
  const [selectedLetter, setSelectedLetter] = useState<string>('')
  const [wordPath, setWordPath] = useState<Position[]>([])

  const handleCellClick = useCallback((row: number, col: number) => {
    if (!currentGame || !isMyTurn())
      return

    const clickedPos: Position = { row, col }

    // If no cell selected yet, select empty cell
    if (!selectedCell) {
      if (!currentGame.board[row][col]) {
        setSelectedCell(clickedPos)
        setWordPath([])
      }
      return
    }

    // If we have cell and letter, build word path
    if (selectedLetter) {
      // Check if clicking the selected cell itself
      if (isSamePosition(clickedPos, selectedCell)) {
        if (!wordPath.some(p => isSamePosition(p, clickedPos))) {
          setWordPath([...wordPath, clickedPos])
        }
        return
      }

      // Check if cell is already in path - remove if so
      const pathIndex = wordPath.findIndex(p => isSamePosition(p, clickedPos))
      if (pathIndex >= 0) {
        setWordPath(wordPath.slice(0, pathIndex))
        return
      }

      // First letter: can be any letter on board (no adjacency requirement)
      if (wordPath.length === 0) {
        if (hasLetterAtPosition(currentGame.board, clickedPos, selectedCell, selectedLetter)) {
          setWordPath([clickedPos])
        }
      }
      else {
        // Subsequent letters: must be orthogonally adjacent to last letter in path
        const lastPos = wordPath[wordPath.length - 1]
        const adjacent = isAdjacent(clickedPos, lastPos)
        const hasLetter = hasLetterAtPosition(currentGame.board, clickedPos, selectedCell, selectedLetter)

        if (adjacent && hasLetter) {
          setWordPath([...wordPath, clickedPos])
        }
      }
    }
  }, [currentGame, isMyTurn, selectedCell, selectedLetter, wordPath])

  const handleLetterSelect = useCallback((letter: string) => {
    if (selectedCell && !selectedLetter) {
      setSelectedLetter(letter)
      // DO NOT auto-add to path - user must explicitly click cells to build word
      setWordPath([])
    }
  }, [selectedCell, selectedLetter])

  const handleClearSelection = useCallback(() => {
    setSelectedCell(undefined)
    setSelectedLetter('')
    setWordPath([])
  }, [])

  const handleSuggestionSelect = useCallback((suggestion: Suggestion) => {
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
  }, [currentGame])

  const clearAll = useCallback(() => {
    setSelectedCell(undefined)
    setSelectedLetter('')
    setWordPath([])
  }, [])

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
