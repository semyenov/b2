import { BoardPosition, Letter, normalizeWord, isAdjacentToExisting, existsPathForWord } from "./balda";
import type { SizedDictionary } from "../dictionary";

export interface Suggestion {
  position: BoardPosition;
  letter: string;
  word: string;
  score: number;
}

export interface SuggestOptions {
  limit?: number;
}

export function suggestWords(
  board: Letter[][],
  dict: SizedDictionary,
  options: SuggestOptions = {}
): Suggestion[] {
  const size = board.length;
  const limit = Math.max(1, Math.min(200, options.limit ?? 20));
  const out: Suggestion[] = [];

  // Simple heuristic scoring: word length, tie-break by rarity of placed letter
  const freq = dict.getLetterFrequency();
  const rarity = (ch: string) => 1 / (1 + (freq[ch] ?? 0));

  for (let r = 0; r < size; r++) {
    for (let c = 0; c < size; c++) {
      if (board[r][c] !== null) continue;
      const pos = { row: r, col: c };
      if (!isAdjacentToExisting(board, pos)) continue;

      // Try all alphabet letters as candidates at this position
      for (const ch of dict.getAlphabet()) {
        board[r][c] = ch;
        // Expand words around this position using path validation + prefix pruning when available
        enumerateAround(board, pos, ch, dict, (word) => {
          const normalized = normalizeWord(word);
          if (!normalized || !dict.has(normalized)) return;
          const score = normalized.length + rarity(ch);
          out.push({ position: pos, letter: ch, word: normalized, score });
        });
        board[r][c] = null;
      }
    }
  }

  out.sort((a, b) => b.score - a.score || b.word.length - a.word.length);
  if (out.length > limit) out.length = limit;
  return out;
}

function enumerateAround(
  board: Letter[][],
  pos: BoardPosition,
  letter: string,
  dict: SizedDictionary,
  onWord: (word: string) => void
) {
  // Naive strategy: use existing path validator with a bounded word radius.
  // For a production-grade solver, implement prefix-pruned DFS over the grid using dict.hasPrefix.
  const candidates = collectCandidateStrings(board, 8);
  for (const word of candidates) {
    if (dict.hasPrefix && !dict.hasPrefix(word.slice(0, Math.min(3, word.length)))) continue;
    if (existsPathForWord(board, word, pos)) onWord(word);
  }
}

function collectCandidateStrings(board: Letter[][], maxLen: number): string[] {
  const size = board.length;
  const seen = new Set<string>();
  const acc: string[] = [];
  const dirs = [
    { dr: -1, dc: 0 },
    { dr: 1, dc: 0 },
    { dr: 0, dc: -1 },
    { dr: 0, dc: 1 }
  ];

  function dfs(r: number, c: number, used: boolean[][], s: string) {
    const ch = board[r][c];
    if (!ch) return;
    const next = s + ch;
    if (next.length <= maxLen) {
      if (!seen.has(next)) {
        seen.add(next);
        acc.push(next);
      }
      used[r][c] = true;
      for (const d of dirs) {
        const nr = r + d.dr, nc = c + d.dc;
        if (nr < 0 || nr >= size || nc < 0 || nc >= size) continue;
        if (used[nr][nc]) continue;
        dfs(nr, nc, used, next);
      }
      used[r][c] = false;
    }
  }

  const used: boolean[][] = Array.from({ length: size }, () => Array<boolean>(size).fill(false));
  for (let r = 0; r < size; r++) {
    for (let c = 0; c < size; c++) {
      if (board[r][c] == null) continue;
      dfs(r, c, used, "");
    }
  }
  return acc;
}


