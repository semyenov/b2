import { getConfig } from '@shared/config/server'
import { consola } from 'consola'
import { drizzle } from 'drizzle-orm/postgres-js'
import postgres from 'postgres'
import * as schema from './schema'

/**
 * PostgreSQL connection configuration
 * - Uses connection pooling for performance
 * - Prepared statements for security and speed
 * - Graceful shutdown on SIGTERM
 * - Configuration loaded lazily on first access
 */

let client: ReturnType<typeof postgres> | null = null
let dbInstance: ReturnType<typeof drizzle> | null = null

function initializeDatabase() {
  if (dbInstance) {
    return { client: client!, db: dbInstance }
  }

  const config = getConfig()

  // Create postgres client with connection pool
  client = postgres(config.database.url, {
    max: config.database.maxConnections,
    idle_timeout: config.database.idleTimeout,
    connect_timeout: config.database.connectTimeout,
    prepare: config.database.preparedStatements,
    onnotice: () => {}, // Ignore PostgreSQL notices
  })

  // Create Drizzle ORM instance
  dbInstance = drizzle(client, { schema })

  return { client, db: dbInstance }
}

/**
 * Get database instance (lazy initialization)
 */
export const db = new Proxy({} as ReturnType<typeof drizzle>, {
  get(_target, prop) {
    const { db } = initializeDatabase()
    const value = db[prop as keyof typeof db]
    if (typeof value === 'function') {
      return value.bind(db)
    }
    return value
  },
})

// Graceful shutdown handler
async function shutdown() {
  if (client) {
    consola.info('Closing database connection...')
    await client.end({ timeout: 5 })
    consola.success('Database connection closed')
  }
  process.exit(0)
}

process.on('SIGTERM', shutdown)
process.on('SIGINT', shutdown)

// Health check function
export async function checkDatabaseConnection(): Promise<boolean> {
  try {
    const { client: dbClient } = initializeDatabase()
    await dbClient`SELECT 1`
    consola.success('Database connection established')
    return true
  }
  catch (error) {
    consola.error('Database connection failed:', error)
    return false
  }
}

// Export function to get the client for advanced queries
export function getClient() {
  const { client: dbClient } = initializeDatabase()
  return dbClient
}
