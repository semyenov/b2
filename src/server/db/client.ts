import { consola } from 'consola'
import { drizzle } from 'drizzle-orm/postgres-js'
import postgres from 'postgres'
import * as schema from './schema'

/**
 * PostgreSQL connection configuration
 * - Uses connection pooling for performance
 * - Prepared statements for security and speed
 * - Graceful shutdown on SIGTERM
 */

const databaseUrl = process.env.DATABASE_URL
if (!databaseUrl) {
  throw new Error('DATABASE_URL environment variable is required')
}

// Create postgres client with connection pool
const client = postgres(databaseUrl, {
  max: 20, // Maximum connections in pool
  idle_timeout: 20, // Close idle connections after 20s
  connect_timeout: 10, // Timeout after 10s
  prepare: true, // Use prepared statements
  onnotice: () => {}, // Ignore PostgreSQL notices
})

// Create Drizzle ORM instance
export const db = drizzle(client, { schema })

// Graceful shutdown handler
async function shutdown() {
  consola.info('Closing database connection...')
  await client.end({ timeout: 5 })
  consola.success('Database connection closed')
  process.exit(0)
}

process.on('SIGTERM', shutdown)
process.on('SIGINT', shutdown)

// Health check function
export async function checkDatabaseConnection(): Promise<boolean> {
  try {
    await client`SELECT 1`
    consola.success('Database connection established')
    return true
  }
  catch (error) {
    consola.error('Database connection failed:', error)
    return false
  }
}

// Export the client for advanced queries
export { client }
