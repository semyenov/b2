import type { GameState } from '../../src/server/engine/balda'

/**
 * Test fixture game states for consistent testing
 */

/**
 * Initial 5x5 game with "CAT" in center
 */
export const initialGameCAT: GameState = {
  id: 'test-game-cat',
  size: 5,
  board: [
    [null, null, null, null, null],
    [null, null, null, null, null],
    [null, 'C', 'A', 'T', null],
    [null, null, null, null, null],
    [null, null, null, null, null],
  ],
  players: ['Alice', 'Bob'],
  aiPlayers: [],
  currentPlayerIndex: 0,
  moves: [],
  createdAt: Date.now(),
  scores: { Alice: 0, Bob: 0 },
  usedWords: ['CAT'],
}

/**
 * Initial 5x5 game with "HELLO" in center
 */
export const initialGameHELLO: GameState = {
  id: 'test-game-hello',
  size: 5,
  board: [
    [null, null, null, null, null],
    [null, null, null, null, null],
    ['H', 'E', 'L', 'L', 'O'],
    [null, null, null, null, null],
    [null, null, null, null, null],
  ],
  players: ['Player1', 'Player2'],
  aiPlayers: [],
  currentPlayerIndex: 0,
  moves: [],
  createdAt: Date.now(),
  scores: { Player1: 0, Player2: 0 },
  usedWords: ['HELLO'],
}

/**
 * Game with one move already applied
 * Alice placed 'S' at (1,1) forming "SCAT"
 */
export const gameWithOneMoveCAT: GameState = {
  id: 'test-game-with-move',
  size: 5,
  board: [
    [null, null, null, null, null],
    [null, 'S', null, null, null],
    [null, 'C', 'A', 'T', null],
    [null, null, null, null, null],
    [null, null, null, null, null],
  ],
  players: ['Alice', 'Bob'],
  aiPlayers: [],
  currentPlayerIndex: 1, // Bob's turn
  moves: [
    {
      playerId: 'Alice',
      position: { row: 1, col: 1 },
      letter: 'S',
      word: 'SCAT',
      appliedAt: Date.now() - 1000,
    },
  ],
  createdAt: Date.now() - 5000,
  scores: { Alice: 8, Bob: 0 }, // SCAT score
  usedWords: ['CAT', 'SCAT'],
}

/**
 * Game with multiple moves
 */
export const gameWithMultipleMoves: GameState = {
  id: 'test-game-multiple',
  size: 5,
  board: [
    [null, null, null, null, null],
    [null, 'S', null, null, null],
    [null, 'C', 'A', 'T', null],
    [null, null, 'R', null, null],
    [null, null, null, null, null],
  ],
  players: ['Alice', 'Bob'],
  aiPlayers: [],
  currentPlayerIndex: 0, // Alice's turn again
  moves: [
    {
      playerId: 'Alice',
      position: { row: 1, col: 1 },
      letter: 'S',
      word: 'SCAT',
      appliedAt: Date.now() - 2000,
    },
    {
      playerId: 'Bob',
      position: { row: 3, col: 2 },
      letter: 'R',
      word: 'CART',
      appliedAt: Date.now() - 1000,
    },
  ],
  createdAt: Date.now() - 10000,
  scores: { Alice: 8, Bob: 8 },
  usedWords: ['CAT', 'SCAT', 'CART'],
}

/**
 * Game with AI players
 */
export const gameWithAIPlayers: GameState = {
  id: 'test-game-ai',
  size: 5,
  board: [
    [null, null, null, null, null],
    [null, null, null, null, null],
    [null, 'C', 'A', 'T', null],
    [null, null, null, null, null],
    [null, null, null, null, null],
  ],
  players: ['Human', 'AI-Bot'],
  aiPlayers: ['AI-Bot'],
  currentPlayerIndex: 0,
  moves: [],
  createdAt: Date.now(),
  scores: { 'Human': 0, 'AI-Bot': 0 },
  usedWords: ['CAT'],
}

/**
 * Create a fresh copy of a game state (deep clone)
 */
export function cloneGameState(game: GameState): GameState {
  return {
    ...game,
    board: game.board.map(row => [...row]),
    players: [...game.players],
    aiPlayers: [...game.aiPlayers],
    moves: game.moves.map(move => ({ ...move })),
    scores: { ...game.scores },
    usedWords: [...game.usedWords],
  }
}
