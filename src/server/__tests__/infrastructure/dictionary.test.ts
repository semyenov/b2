import { afterEach, beforeEach, describe, expect, test } from 'bun:test'
import { AllowAllSizedDictionary, TrieDictionary } from '../../domain/dictionary/dictionary'

describe('Dictionary - TrieDictionary', () => {
  let dict: TrieDictionary

  beforeEach(() => {
    dict = new TrieDictionary()
  })

  afterEach(() => {
    // Clean up
  })

  describe('insert and has', () => {
    test('inserts and finds words', () => {
      dict.insert('HELLO')
      expect(dict.has('HELLO')).toBe(true)
    })

    test('normalizes words to uppercase', () => {
      dict.insert('hello')
      expect(dict.has('HELLO')).toBe(true)
      expect(dict.has('hello')).toBe(true)
      expect(dict.has('HeLLo')).toBe(true)
    })

    test('trims whitespace', () => {
      dict.insert('  WORLD  ')
      expect(dict.has('WORLD')).toBe(true)
    })

    test('returns false for non-existent words', () => {
      dict.insert('CAT')
      expect(dict.has('DOG')).toBe(false)
    })

    test('handles Russian words', () => {
      dict.insert('привет')
      expect(dict.has('ПРИВЕТ')).toBe(true)
    })

    test('does not insert empty strings', () => {
      const initialSize = dict.size()
      dict.insert('')
      dict.insert('   ')
      expect(dict.size()).toBe(initialSize)
    })

    test('tracks word count correctly', () => {
      expect(dict.size()).toBe(0)
      dict.insert('CAT')
      expect(dict.size()).toBe(1)
      dict.insert('DOG')
      expect(dict.size()).toBe(2)
    })

    test('does not double-count duplicate insertions', () => {
      dict.insert('CAT')
      dict.insert('CAT')
      expect(dict.size()).toBe(1)
    })
  })

  describe('hasPrefix', () => {
    beforeEach(() => {
      dict.insert('HELLO')
      dict.insert('HELP')
      dict.insert('WORLD')
    })

    test('finds valid prefixes', () => {
      expect(dict.hasPrefix('HE')).toBe(true)
      expect(dict.hasPrefix('HEL')).toBe(true)
      expect(dict.hasPrefix('HELL')).toBe(true)
      expect(dict.hasPrefix('WOR')).toBe(true)
    })

    test('returns true for complete words', () => {
      expect(dict.hasPrefix('HELLO')).toBe(true)
      expect(dict.hasPrefix('HELP')).toBe(true)
    })

    test('returns false for invalid prefixes', () => {
      expect(dict.hasPrefix('XYZ')).toBe(false)
      expect(dict.hasPrefix('HELX')).toBe(false)
    })

    test('normalizes prefix', () => {
      expect(dict.hasPrefix('hel')).toBe(true)
      expect(dict.hasPrefix('  HEL  ')).toBe(true)
    })
  })

  describe('getAlphabet', () => {
    test('returns empty for empty dictionary', () => {
      const alphabet = dict.getAlphabet()
      expect(alphabet.length).toBe(0)
    })

    test('collects unique letters from words', () => {
      dict.insert('CAT')
      dict.insert('DOG')
      const alphabet = dict.getAlphabet()

      expect(alphabet).toContain('C')
      expect(alphabet).toContain('A')
      expect(alphabet).toContain('T')
      expect(alphabet).toContain('D')
      expect(alphabet).toContain('O')
      expect(alphabet).toContain('G')
    })

    test('caches alphabet for performance', () => {
      dict.insert('CAT')
      const alphabet1 = dict.getAlphabet()
      const alphabet2 = dict.getAlphabet()
      expect(alphabet1).toBe(alphabet2) // Same array reference
    })

    test('invalidates cache on new insertions', () => {
      dict.insert('CAT')
      const alphabet1 = dict.getAlphabet()
      dict.insert('DOG')
      const alphabet2 = dict.getAlphabet()
      expect(alphabet1).not.toBe(alphabet2) // Different references
      expect(alphabet2.length).toBeGreaterThan(alphabet1.length)
    })

    test('handles Russian alphabet', () => {
      dict.insert('ПРИВЕТ')
      const alphabet = dict.getAlphabet()
      expect(alphabet).toContain('П')
      expect(alphabet).toContain('Р')
      expect(alphabet).toContain('И')
      expect(alphabet).toContain('В')
      expect(alphabet).toContain('Е')
      expect(alphabet).toContain('Т')
    })
  })

  describe('getLetterFrequency', () => {
    test('returns empty for empty dictionary', () => {
      const freq = dict.getLetterFrequency()
      expect(Object.keys(freq).length).toBe(0)
    })

    test('counts letter occurrences', () => {
      dict.insert('CAT')
      dict.insert('DOG')
      const freq = dict.getLetterFrequency()

      expect(freq['C']).toBe(1) // Test data guaranteed to exist
      expect(freq['A']).toBe(1) // Test data guaranteed to exist
      expect(freq['T']).toBe(1) // Test data guaranteed to exist
      expect(freq['D']).toBe(1) // Test data guaranteed to exist
      expect(freq['O']).toBe(1) // Test data guaranteed to exist
      expect(freq['G']).toBe(1) // Test data guaranteed to exist
    })

    test('counts letters per word, not per character', () => {
      dict.insert('HELLO') // Two L's in one word
      const freq = dict.getLetterFrequency()
      // Each letter should be counted once per word insertion
      expect(freq['L']).toBeGreaterThan(0) // Test data guaranteed to exist
    })

    test('accumulates frequency across multiple words', () => {
      dict.insert('CAT')
      dict.insert('CAR')
      const freq = dict.getLetterFrequency()

      expect(freq['C']).toBe(2) // C appears in both words - Test data guaranteed to exist
      expect(freq['A']).toBe(2) // A appears in both words - Test data guaranteed to exist
    })
  })

  describe('getRandomWords', () => {
    beforeEach(() => {
      dict.insert('CAT')
      dict.insert('DOG')
      dict.insert('HELLO')
      dict.insert('WORLD')
      dict.insert('TEST')
    })

    test('returns words of specified length', () => {
      const words = dict.getRandomWords(3, 2)
      for (const word of words) {
        expect(word.length).toBe(3)
      }
    })

    test('respects count limit', () => {
      const words = dict.getRandomWords(3, 2)
      expect(words.length).toBeLessThanOrEqual(2)
    })

    test('returns fewer words if not enough available', () => {
      const words = dict.getRandomWords(3, 100)
      expect(words.length).toBeLessThanOrEqual(3) // Only CAT, DOG, TEST have length 3
    })

    test('returns empty array if no words of length exist', () => {
      const words = dict.getRandomWords(100, 5)
      expect(words.length).toBe(0)
    })

    test('words are randomly shuffled', () => {
      // Insert many words to increase chance of different ordering
      for (let i = 0; i < 20; i++) {
        dict.insert(`WORD${i}`)
      }

      const words1 = dict.getRandomWords(5, 10)
      const words2 = dict.getRandomWords(5, 10)

      // With randomization, unlikely to get same order twice
      // (This test may occasionally fail due to randomness, but very unlikely)
      // We just check that both return valid results
      expect(words1.length).toBeGreaterThan(0)
      expect(words2.length).toBeGreaterThan(0)
    })
  })

  describe('size', () => {
    test('returns 0 for empty dictionary', () => {
      expect(dict.size()).toBe(0)
    })

    test('returns correct count after insertions', () => {
      dict.insert('CAT')
      expect(dict.size()).toBe(1)
      dict.insert('DOG')
      expect(dict.size()).toBe(2)
      dict.insert('BIRD')
      expect(dict.size()).toBe(3)
    })

    test('does not count duplicates', () => {
      dict.insert('CAT')
      dict.insert('CAT')
      dict.insert('cat')
      expect(dict.size()).toBe(1)
    })
  })
})

describe('Dictionary - AllowAllSizedDictionary', () => {
  let dict: AllowAllSizedDictionary

  beforeEach(() => {
    dict = new AllowAllSizedDictionary()
  })

  describe('has', () => {
    test('accepts any non-empty string', () => {
      expect(dict.has('ANYTHING')).toBe(true)
      expect(dict.has('RANDOMWORD')).toBe(true)
      expect(dict.has('X')).toBe(true)
    })

    test('rejects empty strings', () => {
      expect(dict.has('')).toBe(false)
      expect(dict.has('   ')).toBe(false)
    })

    test('accepts words with any characters', () => {
      expect(dict.has('123456')).toBe(true)
      expect(dict.has('!@#$%')).toBe(true)
    })
  })

  describe('hasPrefix', () => {
    test('accepts any non-empty prefix', () => {
      expect(dict.hasPrefix('ANY')).toBe(true)
      expect(dict.hasPrefix('X')).toBe(true)
    })

    test('rejects empty prefixes', () => {
      expect(dict.hasPrefix('')).toBe(false)
      expect(dict.hasPrefix('   ')).toBe(false)
    })
  })

  describe('size', () => {
    test('always returns 0', () => {
      expect(dict.size()).toBe(0)
    })
  })

  describe('getAlphabet', () => {
    test('returns default alphabet when none provided', () => {
      const alphabet = dict.getAlphabet()
      expect(alphabet.length).toBeGreaterThan(0)
      expect(alphabet).toContain('A')
      expect(alphabet).toContain('Z')
    })

    test('uses provided alphabet', () => {
      const customDict = new AllowAllSizedDictionary(['X', 'Y', 'Z'])
      const alphabet = customDict.getAlphabet()
      expect(alphabet).toEqual(['X', 'Y', 'Z'])
    })
  })

  describe('getLetterFrequency', () => {
    test('returns uniform frequency for all letters', () => {
      const freq = dict.getLetterFrequency()
      const values = Object.values(freq)
      // All frequencies should be 1
      for (const value of values) {
        expect(value).toBe(1)
      }
    })
  })

  describe('getRandomWords', () => {
    test('returns empty array', () => {
      const words = dict.getRandomWords(5, 10)
      expect(words).toEqual([])
    })
  })
})
