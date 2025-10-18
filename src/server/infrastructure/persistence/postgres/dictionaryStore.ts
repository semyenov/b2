import { consola } from 'consola'
import { eq, sql } from 'drizzle-orm'
import { objectify } from 'radash'
import { DEFAULT_ALPHABET } from '../../../core/constants/'
import { db } from './client'
import { words } from './schema'

/**
 * Async dictionary interface - all methods return Promises
 */
export interface AsyncDictionary {
  has: (word: string) => Promise<boolean>
  hasPrefix: (prefix: string) => Promise<boolean>
  size: () => Promise<number>
  getAlphabet: () => Promise<string[]>
  getLetterFrequency: () => Promise<Record<string, number>>
  getRandomWords: (length: number, count: number) => Promise<string[]>
}

/**
 * PostgreSQL-backed dictionary using Drizzle ORM
 * Provides fast lookups for word validation and prefix checking
 */
export class PostgresDictionary implements AsyncDictionary {
  private readonly language: string
  private cachedSize: number | null = null
  private cachedAlphabet: string[] | null = null
  private cachedFrequency: Record<string, number> | null = null

  constructor(language: string = 'ru') {
    this.language = language
  }

  /**
   * Check if a word exists in the dictionary
   */
  async has(word: string): Promise<boolean> {
    const normalized = word.trim().toUpperCase()
    if (!normalized)
      return false

    try {
      const result = await db
        .select({ word: words.word })
        .from(words)
        .where(eq(words.word, normalized))
        .limit(1)

      return result.length > 0
    }
    catch (error) {
      consola.error(`Failed to check word "${word}":`, error)
      return false
    }
  }

  /**
   * Check if a prefix exists in the dictionary
   */
  async hasPrefix(prefix: string): Promise<boolean> {
    const normalized = prefix.trim().toUpperCase()
    if (!normalized)
      return false

    try {
      // Use SQL LIKE for prefix matching
      const result = await db
        .select({ word: words.word })
        .from(words)
        .where(sql`${words.word} LIKE ${`${normalized}%`}`)
        .limit(1)

      return result.length > 0
    }
    catch (error) {
      consola.error(`Failed to check prefix "${prefix}":`, error)
      return false
    }
  }

  /**
   * Get total number of words in dictionary
   */
  async size(): Promise<number> {
    if (this.cachedSize !== null) {
      return this.cachedSize
    }

    try {
      const result = await db
        .select({ count: sql<number>`count(*)::int` })
        .from(words)
        .where(eq(words.language, this.language))

      this.cachedSize = result[0]?.count ?? 0
      return this.cachedSize
    }
    catch (error) {
      consola.error('Failed to get dictionary size:', error)
      return 0
    }
  }

  /**
   * Get alphabet (unique letters used in dictionary)
   */
  async getAlphabet(): Promise<string[]> {
    if (this.cachedAlphabet) {
      return this.cachedAlphabet
    }

    try {
      // Get distinct letters from all words
      // This is expensive, so we cache the result
      const result = await db
        .select({ word: words.word })
        .from(words)
        .where(eq(words.language, this.language))

      const letterSet = new Set<string>()
      for (const row of result) {
        for (const char of row.word) {
          letterSet.add(char)
        }
      }

      this.cachedAlphabet = Array.from(letterSet).sort()
      return this.cachedAlphabet
    }
    catch (error) {
      consola.error('Failed to get alphabet:', error)
      return Array.from(DEFAULT_ALPHABET)
    }
  }

  /**
   * Get letter frequency (how many words contain each letter)
   */
  async getLetterFrequency(): Promise<Record<string, number>> {
    if (this.cachedFrequency) {
      return this.cachedFrequency
    }

    try {
      // This is expensive - for production, consider pre-computing and storing
      const result = await db
        .select({ word: words.word })
        .from(words)
        .where(eq(words.language, this.language))

      const frequency = new Map<string, number>()
      for (const row of result) {
        const uniqueLetters = new Set(row.word.split(''))
        for (const letter of uniqueLetters) {
          frequency.set(letter, (frequency.get(letter) ?? 0) + 1)
        }
      }

      this.cachedFrequency = objectify(
        Array.from(frequency.entries()),
        ([k]) => k,
        ([, v]) => v,
      )
      return this.cachedFrequency
    }
    catch (error) {
      consola.error('Failed to get letter frequency:', error)
      return {}
    }
  }

  /**
   * Get random words of specific length
   */
  async getRandomWords(length: number, count: number): Promise<string[]> {
    try {
      // Use PostgreSQL RANDOM() for efficient random selection
      const result = await db
        .select({ word: words.word })
        .from(words)
        .where(sql`${words.language} = ${this.language} AND length(${words.word}) = ${length}`)
        .orderBy(sql`RANDOM()`)
        .limit(count)

      return result.map(row => row.word)
    }
    catch (error) {
      consola.error(`Failed to get random words of length ${length}:`, error)
      return []
    }
  }

  /**
   * Get all words from dictionary (for loading into cache)
   */
  async getAllWords(): Promise<string[]> {
    try {
      const result = await db
        .select({ word: words.word })
        .from(words)
        .where(eq(words.language, this.language))

      return result.map(row => row.word)
    }
    catch (error) {
      consola.error('Failed to get all words:', error)
      return []
    }
  }

  /**
   * Clear cached data (call this if dictionary is updated)
   */
  clearCache(): void {
    this.cachedSize = null
    this.cachedAlphabet = null
    this.cachedFrequency = null
  }
}
