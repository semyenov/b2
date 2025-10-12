/**
 * Shared game-related types
 * Consolidates types used across multiple modules
 */

export interface Position {
  row: number
  col: number
}

export type Board = (string | null)[][]
