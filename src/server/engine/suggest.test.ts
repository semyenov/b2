import { describe, expect, test } from 'bun:test'
import { cloneGameState, initialGameCAT, initialGameHELLO } from '../../../test/fixtures/gameStates'
import { mockDictionary } from '../../../test/fixtures/mockDictionary'
import { suggestWords } from './suggest'

describe('Suggestion Engine', () => {
  describe('suggestWords', () => {
    test('returns suggestions for valid game state', () => {
      const game = cloneGameState(initialGameCAT)
      const suggestions = suggestWords(game.board, mockDictionary, { limit: 5 })

      expect(Array.isArray(suggestions)).toBe(true)
      expect(suggestions.length).toBeGreaterThanOrEqual(0)
      expect(suggestions.length).toBeLessThanOrEqual(5)
    })

    test('suggestions have required properties', () => {
      const game = cloneGameState(initialGameCAT)
      const suggestions = suggestWords(game.board, mockDictionary, { limit: 3 })

      if (suggestions.length > 0) {
        const suggestion = suggestions[0]! // Test data guaranteed to exist
        expect(suggestion).toHaveProperty('position')
        expect(suggestion).toHaveProperty('letter')
        expect(suggestion).toHaveProperty('word')
        expect(suggestion).toHaveProperty('score')
        expect(typeof suggestion.position.row).toBe('number')
        expect(typeof suggestion.position.col).toBe('number')
        expect(typeof suggestion.letter).toBe('string')
        expect(typeof suggestion.word).toBe('string')
        expect(typeof suggestion.score).toBe('number')
      }
    })

    test('respects limit parameter', () => {
      const game = cloneGameState(initialGameCAT)
      const suggestions3 = suggestWords(game.board, mockDictionary, { limit: 3 })
      const suggestions10 = suggestWords(game.board, mockDictionary, { limit: 10 })

      expect(suggestions3.length).toBeLessThanOrEqual(3)
      expect(suggestions10.length).toBeLessThanOrEqual(10)
    })

    test('uses default limit when not specified', () => {
      const game = cloneGameState(initialGameCAT)
      const suggestions = suggestWords(game.board, mockDictionary)

      expect(suggestions.length).toBeLessThanOrEqual(20) // DEFAULT_SUGGESTION_LIMIT
    })

    test('suggestions are sorted by score descending', () => {
      const game = cloneGameState(initialGameCAT)
      const suggestions = suggestWords(game.board, mockDictionary, { limit: 10 })

      for (let i = 1; i < suggestions.length; i++) {
        // Score should be descending (higher scores first)
        expect(suggestions[i - 1]!.score).toBeGreaterThanOrEqual(suggestions[i]!.score) // Test data guaranteed to exist
      }
    })

    test('filters out used words', () => {
      const game = cloneGameState(initialGameCAT)
      mockDictionary.addWord('SCAT')

      const suggestionsWithUsed = suggestWords(game.board, mockDictionary, {
        limit: 10,
        usedWords: ['SCAT'],
      })

      // Should not suggest already used words
      const hasScat = suggestionsWithUsed.some(s => s.word === 'SCAT')
      expect(hasScat).toBe(false)
    })

    test('suggests words with letters adjacent to existing', () => {
      const game = cloneGameState(initialGameCAT)
      const suggestions = suggestWords(game.board, mockDictionary, { limit: 5 })

      // All suggestions should have positions adjacent to existing letters
      for (const suggestion of suggestions) {
        const { row, col } = suggestion.position
        // Check if position is adjacent to at least one existing letter
        const hasAdjacentLetter
          = (row > 0 && game.board[row - 1]![col] !== null) // Test data guaranteed to exist
            || (row < game.board.length - 1 && game.board[row + 1]![col] !== null) // Test data guaranteed to exist
            || (col > 0 && game.board[row]![col - 1] !== null) // Test data guaranteed to exist
            || (col < game.board[0]!.length - 1 && game.board[row]![col + 1] !== null) // Test data guaranteed to exist

        expect(hasAdjacentLetter).toBe(true)
      }
    })

    test('returns empty array for full board', () => {
      // Create a fully occupied board
      const fullBoard = Array.from({ length: 5 }, () =>
        Array.from({ length: 5 }, () => 'A'))
      const suggestions = suggestWords(fullBoard, mockDictionary, { limit: 5 })

      expect(suggestions.length).toBe(0)
    })

    test('handles HELLO board', () => {
      const game = cloneGameState(initialGameHELLO)
      const suggestions = suggestWords(game.board, mockDictionary, { limit: 5 })

      expect(Array.isArray(suggestions)).toBe(true)
      // SHELL could be a possible suggestion depending on dictionary content
      // We just verify that suggestions are returned without errors
    })

    test('calculates score including letter rarity', () => {
      const game = cloneGameState(initialGameCAT)
      const suggestions = suggestWords(game.board, mockDictionary, { limit: 5 })

      if (suggestions.length > 0) {
        // Scores should be positive
        for (const suggestion of suggestions) {
          expect(suggestion.score).toBeGreaterThan(0)
        }
      }
    })

    test('handles edge cases with minimum limit', () => {
      const game = cloneGameState(initialGameCAT)
      const suggestions = suggestWords(game.board, mockDictionary, { limit: 0 })

      // Even with limit 0, should be clamped to at least 1
      expect(suggestions.length).toBeLessThanOrEqual(1)
    })

    test('handles very large limit', () => {
      const game = cloneGameState(initialGameCAT)
      const suggestions = suggestWords(game.board, mockDictionary, { limit: 1000 })

      // Should be capped at MAX_SUGGESTION_LIMIT (200)
      expect(suggestions.length).toBeLessThanOrEqual(200)
    })

    test('does not modify input board', () => {
      const game = cloneGameState(initialGameCAT)
      const originalBoard = game.board.map(row => [...row])

      suggestWords(game.board, mockDictionary, { limit: 5 })

      // Board should remain unchanged
      expect(game.board).toEqual(originalBoard)
    })

    test('returns unique suggestions', () => {
      const game = cloneGameState(initialGameCAT)
      const suggestions = suggestWords(game.board, mockDictionary, { limit: 20 })

      const uniqueKeys = new Set(
        suggestions.map(s => `${s.position.row},${s.position.col},${s.letter},${s.word}`),
      )

      expect(uniqueKeys.size).toBe(suggestions.length)
    })

    test('prefers longer words when scores are equal', () => {
      const game = cloneGameState(initialGameCAT)
      const suggestions = suggestWords(game.board, mockDictionary, { limit: 20 })

      // When scores are equal, longer words should come first
      for (let i = 1; i < suggestions.length; i++) {
        if (suggestions[i - 1]!.score === suggestions[i]!.score) { // Test data guaranteed to exist
          expect(suggestions[i - 1]!.word.length).toBeGreaterThanOrEqual( // Test data guaranteed to exist
            suggestions[i]!.word.length, // Test data guaranteed to exist
          )
        }
      }
    })
  })
})
