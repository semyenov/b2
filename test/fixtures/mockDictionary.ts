import type { SizedDictionary } from '../../src/server/dictionary'

/**
 * Mock dictionary for testing purposes
 * Contains a predefined set of words for predictable test behavior
 */
export class MockDictionary implements SizedDictionary {
  private readonly words = new Set([
    // English words
    'CAT',
    'CATS',
    'SCAT',
    'CAST',
    'CART',
    'HELLO',
    'SHELL',
    'HELL',
    'HELP',
    'WORLD',
    'WORD',
    'WORK',
    'TEST',
    'TESTS',
    'BEST',
    // Russian words
    'КОТ',
    'КОТЫ',
    'СТОЛ',
    'СЛОН',
    'СЛОВО',
    'МОРЕ',
    'ПРИВЕТ',
  ])

  private readonly alphabet = 'ABCDEFGHIJKLMNOPQRSTUVWXYZАБВГДЕЁЖЗИЙКЛМНОПРСТУФХЦЧШЩЪЫЬЭЮЯ'.split('')

  private readonly frequency: Record<string, number> = {
    А: 10,
    Е: 9,
    О: 8,
    И: 7,
    Н: 6,
    Т: 5,
    С: 4,
    Р: 3,
    В: 2,
    Л: 1,
    A: 10,
    E: 9,
    T: 8,
    O: 7,
    I: 6,
    N: 5,
    S: 4,
    H: 3,
    R: 2,
    D: 1,
  }

  has(word: string): boolean {
    return this.words.has(word.trim().toUpperCase())
  }

  hasPrefix(prefix: string): boolean {
    const normalized = prefix.trim().toUpperCase()
    for (const word of this.words) {
      if (word.startsWith(normalized)) {
        return true
      }
    }
    return false
  }

  size(): number {
    return this.words.size
  }

  getAlphabet(): string[] {
    return this.alphabet
  }

  getLetterFrequency(): Record<string, number> {
    return { ...this.frequency }
  }

  getRandomWords(length: number, count: number): string[] {
    const matching = Array.from(this.words).filter(w => w.length === length)
    return matching.slice(0, Math.min(count, matching.length))
  }

  addWord(word: string): void {
    this.words.add(word.trim().toUpperCase())
  }

  clear(): void {
    this.words.clear()
  }
}

export const mockDictionary = new MockDictionary()
