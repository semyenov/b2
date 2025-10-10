import type { GameState } from './engine/balda'
import { consola } from 'consola'

interface WsClient {
  send: (data: string) => number
  close: (code?: number, reason?: string) => void
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
 * Broadcast updated game state to all clients watching a game
 */
export function broadcastGame(gameId: string, game: GameState): void {
  const set = gameIdToClients.get(gameId)
  if (!set || set.size === 0) {
    consola.debug(`No clients to broadcast to for game ${gameId}`)
    return
  }

  const payload = JSON.stringify({ type: 'game', game })
  let successCount = 0
  let errorCount = 0

  for (const c of set) {
    try {
      c.send(payload)
      successCount++
    }
    catch (error) {
      errorCount++
      consola.warn(`Failed to send to client in game ${gameId}:`, error)
      // Client likely disconnected, will be cleaned up on close event
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
