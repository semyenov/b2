#!/usr/bin/env bun
/**
 * Codebase Statistics and Analysis
 *
 * Provides comprehensive statistics about the codebase:
 * - File counts by type
 * - Lines of code analysis
 * - Import statistics
 * - Component/hook/utility counts
 * - TypeScript coverage
 *
 * Usage:
 *   bun run scripts/analyze-codebase.ts [--verbose] [--json]
 */

import { readFile } from 'node:fs/promises'
import { consola } from 'consola'

/* ============================================ */
/* Interfaces */
/* ============================================ */

interface CodeStats {
  totalFiles: number
  totalLines: number
  totalCodeLines: number
  totalCommentLines: number
  totalBlankLines: number
  filesByType: Record<string, number>
  filesByDirectory: Record<string, number>
  importStats: {
    totalImports: number
    relativeImports: number
    aliasImports: number
    externalImports: number
  }
  componentStats: {
    totalComponents: number
    functionalComponents: number
    classComponents: number
  }
  hooksCount: number
  utilsCount: number
  constantsCount: number
}

/* ============================================ */
/* Utility Functions */
/* ============================================ */

/**
 * Find all source files
 */
async function findSourceFiles(): Promise<string[]> {
  const glob = new Bun.Glob('src/**/*.{ts,tsx}')
  const files: string[] = []

  for await (const file of glob.scan('.')) {
    if (!file.includes('node_modules') && !file.includes('.test.') && !file.includes('.spec.')) {
      files.push(file)
    }
  }

  return files
}

/**
 * Analyze a single file
 */
async function analyzeFile(file: string): Promise<{
  lines: number
  codeLines: number
  commentLines: number
  blankLines: number
  imports: {
    total: number
    relative: number
    alias: number
    external: number
  }
  isComponent: boolean
  isFunctionalComponent: boolean
  isClassComponent: boolean
  isHook: boolean
  isUtil: boolean
  hasConstants: boolean
}> {
  const content = await readFile(file, 'utf-8')
  const lines = content.split('\n')

  let codeLines = 0
  let commentLines = 0
  let blankLines = 0
  let inBlockComment = false

  const imports = {
    total: 0,
    relative: 0,
    alias: 0,
    external: 0,
  }

  let isComponent = false
  let isFunctionalComponent = false
  let isClassComponent = false

  for (const line of lines) {
    const trimmed = line.trim()

    // Count line types
    if (trimmed === '') {
      blankLines++
    }
    else if (trimmed.startsWith('//')) {
      commentLines++
    }
    else if (trimmed.startsWith('/*') || inBlockComment) {
      commentLines++
      if (trimmed.startsWith('/*')) {
        inBlockComment = true
      }
      if (trimmed.endsWith('*/')) {
        inBlockComment = false
      }
    }
    else {
      codeLines++
    }

    // Analyze imports
    if (trimmed.startsWith('import ')) {
      imports.total++

      if (trimmed.includes('from \'../') || trimmed.includes('from "../') || trimmed.includes('from \'./') || trimmed.includes('from "./')) {
        imports.relative++
      }
      else if (trimmed.includes('from \'@') || trimmed.includes('from "@')) {
        imports.alias++
      }
      else {
        imports.external++
      }
    }

    // Detect components
    if (trimmed.includes('export function') && trimmed.includes('(') && file.endsWith('.tsx')) {
      isFunctionalComponent = true
      isComponent = true
    }
    if (trimmed.includes('export class') && trimmed.includes('extends Component')) {
      isClassComponent = true
      isComponent = true
    }
  }

  return {
    lines: lines.length,
    codeLines,
    commentLines,
    blankLines,
    imports,
    isComponent,
    isFunctionalComponent,
    isClassComponent,
    isHook: file.includes('/hooks/') && file.startsWith('src/web/'),
    isUtil: file.includes('/utils/'),
    hasConstants: file.includes('/constants/') || (content.includes('export const') && content.match(/export const [A-Z_]{3,}/) !== null),
  }
}

/**
 * Get file extension
 */
function getExtension(file: string): string {
  const parts = file.split('.')
  return parts[parts.length - 1] || 'unknown'
}

/**
 * Get top-level directory
 */
function getDirectory(file: string): string {
  const parts = file.split('/')
  return parts.length > 1 ? parts[1]! : 'root'
}

/* ============================================ */
/* Main */
/* ============================================ */

async function main() {
  const args = process.argv.slice(2)
  const verbose = args.includes('--verbose')
  const jsonOutput = args.includes('--json')

  if (!jsonOutput) {
    consola.start('Analyzing codebase...')
    console.log()
  }

  const files = await findSourceFiles()

  const stats: CodeStats = {
    totalFiles: files.length,
    totalLines: 0,
    totalCodeLines: 0,
    totalCommentLines: 0,
    totalBlankLines: 0,
    filesByType: {},
    filesByDirectory: {},
    importStats: {
      totalImports: 0,
      relativeImports: 0,
      aliasImports: 0,
      externalImports: 0,
    },
    componentStats: {
      totalComponents: 0,
      functionalComponents: 0,
      classComponents: 0,
    },
    hooksCount: 0,
    utilsCount: 0,
    constantsCount: 0,
  }

  for (const file of files) {
    const analysis = await analyzeFile(file)

    stats.totalLines += analysis.lines
    stats.totalCodeLines += analysis.codeLines
    stats.totalCommentLines += analysis.commentLines
    stats.totalBlankLines += analysis.blankLines

    stats.importStats.totalImports += analysis.imports.total
    stats.importStats.relativeImports += analysis.imports.relative
    stats.importStats.aliasImports += analysis.imports.alias
    stats.importStats.externalImports += analysis.imports.external

    if (analysis.isComponent) {
      stats.componentStats.totalComponents++
    }
    if (analysis.isFunctionalComponent) {
      stats.componentStats.functionalComponents++
    }
    if (analysis.isClassComponent) {
      stats.componentStats.classComponents++
    }
    if (analysis.isHook) {
      stats.hooksCount++
    }
    if (analysis.isUtil) {
      stats.utilsCount++
    }
    if (analysis.hasConstants) {
      stats.constantsCount++
    }

    const ext = getExtension(file)
    stats.filesByType[ext] = (stats.filesByType[ext] || 0) + 1

    const dir = getDirectory(file)
    stats.filesByDirectory[dir] = (stats.filesByDirectory[dir] || 0) + 1
  }

  // Output
  if (jsonOutput) {
    console.log(JSON.stringify(stats, null, 2))
    return
  }

  // Pretty output
  consola.box('Codebase Statistics')
  console.log()

  console.log('📊 Overview:')
  console.log(`  Total Files: ${stats.totalFiles}`)
  console.log(`  Total Lines: ${stats.totalLines.toLocaleString()}`)
  console.log(`  Code Lines: ${stats.totalCodeLines.toLocaleString()} (${((stats.totalCodeLines / stats.totalLines) * 100).toFixed(1)}%)`)
  console.log(`  Comment Lines: ${stats.totalCommentLines.toLocaleString()} (${((stats.totalCommentLines / stats.totalLines) * 100).toFixed(1)}%)`)
  console.log(`  Blank Lines: ${stats.totalBlankLines.toLocaleString()} (${((stats.totalBlankLines / stats.totalLines) * 100).toFixed(1)}%)`)
  console.log()

  console.log('📦 Files by Type:')
  Object.entries(stats.filesByType)
    .sort(([, a], [, b]) => b - a)
    .forEach(([ext, count]) => {
      console.log(`  .${ext}: ${count} files`)
    })
  console.log()

  console.log('📁 Files by Directory:')
  Object.entries(stats.filesByDirectory)
    .sort(([, a], [, b]) => b - a)
    .forEach(([dir, count]) => {
      console.log(`  ${dir}: ${count} files`)
    })
  console.log()

  console.log('🔗 Import Statistics:')
  console.log(`  Total Imports: ${stats.importStats.totalImports}`)
  console.log(`  Relative Imports: ${stats.importStats.relativeImports} (${((stats.importStats.relativeImports / stats.importStats.totalImports) * 100).toFixed(1)}%)`)
  console.log(`  Alias Imports: ${stats.importStats.aliasImports} (${((stats.importStats.aliasImports / stats.importStats.totalImports) * 100).toFixed(1)}%)`)
  console.log(`  External Imports: ${stats.importStats.externalImports} (${((stats.importStats.externalImports / stats.importStats.totalImports) * 100).toFixed(1)}%)`)
  console.log()

  console.log('⚛️  React Statistics:')
  console.log(`  Components: ${stats.componentStats.totalComponents}`)
  console.log(`    Functional: ${stats.componentStats.functionalComponents}`)
  console.log(`    Class: ${stats.componentStats.classComponents}`)
  console.log(`  Custom Hooks: ${stats.hooksCount}`)
  console.log()

  console.log('🛠️  Code Organization:')
  console.log(`  Utility Files: ${stats.utilsCount}`)
  console.log(`  Constants Files: ${stats.constantsCount}`)
  console.log()

  if (verbose) {
    console.log('💡 Recommendations:')
    const relativePercentage = (stats.importStats.relativeImports / stats.importStats.totalImports) * 100
    if (relativePercentage > 40) {
      console.log(`  ⚠️  High relative imports (${relativePercentage.toFixed(1)}%) - Consider using more path aliases`)
    }
    if (stats.componentStats.classComponents > 0) {
      console.log(`  ℹ️  Found ${stats.componentStats.classComponents} class components - Consider migrating to functional components`)
    }
    const avgLinesPerFile = stats.totalCodeLines / stats.totalFiles
    if (avgLinesPerFile > 200) {
      console.log(`  ⚠️  High average lines per file (${avgLinesPerFile.toFixed(0)}) - Consider splitting large files`)
    }
    console.log()
  }

  consola.success('Analysis complete!')
}

main().catch((error) => {
  consola.error('Analysis failed:', error)
  process.exit(1)
})
