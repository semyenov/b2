/**
 * Game constants - Re-exports from shared config
 * Maintained for backward compatibility with existing server imports
 */

import {
  ALPHABETS,
  ORTHOGONAL_DIRS as SHARED_ORTHOGONAL_DIRS,
  SUGGESTION_LIMITS,
  WORD_CONFIG,
} from '../../shared/config'

/**
 * Orthogonal directions for board navigation (up, down, left, right)
 * Re-exported from shared config
 */
export const ORTHOGONAL_DIRS = SHARED_ORTHOGONAL_DIRS

/**
 * Default alphabet for dictionary (Latin + Cyrillic)
 * Re-exported from shared config
 */
export const DEFAULT_ALPHABET = ALPHABETS.DEFAULT

/**
 * Maximum word length for word enumeration in suggestions
 * Re-exported from shared config
 */
export const MAX_WORD_LENGTH = WORD_CONFIG.MAX_LENGTH

/**
 * Default and maximum suggestion limits
 * Re-exported from shared config for backward compatibility
 */
export const DEFAULT_SUGGESTION_LIMIT = SUGGESTION_LIMITS.DEFAULT
export const MAX_SUGGESTION_LIMIT = SUGGESTION_LIMITS.MAX
