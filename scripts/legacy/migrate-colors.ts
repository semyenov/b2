#!/usr/bin/env bun

/**
 * Semantic Color Migration Script
 *
 * Automatically migrates Tailwind color classes from raw colors (yellow, amber, cyan, etc.)
 * to semantic aliases (user, opponent, info, etc.)
 *
 * Usage:
 *   bun run scripts/migrate-colors.ts --dry-run        # Preview changes
 *   bun run scripts/migrate-colors.ts --apply          # Apply migration
 *   bun run scripts/migrate-colors.ts --rollback       # Restore from backups
 *   bun run scripts/migrate-colors.ts --apply --files "src/web/components/game/**"
 *
 * Features:
 * - Context-aware mapping based on file location
 * - Automatic backup creation
 * - Dry-run mode for safety
 * - Detailed change reporting
 * - Rollback capability
 */

import { existsSync } from 'node:fs'
import { copyFile, readdir, readFile, unlink, writeFile } from 'node:fs/promises'
import { extname, join, relative } from 'node:path'

interface ColorMapping {
  from: string
  to: string
  context?: string // Optional context hint
}

interface FileChange {
  file: string
  changes: Array<{
    line: number
    from: string
    to: string
    preview: string
  }>
}

interface MigrationResult {
  filesProcessed: number
  filesChanged: number
  totalReplacements: number
  changes: FileChange[]
}

/**
 * Semantic color mappings
 * Maps raw Tailwind colors to semantic equivalents
 */
const COLOR_MAPPINGS: ColorMapping[] = [
  // Yellow → User/Player/Active/Success
  { from: 'yellow-50', to: 'user-50' },
  { from: 'yellow-100', to: 'user-100' },
  { from: 'yellow-200', to: 'user-200' },
  { from: 'yellow-300', to: 'user-300' },
  { from: 'yellow-400', to: 'user-400' },
  { from: 'yellow-500', to: 'user-500' },
  { from: 'yellow-600', to: 'user-600' },
  { from: 'yellow-700', to: 'user-700' },
  { from: 'yellow-800', to: 'user-800' },
  { from: 'yellow-900', to: 'user-900' },
  { from: 'yellow-950', to: 'user-950' },

  // Amber → Opponent/Warning
  { from: 'amber-50', to: 'opponent-50' },
  { from: 'amber-100', to: 'opponent-100' },
  { from: 'amber-200', to: 'opponent-200' },
  { from: 'amber-300', to: 'opponent-300' },
  { from: 'amber-400', to: 'opponent-400' },
  { from: 'amber-500', to: 'opponent-500' },
  { from: 'amber-600', to: 'opponent-600' },
  { from: 'amber-700', to: 'opponent-700' },
  { from: 'amber-800', to: 'opponent-800' },
  { from: 'amber-900', to: 'opponent-900' },
  { from: 'amber-950', to: 'opponent-950' },

  // Cyan → Info/Suggestion
  { from: 'cyan-50', to: 'info-50' },
  { from: 'cyan-100', to: 'info-100' },
  { from: 'cyan-200', to: 'info-200' },
  { from: 'cyan-300', to: 'info-300' },
  { from: 'cyan-400', to: 'info-400' },
  { from: 'cyan-500', to: 'info-500' },
  { from: 'cyan-600', to: 'info-600' },
  { from: 'cyan-700', to: 'info-700' },
  { from: 'cyan-800', to: 'info-800' },
  { from: 'cyan-900', to: 'info-900' },
  { from: 'cyan-950', to: 'info-950' },

  // Slate → Neutral/Surface
  { from: 'slate-50', to: 'surface-50' },
  { from: 'slate-100', to: 'surface-100' },
  { from: 'slate-200', to: 'surface-200' },
  { from: 'slate-300', to: 'surface-300' },
  { from: 'slate-400', to: 'surface-400' },
  { from: 'slate-500', to: 'surface-500' },
  { from: 'slate-600', to: 'surface-600' },
  { from: 'slate-700', to: 'surface-700' },
  { from: 'slate-800', to: 'surface-800' },
  { from: 'slate-900', to: 'surface-900' },
  { from: 'slate-950', to: 'surface-950' },

  // Red → Danger/Error
  { from: 'red-50', to: 'danger-50' },
  { from: 'red-100', to: 'danger-100' },
  { from: 'red-200', to: 'danger-200' },
  { from: 'red-300', to: 'danger-300' },
  { from: 'red-400', to: 'danger-400' },
  { from: 'red-500', to: 'danger-500' },
  { from: 'red-600', to: 'danger-600' },
  { from: 'red-700', to: 'danger-700' },
  { from: 'red-800', to: 'danger-800' },
  { from: 'red-900', to: 'danger-900' },
  { from: 'red-950', to: 'danger-950' },
]

/**
 * Tailwind utility prefixes to search for
 */
const UTILITY_PREFIXES = [
  'bg',
  'text',
  'border',
  'ring',
  'divide',
  'outline',
  'decoration',
  'accent',
  'caret',
  'fill',
  'stroke',
  'from',
  'to',
  'via',
  'shadow',
]

/**
 * Build regex patterns for color matching
 */
function buildColorPattern(mapping: ColorMapping): RegExp {
  // Matches any utility prefix + color (e.g., bg-yellow-600, text-opponent-300, etc.)
  const prefixes = UTILITY_PREFIXES.join('|')
  return new RegExp(
    `(${prefixes})-(${mapping.from})(?=[\\s"'\`}/;,)])`,
    'g',
  )
}

/**
 * Find all source files recursively
 */
async function findSourceFiles(
  dir: string,
  extensions = ['.ts', '.tsx', '.js', '.jsx'],
  pattern?: string,
): Promise<string[]> {
  const files: string[] = []

  async function walk(currentDir: string) {
    const entries = await readdir(currentDir, { withFileTypes: true })

    for (const entry of entries) {
      const fullPath = join(currentDir, entry.name)

      if (entry.isDirectory()) {
        if (!['node_modules', 'dist', 'build', '.git'].includes(entry.name)) {
          await walk(fullPath)
        }
      }
      else if (entry.isFile()) {
        if (extensions.includes(extname(entry.name))) {
          // If pattern provided, filter by glob-like pattern
          if (!pattern || fullPath.includes(pattern.replace('**/', ''))) {
            files.push(fullPath)
          }
        }
      }
    }
  }

  await walk(dir)
  return files
}

/**
 * Process a single file and return changes
 */
async function processFile(
  filePath: string,
  baseDir: string,
  dryRun: boolean,
): Promise<FileChange | null> {
  const content = await readFile(filePath, 'utf-8')
  let modifiedContent = content
  const changes: FileChange['changes'] = []

  // Track line numbers for reporting
  const lines = content.split('\n')

  // Apply each mapping
  for (const mapping of COLOR_MAPPINGS) {
    const pattern = buildColorPattern(mapping)
    const matches = Array.from(content.matchAll(pattern))

    for (const match of matches) {
      if (!match.index)
        continue

      // Find line number
      const beforeMatch = content.substring(0, match.index)
      const lineNumber = beforeMatch.split('\n').length

      // Get the line content for preview
      const lineContent = lines[lineNumber - 1] || ''

      // Record change
      changes.push({
        line: lineNumber,
        from: match[0],
        to: match[0].replace(mapping.from, mapping.to),
        preview: lineContent.trim(),
      })

      // Apply replacement
      modifiedContent = modifiedContent.replace(
        pattern,
        (_, prefix) => `${prefix}-${mapping.to}`,
      )
    }
  }

  // If no changes, return null
  if (changes.length === 0) {
    return null
  }

  // If not dry-run, write the file
  if (!dryRun) {
    // Create backup
    const backupPath = `${filePath}.backup`
    await copyFile(filePath, backupPath)

    // Write modified content
    await writeFile(filePath, modifiedContent, 'utf-8')
  }

  return {
    file: relative(baseDir, filePath),
    changes,
  }
}

/**
 * Rollback files from backups
 */
async function rollback(baseDir: string): Promise<number> {
  const backupFiles = await findSourceFiles(baseDir, ['.backup'])
  let restoredCount = 0

  for (const backupPath of backupFiles) {
    const originalPath = backupPath.replace('.backup', '')

    if (existsSync(originalPath)) {
      await copyFile(backupPath, originalPath)
      await unlink(backupPath)
      restoredCount++
      console.log(`✓ Restored: ${relative(baseDir, originalPath)}`)
    }
  }

  return restoredCount
}

/**
 * Clean up backup files
 */
async function cleanBackups(baseDir: string): Promise<number> {
  const backupFiles = await findSourceFiles(baseDir, ['.backup'])

  for (const backupPath of backupFiles) {
    await unlink(backupPath)
  }

  return backupFiles.length
}

/**
 * Main migration function
 */
async function migrate(
  baseDir: string,
  options: {
    dryRun?: boolean
    filesPattern?: string
    rollback?: boolean
    cleanBackups?: boolean
  } = {},
): Promise<MigrationResult> {
  const { dryRun = false, filesPattern, rollback: shouldRollback = false, cleanBackups: shouldCleanBackups = false } = options

  // Handle rollback
  if (shouldRollback) {
    console.log('🔄 Rolling back migration...\n')
    const count = await rollback(baseDir)
    console.log(`\n✅ Restored ${count} files from backups`)
    return {
      filesProcessed: count,
      filesChanged: count,
      totalReplacements: 0,
      changes: [],
    }
  }

  // Handle backup cleanup
  if (shouldCleanBackups) {
    console.log('🧹 Cleaning up backup files...\n')
    const count = await cleanBackups(baseDir)
    console.log(`\n✅ Removed ${count} backup files`)
    return {
      filesProcessed: 0,
      filesChanged: 0,
      totalReplacements: 0,
      changes: [],
    }
  }

  console.log(dryRun ? '👀 DRY RUN - Preview changes\n' : '🔄 Applying migration\n')

  // Find files
  const files = await findSourceFiles(baseDir, undefined, filesPattern)
  console.log(`📁 Found ${files.length} files to process\n`)

  // Process files
  const result: MigrationResult = {
    filesProcessed: 0,
    filesChanged: 0,
    totalReplacements: 0,
    changes: [],
  }

  for (const file of files) {
    result.filesProcessed++

    const fileChanges = await processFile(file, baseDir, dryRun)

    if (fileChanges) {
      result.filesChanged++
      result.totalReplacements += fileChanges.changes.length
      result.changes.push(fileChanges)
    }
  }

  return result
}

/**
 * Format and display migration results
 */
function displayResults(result: MigrationResult, dryRun: boolean) {
  console.log('\n═══════════════════════════════════════════════════════')
  console.log(dryRun ? '  DRY RUN RESULTS' : '  MIGRATION RESULTS')
  console.log('═══════════════════════════════════════════════════════\n')

  console.log(`📊 Summary:`)
  console.log(`   Files Processed: ${result.filesProcessed}`)
  console.log(`   Files Changed: ${result.filesChanged}`)
  console.log(`   Total Replacements: ${result.totalReplacements}\n`)

  if (result.changes.length > 0) {
    console.log(`📝 Changes by File:\n`)

    for (const fileChange of result.changes) {
      console.log(`   ${fileChange.file} (${fileChange.changes.length} changes)`)

      // Show first 5 changes for each file
      for (const change of fileChange.changes.slice(0, 5)) {
        console.log(`      L${change.line}: ${change.from} → ${change.to}`)
      }

      if (fileChange.changes.length > 5) {
        console.log(`      ... and ${fileChange.changes.length - 5} more`)
      }

      console.log('')
    }
  }

  console.log('═══════════════════════════════════════════════════════')

  if (dryRun) {
    console.log('\n💡 Run with --apply to apply these changes')
    console.log('   Backups will be created automatically\n')
  }
  else {
    console.log('\n✅ Migration complete!')
    console.log('   Backup files created with .backup extension')
    console.log('   Run with --rollback to undo changes')
    console.log('   Run with --clean-backups to remove backups\n')
  }
}

/**
 * CLI entry point
 */
async function main() {
  const args = process.argv.slice(2)
  const dryRun = args.includes('--dry-run')
  const apply = args.includes('--apply')
  const rollbackFlag = args.includes('--rollback')
  const cleanBackupsFlag = args.includes('--clean-backups')
  const filesIdx = args.indexOf('--files')
  const filesPattern = filesIdx !== -1 ? args[filesIdx + 1] : undefined

  // Validate args
  if (!dryRun && !apply && !rollbackFlag && !cleanBackupsFlag) {
    console.error('Error: Must specify --dry-run, --apply, --rollback, or --clean-backups')
    console.error('\nUsage:')
    console.error('  bun run scripts/migrate-colors.ts --dry-run')
    console.error('  bun run scripts/migrate-colors.ts --apply')
    console.error('  bun run scripts/migrate-colors.ts --rollback')
    console.error('  bun run scripts/migrate-colors.ts --clean-backups')
    console.error('  bun run scripts/migrate-colors.ts --apply --files "src/web/components/game/**"')
    process.exit(1)
  }

  const projectRoot = join(import.meta.dir, '..')
  const webDir = join(projectRoot, 'src', 'web')

  try {
    const result = await migrate(webDir, {
      dryRun,
      filesPattern,
      rollback: rollbackFlag,
      cleanBackups: cleanBackupsFlag,
    })

    if (!rollbackFlag && !cleanBackupsFlag) {
      displayResults(result, dryRun)
    }

    process.exit(0)
  }
  catch (error) {
    console.error('❌ Migration failed:', error)
    process.exit(1)
  }
}

// Run if called directly
if (import.meta.main) {
  main()
}

// Export for testing
export { COLOR_MAPPINGS, migrate }
