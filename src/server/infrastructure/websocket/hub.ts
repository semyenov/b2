import type { GameState } from '@server/domain/game/engine'
import { ARCHIVE_DELAY_MS, WS_STATES } from '@server/core/constants/websocket'
import { consola } from 'consola'

interface WsClient {
  send: (data: string) => number
  close: (code?: number, reason?: string) => void
  readyState: number
}

/**
 * Check if a WebSocket client is in a valid state for sending messages
 */
function isClientReady(client: WsClient): boolean {
  return client.readyState === WS_STATES.OPEN
}

const gameIdToClients = new Map<string, Set<WsClient>>()
const clientToGameId = new Map<WsClient, string>()

// Track archive timeouts for games with no clients
const archiveTimeouts = new Map<string, NodeJS.Timeout>()

/**
 * Callback function to archive a game (injected from routes)
 */
let archiveGameCallback: ((gameId: string) => Promise<void>) | null = null

/**
 * Set the callback function to archive games
 */
export function setArchiveCallback(callback: (gameId: string) => Promise<void>): void {
  archiveGameCallback = callback
}

/**
 * Schedule a game for archiving after all clients disconnect
 */
function scheduleGameArchive(gameId: string): void {
  // Clear any existing timeout
  const existingTimeout = archiveTimeouts.get(gameId)
  if (existingTimeout) {
    clearTimeout(existingTimeout)
  }

  // Schedule new archive timeout
  const timeout = setTimeout(async () => {
    consola.info(`Archiving game ${gameId} after all clients disconnected`)
    archiveTimeouts.delete(gameId)

    if (archiveGameCallback) {
      try {
        await archiveGameCallback(gameId)
        consola.info(`Game ${gameId} archived successfully`)
      }
      catch (error) {
        consola.error(`Failed to archive game ${gameId}:`, error)
      }
    }
  }, ARCHIVE_DELAY_MS)

  archiveTimeouts.set(gameId, timeout)
  consola.debug(`Game ${gameId} scheduled for archiving in ${ARCHIVE_DELAY_MS / 1000}s`)
}

/**
 * Cancel scheduled archive for a game (when clients reconnect)
 */
function cancelGameArchive(gameId: string): void {
  const timeout = archiveTimeouts.get(gameId)
  if (timeout) {
    clearTimeout(timeout)
    archiveTimeouts.delete(gameId)
    consola.debug(`Cancelled archive for game ${gameId}`)
  }
}

/**
 * Add a WebSocket client to a game room for broadcasts
 */
export function addClient(gameId: string, client: WsClient): void {
  // Cancel any pending archive for this game
  cancelGameArchive(gameId)

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
        consola.debug(`No more clients for game ${gameId}, scheduling archive`)
        // Schedule game for archiving after delay
        scheduleGameArchive(gameId)
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
