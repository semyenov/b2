import { describe, expect, test } from 'bun:test'
import { cloneGameState, gameWithOneMoveCAT, initialGameCAT } from '../../../test/fixtures/gameStates'
import { mockDictionary } from '../../../test/fixtures/mockDictionary'
import {
  AllowAllDictionary,
  applyMove,
  calculateWordScore,
  canPlace,
  createEmptyBoard,
  createGame,
  existsPathForWord,
  findPlacementsForWord,
  forEachNeighbor,
  isAdjacentToExisting,
  isInside,
  normalizeWord,
  placeBaseWord,
} from './balda'

describe('Game Engine - Board Utilities', () => {
  describe('createEmptyBoard', () => {
    test('creates board of correct size', () => {
      const board = createEmptyBoard(5)
      expect(board.length).toBe(5)
      expect(board[0]!.length).toBe(5) // Test data guaranteed to exist
    })

    test('initializes all cells as null', () => {
      const board = createEmptyBoard(3)
      for (const row of board) {
        for (const cell of row) {
          expect(cell).toBeNull()
        }
      }
    })

    test('creates independent rows', () => {
      const board = createEmptyBoard(3)
      board[0]![0] = 'A' // Test data guaranteed to exist
      expect(board[1]![0]).toBeNull() // Test data guaranteed to exist
      expect(board[2]![0]).toBeNull() // Test data guaranteed to exist
    })
  })

  describe('isInside', () => {
    test('returns true for valid positions', () => {
      expect(isInside(5, { row: 0, col: 0 })).toBe(true)
      expect(isInside(5, { row: 2, col: 2 })).toBe(true)
      expect(isInside(5, { row: 4, col: 4 })).toBe(true)
    })

    test('returns false for out-of-bounds positions', () => {
      expect(isInside(5, { row: -1, col: 0 })).toBe(false)
      expect(isInside(5, { row: 0, col: -1 })).toBe(false)
      expect(isInside(5, { row: 5, col: 0 })).toBe(false)
      expect(isInside(5, { row: 0, col: 5 })).toBe(false)
      expect(isInside(5, { row: 10, col: 10 })).toBe(false)
    })
  })

  describe('canPlace', () => {
    test('returns true for empty valid positions', () => {
      const board = createEmptyBoard(5)
      expect(canPlace(board, { row: 0, col: 0 })).toBe(true)
      expect(canPlace(board, { row: 2, col: 2 })).toBe(true)
    })

    test('returns false for occupied positions', () => {
      const board = createEmptyBoard(5)
      board[2]![2] = 'A' // Test data guaranteed to exist
      expect(canPlace(board, { row: 2, col: 2 })).toBe(false)
    })

    test('returns false for out-of-bounds positions', () => {
      const board = createEmptyBoard(5)
      expect(canPlace(board, { row: -1, col: 0 })).toBe(false)
      expect(canPlace(board, { row: 5, col: 0 })).toBe(false)
    })
  })

  describe('placeBaseWord', () => {
    test('places word in center row', () => {
      const board = createEmptyBoard(5)
      placeBaseWord(board, 'CAT')
      expect(board[2]![1]).toBe('C') // Test data guaranteed to exist
      expect(board[2]![2]).toBe('A') // Test data guaranteed to exist
      expect(board[2]![3]).toBe('T') // Test data guaranteed to exist
    })

    test('centers word horizontally', () => {
      const board = createEmptyBoard(5)
      placeBaseWord(board, 'HI')
      expect(board[2]![1]).toBe('H') // Test data guaranteed to exist
      expect(board[2]![2]).toBe('I') // Test data guaranteed to exist
    })

    test('normalizes word to uppercase', () => {
      const board = createEmptyBoard(5)
      placeBaseWord(board, 'cat')
      expect(board[2]).toContain('C')
      expect(board[2]).toContain('A')
      expect(board[2]).toContain('T')
    })

    test('throws error if word too long', () => {
      const board = createEmptyBoard(3)
      expect(() => placeBaseWord(board, 'TOOLONG')).toThrow()
    })
  })

  describe('normalizeWord', () => {
    test('converts to uppercase', () => {
      expect(normalizeWord('hello')).toBe('HELLO')
      expect(normalizeWord('WoRlD')).toBe('WORLD')
    })

    test('trims whitespace', () => {
      expect(normalizeWord('  hello  ')).toBe('HELLO')
      expect(normalizeWord('\tworld\n')).toBe('WORLD')
    })

    test('handles empty strings', () => {
      expect(normalizeWord('')).toBe('')
      expect(normalizeWord('   ')).toBe('')
    })

    test('handles Russian letters', () => {
      expect(normalizeWord('привет')).toBe('ПРИВЕТ')
      expect(normalizeWord('Мир')).toBe('МИР')
    })
  })
})

describe('Game Engine - Neighbor & Adjacency', () => {
  describe('forEachNeighbor', () => {
    test('finds 4 neighbors for center position', () => {
      const neighbors: any[] = []
      forEachNeighbor(5, { row: 2, col: 2 }, (n) => {
        neighbors.push(n)
      })
      expect(neighbors.length).toBe(4)
      expect(neighbors).toContainEqual({ row: 1, col: 2 }) // up
      expect(neighbors).toContainEqual({ row: 3, col: 2 }) // down
      expect(neighbors).toContainEqual({ row: 2, col: 1 }) // left
      expect(neighbors).toContainEqual({ row: 2, col: 3 }) // right
    })

    test('finds 2 neighbors for corner position', () => {
      const neighbors: any[] = []
      forEachNeighbor(5, { row: 0, col: 0 }, (n) => {
        neighbors.push(n)
      })
      expect(neighbors.length).toBe(2)
      expect(neighbors).toContainEqual({ row: 1, col: 0 }) // down
      expect(neighbors).toContainEqual({ row: 0, col: 1 }) // right
    })

    test('finds 3 neighbors for edge position', () => {
      const neighbors: any[] = []
      forEachNeighbor(5, { row: 0, col: 2 }, (n) => {
        neighbors.push(n)
      })
      expect(neighbors.length).toBe(3)
    })
  })

  describe('isAdjacentToExisting', () => {
    test('returns true when adjacent to letter', () => {
      const board = createEmptyBoard(5)
      board[2]![2] = 'A' // Test data guaranteed to exist
      expect(isAdjacentToExisting(board, { row: 1, col: 2 })).toBe(true) // above
      expect(isAdjacentToExisting(board, { row: 3, col: 2 })).toBe(true) // below
      expect(isAdjacentToExisting(board, { row: 2, col: 1 })).toBe(true) // left
      expect(isAdjacentToExisting(board, { row: 2, col: 3 })).toBe(true) // right
    })

    test('returns false when not adjacent', () => {
      const board = createEmptyBoard(5)
      board[2]![2] = 'A' // Test data guaranteed to exist
      expect(isAdjacentToExisting(board, { row: 0, col: 0 })).toBe(false)
      expect(isAdjacentToExisting(board, { row: 4, col: 4 })).toBe(false)
    })

    test('returns false for empty board', () => {
      const board = createEmptyBoard(5)
      expect(isAdjacentToExisting(board, { row: 2, col: 2 })).toBe(false)
    })
  })
})

describe('Game Engine - Scoring', () => {
  describe('calculateWordScore', () => {
    test('calculates score for Russian words', () => {
      const score = calculateWordScore('КОТ')
      expect(score).toBeGreaterThan(0)
    })

    test('calculates score for English words', () => {
      const score = calculateWordScore('CAT')
      expect(score).toBeGreaterThan(0)
    })

    test('longer words have higher scores', () => {
      const shortScore = calculateWordScore('CAT')
      const longScore = calculateWordScore('CATS')
      expect(longScore).toBeGreaterThan(shortScore)
    })

    test('normalizes before scoring', () => {
      expect(calculateWordScore('cat')).toBe(calculateWordScore('CAT'))
      expect(calculateWordScore('  CAT  ')).toBe(calculateWordScore('CAT'))
    })
  })
})

describe('Game Engine - Path Finding', () => {
  describe('existsPathForWord', () => {
    test('finds path for horizontal word', () => {
      const game = cloneGameState(initialGameCAT)
      const result = existsPathForWord(game.board, 'CAT', { row: 2, col: 1 })
      expect(result).toBe(true)
    })

    test('finds path when letter added', () => {
      const game = cloneGameState(initialGameCAT)
      game.board[1]![1] = 'S' // Add S above C - Test data guaranteed to exist
      const result = existsPathForWord(game.board, 'SCAT', { row: 1, col: 1 })
      expect(result).toBe(true)
    })

    test('returns false when mustInclude not in path', () => {
      const game = cloneGameState(initialGameCAT)
      // CAT exists, but position (0,0) is not in the path
      const result = existsPathForWord(game.board, 'CAT', { row: 0, col: 0 })
      expect(result).toBe(false)
    })

    test('returns false for word not on board', () => {
      const game = cloneGameState(initialGameCAT)
      const result = existsPathForWord(game.board, 'DOG', { row: 2, col: 1 })
      expect(result).toBe(false)
    })

    test('handles complex paths', () => {
      const game = cloneGameState(gameWithOneMoveCAT)
      // S is at (1,1), path should be S -> C -> A -> T
      const result = existsPathForWord(game.board, 'SCAT', { row: 1, col: 1 })
      expect(result).toBe(true)
    })

    test('memoization works on repeated calls', () => {
      const game = cloneGameState(initialGameCAT)
      const result1 = existsPathForWord(game.board, 'CAT', { row: 2, col: 1 })
      const result2 = existsPathForWord(game.board, 'CAT', { row: 2, col: 1 })
      expect(result1).toBe(result2)
    })
  })

  describe('findPlacementsForWord', () => {
    test('finds valid placements for word', () => {
      const game = cloneGameState(initialGameCAT)
      const placements = findPlacementsForWord(game.board, 'SCAT')
      expect(placements.length).toBeGreaterThan(0)
      // Should find S placement above or beside CAT
      const hasValidPlacement = placements.some(p =>
        p.letter === 'S' && isAdjacentToExisting(game.board, p.position),
      )
      expect(hasValidPlacement).toBe(true)
    })

    test('returns empty array for impossible word', () => {
      const game = cloneGameState(initialGameCAT)
      const placements = findPlacementsForWord(game.board, 'IMPOSSIBLE')
      expect(placements.length).toBe(0)
    })

    test('normalizes word before finding placements', () => {
      const game = cloneGameState(initialGameCAT)
      const placements1 = findPlacementsForWord(game.board, 'scat')
      const placements2 = findPlacementsForWord(game.board, 'SCAT')
      expect(placements1.length).toBe(placements2.length)
    })
  })
})

describe('Game Engine - Game Creation', () => {
  describe('createGame', () => {
    test('creates game with correct structure', () => {
      const game = createGame('test-id', {
        size: 5,
        baseWord: 'HELLO',
        players: ['Alice', 'Bob'],
      })

      expect(game.id).toBe('test-id')
      expect(game.size).toBe(5)
      expect(game.players).toEqual(['Alice', 'Bob'])
      expect(game.currentPlayerIndex).toBe(0)
      expect(game.moves).toEqual([])
      expect(game.usedWords).toContain('HELLO')
    })

    test('initializes scores to zero', () => {
      const game = createGame('test-id', {
        size: 5,
        baseWord: 'HELLO',
        players: ['Alice', 'Bob'],
      })

      expect(game.scores['Alice']).toBe(0) // Test data guaranteed to exist
      expect(game.scores['Bob']).toBe(0) // Test data guaranteed to exist
    })

    test('places base word on board', () => {
      const game = createGame('test-id', {
        size: 5,
        baseWord: 'HELLO',
        players: ['Alice', 'Bob'],
      })

      expect(game.board[2]).toContain('H')
      expect(game.board[2]).toContain('E')
      expect(game.board[2]).toContain('L')
      expect(game.board[2]).toContain('O')
    })

    test('uses default players if not provided', () => {
      const game = createGame('test-id', {
        size: 5,
        baseWord: 'HELLO',
      })

      expect(game.players).toEqual(['A', 'B'])
    })

    test('throws error for board size < 3', () => {
      expect(() =>
        createGame('test-id', {
          size: 2,
          baseWord: 'HI',
        }),
      ).toThrow('Board size must be at least 3')
    })

    test('throws error when base word length does not match board size', () => {
      expect(() =>
        createGame('test-id', {
          size: 5,
          baseWord: 'CAT', // 3 letters, but board is 5x5
        }),
      ).toThrow('Base word length (3) must match board size (5)')
    })

    test('throws error when base word is too long', () => {
      expect(() =>
        createGame('test-id', {
          size: 3,
          baseWord: 'HELLO', // 5 letters, but board is 3x3
        }),
      ).toThrow('Base word length (5) must match board size (3)')
    })

    test('throws error when base word is too short', () => {
      expect(() =>
        createGame('test-id', {
          size: 7,
          baseWord: 'CAT', // 3 letters, but board is 7x7
        }),
      ).toThrow('Base word length (3) must match board size (7)')
    })

    test('accepts base word with correct length for 3x3 board', () => {
      const game = createGame('test-id', {
        size: 3,
        baseWord: 'CAT',
      })

      expect(game.size).toBe(3)
      expect(game.baseWord).toBe('CAT')
    })

    test('accepts base word with correct length for 7x7 board', () => {
      const game = createGame('test-id', {
        size: 7,
        baseWord: 'EXAMPLE',
      })

      expect(game.size).toBe(7)
      expect(game.baseWord).toBe('EXAMPLE')
    })

    test('normalizes base word before length validation', () => {
      const game = createGame('test-id', {
        size: 5,
        baseWord: ' hello ', // Has spaces, but normalizes to 5 letters
      })

      expect(game.baseWord).toBe('HELLO')
      expect(game.baseWord.length).toBe(5)
    })

    test('handles AI players', () => {
      const game = createGame('test-id', {
        size: 5,
        baseWord: 'HELLO',
        players: ['Human', 'AI'],
        aiPlayers: ['AI'],
      })

      expect(game.aiPlayers).toContain('AI')
    })
  })
})

describe('Game Engine - Move Application', () => {
  describe('applyMove', () => {
    test('applies valid move', () => {
      const game = cloneGameState(initialGameCAT)
      const result = applyMove(
        game,
        {
          playerId: 'Alice',
          position: { row: 1, col: 1 },
          letter: 'S',
          word: 'SCAT',
        },
        mockDictionary,
      )

      expect(result.ok).toBe(true)
      if (result.ok) {
        expect(result.game.board[1]![1]).toBe('S') // Test data guaranteed to exist
        expect(result.game.moves.length).toBe(1)
        expect(result.game.usedWords).toContain('SCAT')
      }
    })

    test('updates score after valid move', () => {
      const game = cloneGameState(initialGameCAT)
      const result = applyMove(
        game,
        {
          playerId: 'Alice',
          position: { row: 1, col: 1 },
          letter: 'S',
          word: 'SCAT',
        },
        mockDictionary,
      )

      expect(result.ok).toBe(true)
      if (result.ok) {
        expect(result.game.scores['Alice']).toBeGreaterThan(0) // Test data guaranteed to exist
      }
    })

    test('advances to next player', () => {
      const game = cloneGameState(initialGameCAT)
      const result = applyMove(
        game,
        {
          playerId: 'Alice',
          position: { row: 1, col: 1 },
          letter: 'S',
          word: 'SCAT',
        },
        mockDictionary,
      )

      expect(result.ok).toBe(true)
      if (result.ok) {
        expect(result.game.currentPlayerIndex).toBe(1)
      }
    })

    test('rejects move from wrong player', () => {
      const game = cloneGameState(initialGameCAT)
      const result = applyMove(
        game,
        {
          playerId: 'Bob', // Alice's turn
          position: { row: 1, col: 1 },
          letter: 'S',
          word: 'SCAT',
        },
        mockDictionary,
      )

      expect(result.ok).toBe(false)
      if (!result.ok) {
        expect(result.message).toContain('turn')
      }
    })

    test('rejects move on occupied cell', () => {
      const game = cloneGameState(initialGameCAT)
      mockDictionary.addWord('XCAT') // Add to dictionary so we test placement validation
      const result = applyMove(
        game,
        {
          playerId: 'Alice',
          position: { row: 2, col: 1 }, // C position (occupied)
          letter: 'X',
          word: 'XCAT',
        },
        mockDictionary,
      )

      expect(result.ok).toBe(false)
      if (!result.ok) {
        expect(result.message).toContain('occupied')
      }
    })

    test('rejects word not in dictionary', () => {
      const game = cloneGameState(initialGameCAT)
      const result = applyMove(
        game,
        {
          playerId: 'Alice',
          position: { row: 1, col: 1 },
          letter: 'Z',
          word: 'ZCAT', // Not in mock dictionary
        },
        mockDictionary,
      )

      expect(result.ok).toBe(false)
      if (!result.ok) {
        expect(result.message).toContain('dictionary')
      }
    })

    test('rejects already used word', () => {
      const game = cloneGameState(gameWithOneMoveCAT)
      const result = applyMove(
        game,
        {
          playerId: 'Bob',
          position: { row: 3, col: 1 },
          letter: 'S',
          word: 'SCAT', // Already used
        },
        mockDictionary,
      )

      expect(result.ok).toBe(false)
      if (!result.ok) {
        expect(result.message).toContain('already used')
      }
    })

    test('rejects placement not adjacent to existing letters', () => {
      const game = cloneGameState(initialGameCAT)
      const result = applyMove(
        game,
        {
          playerId: 'Alice',
          position: { row: 0, col: 0 }, // Not adjacent to CAT
          letter: 'S',
          word: 'SCAT',
        },
        mockDictionary,
      )

      expect(result.ok).toBe(false)
      if (!result.ok) {
        expect(result.message).toContain('adjacent')
      }
    })

    test('rejects when no valid path exists', () => {
      const game = cloneGameState(initialGameCAT)
      const result = applyMove(
        game,
        {
          playerId: 'Alice',
          position: { row: 1, col: 1 },
          letter: 'X',
          word: 'CAT', // X is not part of CAT
        },
        mockDictionary,
      )

      expect(result.ok).toBe(false)
    })

    test('normalizes letter to uppercase', () => {
      const game = cloneGameState(initialGameCAT)
      const result = applyMove(
        game,
        {
          playerId: 'Alice',
          position: { row: 1, col: 1 },
          letter: 's', // lowercase
          word: 'SCAT',
        },
        mockDictionary,
      )

      expect(result.ok).toBe(true)
      if (result.ok) {
        expect(result.game.board[1]![1]).toBe('S') // Test data guaranteed to exist
      }
    })

    test('preserves immutability of original game state', () => {
      const game = cloneGameState(initialGameCAT)
      const originalBoard = game.board.map(row => [...row])

      applyMove(
        game,
        {
          playerId: 'Alice',
          position: { row: 1, col: 1 },
          letter: 'S',
          word: 'SCAT',
        },
        mockDictionary,
      )

      // Original game should not be modified
      expect(game.board).toEqual(originalBoard)
    })
  })
})

describe('Game Engine - AllowAllDictionary', () => {
  test('accepts any non-empty word', () => {
    const dict = new AllowAllDictionary()
    expect(dict.has('ANYTHING')).toBe(true)
    expect(dict.has('RANDOMWORD')).toBe(true)
    expect(dict.has('')).toBe(false)
  })
})
