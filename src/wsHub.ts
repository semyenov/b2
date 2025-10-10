import type { GameState } from './engine/balda'
import { consola } from 'consola'

interface WsClient {
  send: (data: string) => number
  close: (code?: number, reason?: string) => void
  readyState: number
}

/**
 * WebSocket connection states
 */
const WS_STATES = {
  CONNECTING: 0,
  OPEN: 1,
  CLOSING: 2,
  CLOSED: 3,
} as const

/**
 * Check if a WebSocket client is in a valid state for sending messages
 */
function isClientReady(client: WsClient): boolean {
  return client.readyState === WS_STATES.OPEN
}

const gameIdToClients = new Map<string, Set<WsClient>>()
const clientToGameId = new Map<WsClient, string>()

/**
 * Add a WebSocket client to a game room for broadcasts
 */
export function addClient(gameId: string, client: WsClient): void {
  let set = gameIdToClients.get(gameId)
  if (!set) {
    set = new Set<WsClient>()
    gameIdToClients.set(gameId, set)
  }
  set.add(client)
  clientToGameId.set(client, gameId)
  consola.debug(`Client added to game ${gameId}, total clients: ${set.size}`)
}

/**
 * Remove a WebSocket client from its game room
 */
export function removeClient(client: WsClient): void {
  const gameId = clientToGameId.get(client)
  if (gameId) {
    const set = gameIdToClients.get(gameId)
    if (set) {
      set.delete(client)
      consola.debug(`Client removed from game ${gameId}, remaining: ${set.size}`)
      if (set.size === 0) {
        gameIdToClients.delete(gameId)
        consola.debug(`No more clients for game ${gameId}, cleaned up room`)
      }
    }
    clientToGameId.delete(client)
  }
}

/**
 * Safely send a message to a WebSocket client with error handling
 */
function sendToClient(client: WsClient, payload: string): boolean {
  try {
    if (!isClientReady(client)) {
      consola.warn('Attempted to send to non-ready WebSocket client')
      return false
    }
    client.send(payload)
    return true
  }
  catch (error) {
    consola.warn('Failed to send WebSocket message:', error)
    return false
  }
}

/**
 * Broadcast updated game state to all clients watching a game
 */
export function broadcastGame(gameId: string, game: GameState): void {
  const set = gameIdToClients.get(gameId)
  if (!set || set.size === 0) {
    consola.debug(`No clients to broadcast to for game ${gameId}`)
    return
  }

  const payload = JSON.stringify({ type: 'game_update', game })
  let successCount = 0
  let errorCount = 0
  const failedClients: WsClient[] = []

  for (const client of set) {
    if (sendToClient(client, payload)) {
      successCount++
    }
    else {
      errorCount++
      failedClients.push(client)
    }
  }

  // Clean up failed clients immediately instead of waiting for close event
  // Create a copy of failed clients to avoid modifying the set while iterating
  const clientsToRemove = [...failedClients]
  for (const failedClient of clientsToRemove) {
    try {
      removeClient(failedClient)
    }
    catch (error) {
      consola.error(`Error removing failed client for game ${gameId}:`, error)
    }
  }

  consola.debug(`Broadcast to game ${gameId}: ${successCount} sent, ${errorCount} failed`)
}

/**
 * Get the number of active clients for a game
 */
export function getClientCount(gameId: string): number {
  return gameIdToClients.get(gameId)?.size ?? 0
}

/**
 * Get all active game IDs with connected clients
 */
export function getActiveGames(): string[] {
  return Array.from(gameIdToClients.keys())
}
