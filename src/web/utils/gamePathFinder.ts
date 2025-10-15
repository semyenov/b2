/**
 * Game path-finding utilities for Balda word validation
 * Uses DFS to find valid word paths on the board
 */

import type { Board, Position } from '@types'

/**
 * DFS search for word path on board (orthogonal adjacency only)
 */
function dfsWordSearch(
  board: Board,
  word: string,
  row: number,
  col: number,
  visited: Set<string>,
  path: Position[],
): Position[] | null {
  if (path.length === word.length)
    return path

  const key = `${row},${col}`
  visited.add(key)

  // Bounds-checked array access - safe to use non-null assertion
  const nextChar = word[path.length]!
  const directions = [[-1, 0], [1, 0], [0, -1], [0, 1]] as const

  for (const [dr, dc] of directions) {
    // Directions array contains tuples of two numbers - safe to use non-null assertion
    const newRow = row + dr!
    const newCol = col + dc!
    const newKey = `${newRow},${newCol}`

    // Bounds are checked before accessing board array elements
    if (
      newRow >= 0
      && newRow < board.length
      && newCol >= 0
      && newCol < board[0]!.length
      && !visited.has(newKey)
      && board[newRow]![newCol] === nextChar
    ) {
      const result = dfsWordSearch(
        board,
        word,
        newRow,
        newCol,
        new Set(visited),
        [...path, { row: newRow, col: newCol }],
      )
      if (result)
        return result
    }
  }

  return null
}

/**
 * Find path for a word on the board (with new letter placed)
 */
export function findWordPath(
  board: Board,
  newLetterPos: Position,
  newLetter: string,
  word: string,
): Position[] | null {
  // Create board copy with new letter
  const tempBoard = board.map(row => [...row])
  // Bounds are guaranteed by function caller - safe to use non-null assertion
  tempBoard[newLetterPos.row]![newLetterPos.col] = newLetter

  // Try to find word starting from each matching cell
  for (let row = 0; row < board.length; row++) {
    // Board is guaranteed to be non-empty and rectangular - safe to use non-null assertion
    for (let col = 0; col < board[0]!.length; col++) {
      if (tempBoard[row]![col] === word[0]) {
        const path = dfsWordSearch(
          tempBoard,
          word,
          row,
          col,
          new Set<string>(),
          [{ row, col }],
        )
        if (path)
          return path
      }
    }
  }

  return null
}
