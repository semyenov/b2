import type { SizedDictionary } from '@server/domain/dictionary/dictionary'
import { logger } from '@server/core/monitoring/logger'
import { DictionaryError } from '@server/domain/errors/game'

let dictionaryPromise: Promise<SizedDictionary> | null = null
let dictionaryLoadingLock = false

/**
 * Get singleton dictionary instance with lazy loading
 * Tries PostgreSQL first, falls back to file-based, then AllowAll mode
 */
export async function getDictionary(): Promise<SizedDictionary> {
  // If dictionary is already loaded or being loaded, return the existing promise
  if (dictionaryPromise) {
    return dictionaryPromise
  }

  // Check if another request is already loading the dictionary
  if (dictionaryLoadingLock) {
    // Wait a bit and retry
    await new Promise(resolve => setTimeout(resolve, 10))
    return getDictionary()
  }

  // Acquire the lock and load the dictionary
  dictionaryLoadingLock = true
  try {
    // Try to load from PostgreSQL first (preferred)
    const { CachedPostgresDictionary } = await import('../../../infrastructure/persistence/postgres/cachedDictionary')

    dictionaryPromise = CachedPostgresDictionary.create('ru').catch(async (error) => {
      logger.warn('Failed to load dictionary from PostgreSQL, falling back to file-based:', error)

      // Fallback to file-based dictionary
      const dictPath = process.env['DICT_PATH']
      if (dictPath) {
        const { loadDictionaryFromFile } = await import('../../../domain/dictionary/dictionary')
        return loadDictionaryFromFile(dictPath).catch((fileError) => {
          // Reset on error to allow retry
          dictionaryPromise = null
          throw new DictionaryError(`Failed to load dictionary from ${dictPath}: ${fileError}`)
        })
      }
      else {
        // Ultimate fallback: allow all words (for testing)
        logger.warn('No dictionary available, using AllowAll mode')
        const { AllowAllSizedDictionary } = await import('../../../domain/dictionary/dictionary')
        return new AllowAllSizedDictionary()
      }
    })
  }
  finally {
    dictionaryLoadingLock = false
  }

  return dictionaryPromise!
}
