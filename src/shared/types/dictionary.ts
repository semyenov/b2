/**
 * Dictionary Domain Types
 * Word validation and dictionary interfaces
 *
 * Defines contracts for:
 * - Dictionary implementations (sync/async)
 * - Dictionary metadata
 * - Word validation
 */

/**
 * Base dictionary interface for word validation
 * Synchronous word checking
 */
export interface Dictionary {
  /**
   * Check if a word exists in the dictionary
   * @param word - Word to check (case-insensitive)
   * @returns True if word is valid
   */
  readonly has: (word: string) => boolean

  /**
   * Optional: Check if a prefix exists in the dictionary
   * Used for optimization in suggestion generation
   * @param prefix - Prefix to check
   * @returns True if any word starts with this prefix
   */
  readonly hasPrefix?: (prefix: string) => boolean
}

/**
 * Dictionary with metadata
 * Extends base dictionary with additional information
 */
export interface SizedDictionary extends Dictionary {
  /**
   * Total number of words in dictionary
   */
  readonly size: number

  /**
   * Alphabet string (unique letters in dictionary)
   */
  readonly alphabet: string

  /**
   * Letter frequency map
   * Maps each letter to its occurrence count
   */
  readonly letterFrequency: Record<string, number>
}

/**
 * Async dictionary interface
 * For dictionaries that require async operations (e.g., database, network)
 */
export interface AsyncDictionary {
  /**
   * Async word validation
   * @param word - Word to check
   * @returns Promise resolving to true if word is valid
   */
  readonly has: (word: string) => Promise<boolean>

  /**
   * Optional: Async prefix checking
   * @param prefix - Prefix to check
   * @returns Promise resolving to true if prefix exists
   */
  readonly hasPrefix?: (prefix: string) => Promise<boolean>
}

/**
 * Dictionary metadata response
 * Used for API endpoints that return dictionary information
 */
export interface DictionaryMetadata {
  /** Total word count */
  readonly wordCount: number

  /** Array of unique letters */
  readonly alphabet: string[]

  /** Letter frequency distribution */
  readonly letterFrequency: Record<string, number>

  /** Dictionary source */
  readonly source: 'file' | 'database' | 'builtin'

  /** Whether dictionary is fully loaded */
  readonly loaded: boolean

  /** Optional language code */
  readonly language?: 'ru' | 'en'
}

/**
 * Dictionary loading status
 * Used to track dictionary initialization state
 */
export type DictionaryStatus = 'loading' | 'loaded' | 'error' | 'empty'

/**
 * Dictionary configuration for initialization
 */
export interface DictionaryConfig {
  /** Dictionary source path (file or URL) */
  readonly source?: string

  /** Language code */
  readonly language?: 'ru' | 'en'

  /** Whether to use cached version if available */
  readonly useCache?: boolean

  /** Whether to preload into memory */
  readonly preload?: boolean
}

/**
 * Type guard to check if dictionary has prefix support
 * @param dict - Dictionary to check
 * @returns True if dictionary supports prefix checking
 */
export function hasPrefixSupport(dict: Dictionary | AsyncDictionary): boolean {
  return typeof dict.hasPrefix === 'function'
}

/**
 * Type guard to check if dictionary is async
 * @param dict - Dictionary to check
 * @returns True if dictionary is async
 */
export function isAsyncDictionary(dict: Dictionary | AsyncDictionary): dict is AsyncDictionary {
  const result = dict.has('test')
  return result instanceof Promise
}

/**
 * Type guard to check if dictionary is sized
 * @param dict - Dictionary to check
 * @returns True if dictionary is sized
 */
export function isSizedDictionary(dict: Dictionary): dict is SizedDictionary {
  return 'size' in dict && typeof (dict as SizedDictionary).size === 'number'
}
