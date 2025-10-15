import type { SizedDictionary } from '../dictionary'
import { consola } from 'consola'
import { TrieDictionary } from '../dictionary'
import { PostgresDictionary } from './dictionaryStore'

/**
 * Cached PostgreSQL Dictionary
 *
 * Loads dictionary from PostgreSQL into in-memory Trie for fast synchronous lookups.
 * This combines the benefits of:
 * - PostgreSQL: Single source of truth, persistent storage
 * - In-memory Trie: Fast O(k) lookups, prefix matching
 *
 * Usage:
 *   const dict = await CachedPostgresDictionary.create('ru')
 *   dict.has('СЛОВО') // Synchronous, fast
 */
export class CachedPostgresDictionary implements SizedDictionary {
  private readonly trie: TrieDictionary
  private readonly postgresDictionary: PostgresDictionary
  private loadedAt: Date | null = null

  private constructor(
    trie: TrieDictionary,
    postgresDictionary: PostgresDictionary,
  ) {
    this.trie = trie
    this.postgresDictionary = postgresDictionary
  }

  /**
   * Create and load dictionary from PostgreSQL
   * This is an async factory method since loading is async
   */
  static async create(language: string = 'ru'): Promise<CachedPostgresDictionary> {
    consola.start(`Loading ${language} dictionary from PostgreSQL...`)

    const postgresDictionary = new PostgresDictionary(language)
    const trie = new TrieDictionary()

    // Load all words from PostgreSQL into Trie
    const words = await postgresDictionary.getAllWords()

    for (const word of words) {
      trie.insert(word)
    }

    const dict = new CachedPostgresDictionary(trie, postgresDictionary)
    dict.loadedAt = new Date()

    consola.success(`✓ Loaded ${trie.size()} words into memory (${language})`)

    return dict
  }

  /**
   * Reload dictionary from PostgreSQL (call after dictionary updates)
   */
  async reload(): Promise<void> {
    consola.start('Reloading dictionary from PostgreSQL...')

    const words = await this.postgresDictionary.getAllWords()

    // Clear and rebuild Trie
    const newTrie = new TrieDictionary()
    for (const word of words) {
      newTrie.insert(word)
    }

    // Replace internal Trie (atomic operation)
    Object.assign(this.trie, newTrie)
    this.loadedAt = new Date()

    consola.success(`✓ Reloaded ${this.trie.size()} words`)
  }

  /**
   * Get when dictionary was last loaded
   */
  getLoadedAt(): Date | null {
    return this.loadedAt
  }

  // ============================================
  // SizedDictionary interface (synchronous)
  // ============================================

  has(word: string): boolean {
    return this.trie.has(word)
  }

  hasPrefix(prefix: string): boolean {
    return this.trie.hasPrefix(prefix)
  }

  size(): number {
    return this.trie.size()
  }

  getAlphabet(): string[] {
    return this.trie.getAlphabet()
  }

  getLetterFrequency(): Record<string, number> {
    return this.trie.getLetterFrequency()
  }

  getRandomWords(length: number, count: number): string[] {
    return this.trie.getRandomWords(length, count)
  }
}
