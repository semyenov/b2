import type { SizedDictionary } from '../dictionary'
import type { BoardPosition, Letter } from './balda'
import { list } from 'radash'
import { DEFAULT_SUGGESTION_LIMIT, MAX_SUGGESTION_LIMIT, MAX_WORD_LENGTH, ORTHOGONAL_DIRS } from '../constants'
import { isAdjacentToExisting, normalizeWord } from './balda'

export interface Suggestion {
  position: BoardPosition
  letter: string
  word: string
  score: number
}

export interface SuggestOptions {
  limit?: number
}

export function suggestWords(
  board: Letter[][],
  dict: SizedDictionary,
  options: SuggestOptions = {},
): Suggestion[] {
  const size = board.length
  const limit = Math.max(1, Math.min(MAX_SUGGESTION_LIMIT, options.limit ?? DEFAULT_SUGGESTION_LIMIT))
  const out: Suggestion[] = []

  // Simple heuristic scoring: word length, tie-break by rarity of placed letter
  const freq = dict.getLetterFrequency()
  const rarity = (ch: string) => 1 / (1 + (freq[ch] ?? 0))

  for (let r = 0; r < size; r++) {
    for (let c = 0; c < size; c++) {
      if (board[r][c] !== null)
        continue
      const pos = { row: r, col: c }
      if (!isAdjacentToExisting(board, pos))
        continue

      // Try all alphabet letters as candidates at this position
      for (const ch of dict.getAlphabet()) {
        board[r][c] = ch
        // Expand words around this position using path validation + prefix pruning when available
        enumerateAround(board, pos, ch, dict, (word) => {
          const normalized = normalizeWord(word)
          if (!normalized || !dict.has(normalized))
            return
          const score = normalized.length + rarity(ch)
          out.push({ position: pos, letter: ch, word: normalized, score })
        })
        board[r][c] = null
      }
    }
  }

  out.sort((a, b) => {
    if (b.score !== a.score)
      return b.score - a.score
    return b.word.length - a.word.length
  })
  return out.slice(0, limit)
}

/**
 * Enumerate all valid words around a position using prefix-pruned DFS
 * This is optimized compared to naive strategy of generating all candidates first
 */
function enumerateAround(
  board: Letter[][],
  pos: BoardPosition,
  letter: string,
  dict: SizedDictionary,
  onWord: (word: string) => void,
) {
  const size = board.length
  const visited = new Set<string>()

  // DFS with prefix pruning
  function dfs(r: number, c: number, used: boolean[][], word: string, includedTarget: boolean) {
    const ch = board[r][c]
    if (!ch)
      return

    const newWord = word + ch
    const newIncludedTarget = includedTarget || (r === pos.row && c === pos.col)

    // Prune if prefix doesn't exist in dictionary
    if (dict.hasPrefix && !dict.hasPrefix(newWord))
      return

    // Check if it's a valid word that includes our target position
    if (newWord.length >= 3 && newIncludedTarget && dict.has(newWord) && !visited.has(newWord)) {
      visited.add(newWord)
      onWord(newWord)
    }

    // Stop if word is too long
    if (newWord.length >= MAX_WORD_LENGTH)
      return

    // Explore neighbors
    used[r][c] = true
    for (const d of ORTHOGONAL_DIRS) {
      const nr = r + d.row
      const nc = c + d.col
      if (nr < 0 || nr >= size || nc < 0 || nc >= size || used[nr][nc])
        continue
      dfs(nr, nc, used, newWord, newIncludedTarget)
    }
    used[r][c] = false
  }

  // Start DFS from all occupied cells
  const used: boolean[][] = list(0, size - 1, () => list(0, size - 1, () => false))
  for (let r = 0; r < size; r++) {
    for (let c = 0; c < size; c++) {
      if (board[r][c] !== null)
        dfs(r, c, used, '', false)
    }
  }
}

// Removed: collectCandidateStrings - no longer needed with optimized enumerateAround
