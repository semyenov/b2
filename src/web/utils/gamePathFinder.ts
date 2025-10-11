/**
 * Game path-finding utilities for Balda word validation
 * Uses DFS to find valid word paths on the board
 */

export type Position = { row: number, col: number }
export type Board = (string | null)[][]

/**
 * DFS search for word path on board
 * @param board Game board
 * @param word Target word to find
 * @param row Current row position
 * @param col Current column position
 * @param visited Set of visited cell keys
 * @param path Current path being built
 * @returns Valid path if found, null otherwise
 */
function dfsWordSearch(
  board: Board,
  word: string,
  row: number,
  col: number,
  visited: Set<string>,
  path: Position[],
): Position[] | null {
  // Found complete word
  if (path.length === word.length) {
    return path
  }

  const key = `${row},${col}`
  visited.add(key)

  const nextChar = word[path.length]
  const directions = [[-1, 0], [1, 0], [0, -1], [0, 1]] // orthogonal only

  for (const [dr, dc] of directions) {
    const newRow = row + dr
    const newCol = col + dc
    const newKey = `${newRow},${newCol}`

    if (
      newRow >= 0
      && newRow < board.length
      && newCol >= 0
      && newCol < board[0].length
      && !visited.has(newKey)
      && board[newRow][newCol] === nextChar
    ) {
      const result = dfsWordSearch(
        board,
        word,
        newRow,
        newCol,
        new Set(visited),
        [...path, { row: newRow, col: newCol }],
      )
      if (result) {
        return result
      }
    }
  }

  return null
}

/**
 * Find path for a word on the board (with new letter placed)
 * @param board Current game board
 * @param newLetterPos Position where new letter will be placed
 * @param newLetter The new letter to place
 * @param word Target word to find
 * @returns Valid path if found, null otherwise
 */
export function findWordPath(
  board: Board,
  newLetterPos: Position,
  newLetter: string,
  word: string,
): Position[] | null {
  const rows = board.length
  const cols = board[0].length

  // Create a copy of board with the new letter
  const tempBoard = board.map(row => [...row])
  tempBoard[newLetterPos.row][newLetterPos.col] = newLetter

  // Try to find the word starting from each cell
  for (let startRow = 0; startRow < rows; startRow++) {
    for (let startCol = 0; startCol < cols; startCol++) {
      if (tempBoard[startRow][startCol] === word[0]) {
        const path = dfsWordSearch(
          tempBoard,
          word,
          startRow,
          startCol,
          new Set<string>(),
          [{ row: startRow, col: startCol }],
        )
        if (path) {
          return path
        }
      }
    }
  }

  return null
}
