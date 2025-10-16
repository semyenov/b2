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

// Future use: Player name prompt and validation
// export function promptPlayerName(defaultName?: string): string
// export function isValidPlayerName(name: string): boolean
