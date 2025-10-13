/**
 * Player name utilities
 * Handles player name generation and validation
 */

/**
 * Generate a unique player name based on timestamp
 * @returns A unique player name in format "Player_TIMESTAMP"
 */
export function generatePlayerName(): string {
  return `Player_${Date.now()}`
}

/**
 * Prompt user for player name with fallback to generated name
 * @param defaultName - Optional default name to show in prompt
 * @returns Player name entered by user or generated name
 */
export function promptPlayerName(defaultName?: string): string {
  // eslint-disable-next-line no-alert
  const name = window.prompt(
    'Введите ваше имя:',
    defaultName || generatePlayerName(),
  )

  return name?.trim() || generatePlayerName()
}

/**
 * Validate player name
 * @param name - Name to validate
 * @returns True if name is valid
 */
export function isValidPlayerName(name: string): boolean {
  return name.trim().length > 0 && name.length <= 50
}
