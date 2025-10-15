import { defineConfig } from 'drizzle-kit'

export default defineConfig({
  schema: './src/server/db/schema.ts',
  out: './drizzle', // Match where we created migration files
  dialect: 'postgresql',
  dbCredentials: {
    url: process.env.DATABASE_URL || 'postgresql://balda:balda@localhost:5432/balda',
  },
  verbose: true,
  strict: true,
})
