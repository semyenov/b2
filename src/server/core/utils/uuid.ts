/**
 * UUID validation utilities
 */

/**
 * Validates if a string is a valid UUID v4 format
 * Format: xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx
 * where x is any hexadecimal digit and y is one of 8, 9, a, or b
 *
 * @param value - The string to validate
 * @returns true if the string is a valid UUID, false otherwise
 */
export function isValidUUID(value: string): boolean {
  const uuidRegex = /^[\da-f]{8}-[\da-f]{4}-[1-5][\da-f]{3}-[89ab][\da-f]{3}-[\da-f]{12}$/i
  return uuidRegex.test(value)
}
