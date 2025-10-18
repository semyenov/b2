import { defineConfig } from 'drizzle-kit'

// Note: Drizzle Kit runs outside the main application context, so we use environment variables directly
// The centralized config is only available when the server is running
const databaseUrl = process.env.DATABASE_URL || 'postgresql://balda:balda@localhost:5432/balda'

export default defineConfig({
  schema: './src/server/infrastructure/persistence/postgres/schema.ts',
  out: './drizzle', // Match where we created migration files
  dialect: 'postgresql',
  dbCredentials: {
    url: databaseUrl,
  },
  verbose: true,
  strict: true,
})
