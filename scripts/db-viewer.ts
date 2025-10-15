#!/usr/bin/env bun
/**
 * Simple database viewer script
 * Alternative to Drizzle Studio for viewing database contents
 */

import postgres from 'postgres'

const sql = postgres(process.env.DATABASE_URL || 'postgresql://balda:balda@localhost:5432/balda')

/**
 * Database query result types
 */
interface GameRow {
  id: string
  size: number
  move_count: number | null
  created_at: Date
}

interface UserRow {
  id: string
  username: string
  email: string
  created_at: Date
}

interface WordCountRow {
  language: string
  count: number
}

interface WordSampleRow {
  word: string
  language: string
}

interface StatsRow {
  total_games: number
  total_users: number
  total_words: number
}

async function viewDatabase() {
  console.log('\n📊 Balda Database Viewer\n')
  console.log('='.repeat(60))

  try {
    // Games table
    const games = await sql<GameRow[]>`SELECT id, size, jsonb_array_length(moves) as move_count, created_at FROM games ORDER BY created_at DESC LIMIT 10`
    console.log('\n🎮 Games (latest 10):')
    console.log('-'.repeat(60))
    if (games.length === 0) {
      console.log('  No games found')
    }
    else {
      games.forEach((game: GameRow) => {
        console.log(`  ID: ${game.id.slice(0, 8)}... | Size: ${game.size}x${game.size} | Moves: ${game.move_count || 0} | Created: ${new Date(game.created_at).toLocaleString()}`)
      })
    }

    // Users table
    const users = await sql<UserRow[]>`SELECT id, username, email, created_at FROM users ORDER BY created_at DESC LIMIT 10`
    console.log('\n👤 Users (latest 10):')
    console.log('-'.repeat(60))
    if (users.length === 0) {
      console.log('  No users found')
    }
    else {
      users.forEach((user: UserRow) => {
        console.log(`  ${user.username} <${user.email}> | Created: ${new Date(user.created_at).toLocaleString()}`)
      })
    }

    // Words table
    const wordCount = await sql<WordCountRow[]>`SELECT language, COUNT(*) as count FROM words GROUP BY language`
    console.log('\n📖 Dictionary:')
    console.log('-'.repeat(60))
    if (wordCount.length === 0) {
      console.log('  No words found')
    }
    else {
      wordCount.forEach((row: WordCountRow) => {
        console.log(`  ${row.language}: ${row.count} words`)
      })
    }

    // Sample words
    const sampleWords = await sql<WordSampleRow[]>`SELECT word, language FROM words ORDER BY RANDOM() LIMIT 10`
    if (sampleWords.length > 0) {
      console.log('\n  Sample words:', sampleWords.map(w => w.word).join(', '))
    }

    // Stats
    const stats = await sql<StatsRow[]>`
      SELECT
        (SELECT COUNT(*) FROM games) as total_games,
        (SELECT COUNT(*) FROM users) as total_users,
        (SELECT COUNT(*) FROM words) as total_words
    `
    console.log('\n📈 Statistics:')
    console.log('-'.repeat(60))
    const firstStat = stats[0]
    if (firstStat) {
      console.log(`  Total Games: ${firstStat.total_games}`)
      console.log(`  Total Users: ${firstStat.total_users}`)
      console.log(`  Total Words: ${firstStat.total_words}`)
    }

    console.log(`\n${'='.repeat(60)}`)
    console.log('\n✅ Database connection successful!\n')
  }
  catch (error) {
    console.error('❌ Error:', error)
  }
  finally {
    await sql.end()
  }
}

viewDatabase()
