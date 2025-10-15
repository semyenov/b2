#!/usr/bin/env bun
/**
 * Import Path Migration Script
 *
 * Converts between relative imports (../../) and path aliases (@xxx/)
 * Helps maintain consistency across the codebase
 *
 * Usage:
 *   bun run scripts/migrate-imports.ts [--to-alias|--to-relative] [--dry-run] [pattern]
 *
 * Examples:
 *   # Convert all relative imports in src/web to aliases (dry run)
 *   bun run scripts/migrate-imports.ts --to-alias --dry-run "src/web/**\/*.ts"
 *
 *   # Apply conversion
 *   bun run scripts/migrate-imports.ts --to-alias "src/web/**\/*.tsx"
 *
 *   # Convert specific aliases back to relative imports
 *   bun run scripts/migrate-imports.ts --to-relative "src/server/**\/*.ts"
 */

import { readFile, writeFile } from 'node:fs/promises'
import { dirname, relative, resolve } from 'node:path'
import { consola } from 'consola'

/* ============================================ */
/* Configuration */
/* ============================================ */

const PATH_ALIASES: Record<string, string> = {
  '@shared': 'src/shared',
  '@server': 'src/server',
  '@web': 'src/web',
  '@components': 'src/web/components',
  '@hooks': 'src/web/hooks',
  '@utils': 'src/web/utils',
  '@lib': 'src/web/lib',
  '@types': 'src/web/types',
  '@constants': 'src/web/constants',
  '@config': 'src/web/config',
}

interface MigrationOptions {
  toAlias: boolean
  toRelative: boolean
  dryRun: boolean
  pattern: string
}

interface ImportReplacement {
  file: string
  lineNumber: number
  original: string
  replacement: string
}

/* ============================================ */
/* Utility Functions */
/* ============================================ */

/**
 * Parse command line arguments
 */
function parseArgs(): MigrationOptions {
  const args = process.argv.slice(2)

  return {
    toAlias: args.includes('--to-alias'),
    toRelative: args.includes('--to-relative'),
    dryRun: args.includes('--dry-run'),
    pattern: args.find(arg => !arg.startsWith('--')) || 'src/**/*.{ts,tsx}',
  }
}

/**
 * Find all TypeScript files matching pattern
 */
async function findFiles(pattern: string): Promise<string[]> {
  const glob = new Bun.Glob(pattern)
  const files: string[] = []

  for await (const file of glob.scan('.')) {
    if (!file.includes('node_modules') && !file.includes('dist')) {
      files.push(file)
    }
  }

  return files
}

/**
 * Convert relative path to alias
 */
function relativeToAlias(importPath: string, currentFile: string): string | null {
  if (!importPath.startsWith('.')) {
    return null // Already an alias or external module
  }

  const currentDir = dirname(resolve(currentFile))
  const targetPath = resolve(currentDir, importPath)
  const projectRoot = process.cwd()
  const relativePath = relative(projectRoot, targetPath)

  // Try to match with path aliases
  for (const [alias, aliasPath] of Object.entries(PATH_ALIASES)) {
    if (relativePath.startsWith(aliasPath)) {
      const remainingPath = relativePath.slice(aliasPath.length)
      return `${alias}${remainingPath}`.replace(/\\/g, '/')
    }
  }

  return null // No matching alias found
}

/**
 * Convert alias to relative path
 */
function aliasToRelative(importPath: string, currentFile: string): string | null {
  // Find matching alias
  const matchedAlias = Object.keys(PATH_ALIASES).find(alias =>
    importPath.startsWith(alias),
  )

  if (!matchedAlias) {
    return null // Not an alias import
  }

  const aliasPath = PATH_ALIASES[matchedAlias]!
  const remainingPath = importPath.slice(matchedAlias.length)
  const targetPath = resolve(aliasPath + remainingPath)
  const currentDir = dirname(resolve(currentFile))
  let relativePath = relative(currentDir, targetPath).replace(/\\/g, '/')

  // Ensure relative path starts with ./ or ../
  if (!relativePath.startsWith('.')) {
    relativePath = `./${relativePath}`
  }

  return relativePath
}

/**
 * Process a single file for import migration
 */
async function processFile(
  file: string,
  options: MigrationOptions,
): Promise<ImportReplacement[]> {
  const content = await readFile(file, 'utf-8')
  const lines = content.split('\n')
  const replacements: ImportReplacement[] = []

  // Match import statements
  const importRegex = /^import\s+(?:type\s+)?(?:\{[^}]+\}|[\w*]+)\s+from\s+['"]([^'"]+)['"]/

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i]!
    const match = line.match(importRegex)

    if (match) {
      const importPath = match[1]!
      let newPath: string | null = null

      if (options.toAlias) {
        newPath = relativeToAlias(importPath, file)
      }
      else if (options.toRelative) {
        newPath = aliasToRelative(importPath, file)
      }

      if (newPath && newPath !== importPath) {
        const newLine = line.replace(importPath, newPath)
        lines[i] = newLine

        replacements.push({
          file,
          lineNumber: i + 1,
          original: importPath,
          replacement: newPath,
        })
      }
    }
  }

  // Write back if not dry run and changes were made
  if (!options.dryRun && replacements.length > 0) {
    await writeFile(file, lines.join('\n'))
  }

  return replacements
}

/* ============================================ */
/* Main */
/* ============================================ */

async function main() {
  const options = parseArgs()

  // Validate options
  if (!options.toAlias && !options.toRelative) {
    consola.error('Please specify --to-alias or --to-relative')
    process.exit(1)
  }

  if (options.toAlias && options.toRelative) {
    consola.error('Cannot specify both --to-alias and --to-relative')
    process.exit(1)
  }

  consola.info(`Migration mode: ${options.toAlias ? 'Relative → Alias' : 'Alias → Relative'}`)
  consola.info(`Pattern: ${options.pattern}`)
  consola.info(`Dry run: ${options.dryRun}`)
  console.log()

  // Find files
  consola.start('Finding files...')
  const files = await findFiles(options.pattern)
  consola.success(`Found ${files.length} files`)
  console.log()

  // Process files
  consola.start('Processing files...')
  const allReplacements: ImportReplacement[] = []

  for (const file of files) {
    const replacements = await processFile(file, options)
    allReplacements.push(...replacements)
  }

  // Report results
  console.log()
  if (allReplacements.length === 0) {
    consola.success('No imports to migrate')
    return
  }

  consola.success(`Found ${allReplacements.length} imports to migrate`)
  console.log()

  // Group by file
  const byFile = allReplacements.reduce((acc, rep) => {
    if (!acc[rep.file]) {
      acc[rep.file] = []
    }
    acc[rep.file]!.push(rep)
    return acc
  }, {} as Record<string, ImportReplacement[]>)

  // Display changes
  for (const [file, replacements] of Object.entries(byFile)) {
    console.log(`📝 ${file}`)
    for (const rep of replacements) {
      console.log(`  Line ${rep.lineNumber}:`)
      console.log(`    - ${rep.original}`)
      console.log(`    + ${rep.replacement}`)
    }
    console.log()
  }

  if (options.dryRun) {
    consola.box('DRY RUN - No files were modified\nRun without --dry-run to apply changes')
  }
  else {
    consola.success('✅ Migration complete!')
  }
}

main().catch((error) => {
  consola.error('Migration failed:', error)
  process.exit(1)
})
