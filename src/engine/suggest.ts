import type { SizedDictionary } from '../dictionary'
import type { BoardPosition, Letter } from './balda'
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

  // Pre-calculate letter frequency for scoring
  const freq = dict.getLetterFrequency()
  const rarity = (ch: string) => 1 / (1 + (freq[ch] ?? 0))

  // Collect all valid empty positions that are adjacent to existing letters
  const validPositions: BoardPosition[] = []
  for (let r = 0; r < size; r++) {
    for (let c = 0; c < size; c++) {
      if (board[r][c] !== null)
        continue
      const pos = { row: r, col: c }
      if (isAdjacentToExisting(board, pos)) {
        validPositions.push(pos)
      }
    }
  }

  const suggestions = new Map<string, Suggestion>()

  for (const pos of validPositions) {
    // Try all alphabet letters as candidates at this position
    for (const ch of dict.getAlphabet()) {
      // Create board copy once per position+letter combination
      const boardCopy = board.map(row => [...row])
      boardCopy[pos.row][pos.col] = ch

      // Expand words around this position using optimized enumeration
      enumerateAroundOptimized(boardCopy, pos, ch, dict, (word) => {
        const normalized = normalizeWord(word)
        if (!normalized || !dict.has(normalized))
          return

        const score = normalized.length + rarity(ch)
        const key = `${pos.row},${pos.col},${ch},${normalized}`

        // Keep only the highest scoring suggestion for each position+letter+word combination
        const existing = suggestions.get(key)
        if (!existing || score > existing.score) {
          suggestions.set(key, { position: pos, letter: ch, word: normalized, score })
        }
      })
    }
  }

  // Convert to array and sort by score
  const sorted = Array.from(suggestions.values()).sort((a, b) => {
    if (b.score !== a.score)
      return b.score - a.score
    return b.word.length - a.word.length
  })

  return sorted.slice(0, limit)
}

/**
 * Optimized word enumeration using DFS with prefix pruning
 * Only explores paths that include the target position and prunes invalid prefixes
 */
function enumerateAroundOptimized(
  board: Letter[][],
  pos: BoardPosition,
  letter: string,
  dict: SizedDictionary,
  onWord: (word: string) => void,
) {
  const size = board.length
  const visited = new Set<string>()

  // DFS with prefix pruning and target position tracking
  function dfs(r: number, c: number, word: string, pathIncludesTarget: boolean) {
    const ch = board[r][c]
    if (!ch)
      return

    const newWord = word + ch
    const targetIncluded = pathIncludesTarget || (r === pos.row && c === pos.col)

    // Prune if prefix doesn't exist in dictionary
    if (dict.hasPrefix && !dict.hasPrefix(newWord)) {
      return
    }

    // If this forms a valid word including our target position
    if (newWord.length >= 3 && targetIncluded && dict.has(newWord) && !visited.has(newWord)) {
      visited.add(newWord)
      onWord(newWord)
    }

    // Stop if word is too long
    if (newWord.length >= MAX_WORD_LENGTH) {
      return
    }

    // Explore orthogonal neighbors
    for (const d of ORTHOGONAL_DIRS) {
      const nr = r + d.row
      const nc = c + d.col
      if (nr < 0 || nr >= size || nc < 0 || nc >= size)
        continue

      dfs(nr, nc, newWord, targetIncluded)
    }
  }

  // Start DFS from all occupied cells
  for (let r = 0; r < size; r++) {
    for (let c = 0; c < size; c++) {
      if (board[r][c] !== null) {
        dfs(r, c, '', false)
      }
    }
  }
}

// Removed: collectCandidateStrings - no longer needed with optimized enumerateAround
