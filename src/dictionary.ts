import type { Dictionary } from './engine/balda'
import { consola } from 'consola'
import { objectify, sift } from 'radash'
import { DEFAULT_ALPHABET } from './constants'

export interface SizedDictionary extends Dictionary {
  size: () => number
  hasPrefix: (prefix: string) => boolean
  getAlphabet: () => string[]
  getLetterFrequency: () => Record<string, number>
}

class TrieNode {
  children: Map<string, TrieNode> = new Map()
  isWord = false
}

export class TrieDictionary implements SizedDictionary {
  private readonly root = new TrieNode()
  private wordCount = 0
  private readonly alphabetSet = new Set<string>()
  private readonly frequency = new Map<string, number>()
  private alphabetCache: string[] | null = null

  insert(word: string): void {
    const normalized = word.trim().toUpperCase()
    if (!normalized)
      return
    let node = this.root
    for (const ch of normalized) {
      this.alphabetSet.add(ch)
      // Count frequency per word occurrence, not per character insertion
      this.frequency.set(ch, (this.frequency.get(ch) ?? 0) + 1)
      let next = node.children.get(ch)
      if (!next) {
        next = new TrieNode()
        node.children.set(ch, next)
      }
      node = next
    }
    if (!node.isWord) {
      node.isWord = true
      this.wordCount += 1
    }
    // Invalidate cache when alphabet changes
    this.alphabetCache = null
  }

  has(word: string): boolean {
    const node = this.traverse(word)
    return node?.isWord === true
  }

  hasPrefix(prefix: string): boolean {
    return this.traverse(prefix) != null
  }

  size(): number {
    return this.wordCount
  }

  getAlphabet(): string[] {
    if (!this.alphabetCache)
      this.alphabetCache = Array.from(this.alphabetSet)
    return this.alphabetCache
  }

  getLetterFrequency(): Record<string, number> {
    return objectify(
      Array.from(this.frequency.entries()),
      ([k]) => k,
      ([, v]) => v,
    )
  }

  private traverse(sequence: string): TrieNode | null {
    const normalized = sequence.trim().toUpperCase()
    if (!normalized)
      return null
    let node: TrieNode | undefined = this.root
    for (const ch of normalized) {
      node = node.children.get(ch)
      if (!node)
        return null
    }
    return node ?? null
  }
}

export async function loadDictionaryFromFile(path: string): Promise<SizedDictionary> {
  const text = await Bun.file(path).text()
  const dict = new TrieDictionary()
  const lines = text.split(/\r?\n/g)
  const validWords = sift(
    lines.map((line) => {
      const word = line.trim().toUpperCase()
      // Skip empty words or words with spaces/digits
      return word && /^[A-ZА-ЯЁ]+$/.test(word) ? word : null
    }),
  )
  validWords.forEach(word => dict.insert(word))
  consola.success(`Dictionary loaded from ${path}: ${dict.size()} words (processed ${lines.length} lines)`)
  return dict
}

export class AllowAllSizedDictionary implements SizedDictionary {
  private readonly alphabet: string[]
  constructor(alphabet: string[] = []) {
    this.alphabet = alphabet.length ? alphabet : Array.from(DEFAULT_ALPHABET)
  }

  has(word: string): boolean {
    return !!word?.trim()
  }

  hasPrefix(prefix: string): boolean {
    return !!prefix?.trim()
  }

  size(): number {
    return 0
  }

  getAlphabet(): string[] {
    return this.alphabet
  }

  getLetterFrequency(): Record<string, number> {
    const out: Record<string, number> = {}
    for (const ch of this.alphabet) out[ch] = 1
    return out
  }
}
