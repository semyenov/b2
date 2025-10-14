#!/usr/bin/env bun

/**
 * Color Analysis Script
 *
 * Analyzes Tailwind color class usage across the web frontend codebase.
 * Generates reports on color distribution, component usage, and potential issues.
 *
 * Usage:
 *   bun run scripts/analyze-colors.ts
 *   bun run scripts/analyze-colors.ts --verbose
 *   bun run scripts/analyze-colors.ts --json
 */

import { readdir, readFile } from 'node:fs/promises'
import { join, relative } from 'node:path'

interface ColorUsage {
  color: string
  shade: string
  count: number
  files: Map<string, number> // file path -> count in that file
}

interface ColorReport {
  totalClasses: number
  colorFamilies: Map<string, number> // color -> total count
  shadeUsage: ColorUsage[] // all color-shade combinations
  deprecatedUsage: ColorUsage[] // yellow usage
  fileBreakdown: Map<string, Map<string, number>> // file -> (color-shade -> count)
}

// Supported Tailwind color families
const COLOR_FAMILIES = [
  'emerald',
  'amber',
  'cyan',
  'red',
  'yellow',
  'slate',
  'purple',
  'blue',
  'green',
  'orange',
  'pink',
  'indigo',
  'violet',
  'fuchsia',
  'rose',
  'lime',
  'teal',
  'sky',
]

// Regex to match Tailwind color classes
// Matches: bg-emerald-500, text-cyan-400/50, border-amber-300, etc.
const COLOR_CLASS_REGEX = new RegExp(
  `(?:bg|text|border|ring|shadow|divide|outline|decoration|accent|caret|fill|stroke|from|to|via)-(${COLOR_FAMILIES.join('|')})-(\\d{2,3})(?:/\\d+)?`,
  'g',
)

/**
 * Recursively find all .tsx and .ts files in a directory
 */
async function findSourceFiles(dir: string, extensions = ['.tsx', '.ts']): Promise<string[]> {
  const files: string[] = []

  async function walk(currentDir: string) {
    const entries = await readdir(currentDir, { withFileTypes: true })

    for (const entry of entries) {
      const fullPath = join(currentDir, entry.name)

      if (entry.isDirectory()) {
        // Skip node_modules, dist, build directories
        if (!['node_modules', 'dist', 'build', '.git'].includes(entry.name)) {
          await walk(fullPath)
        }
      }
      else if (entry.isFile()) {
        if (extensions.some(ext => entry.name.endsWith(ext))) {
          files.push(fullPath)
        }
      }
    }
  }

  await walk(dir)
  return files
}

/**
 * Extract color classes from file content
 */
function extractColorClasses(content: string): Array<{ color: string, shade: string }> {
  const matches = content.matchAll(COLOR_CLASS_REGEX)
  const colors: Array<{ color: string, shade: string }> = []

  for (const match of matches) {
    const [, color, shade] = match
    if (color && shade) {
      colors.push({ color, shade })
    }
  }

  return colors
}

/**
 * Analyze color usage across files
 */
async function analyzeColors(files: string[], baseDir: string): Promise<ColorReport> {
  const report: ColorReport = {
    totalClasses: 0,
    colorFamilies: new Map(),
    shadeUsage: [],
    deprecatedUsage: [],
    fileBreakdown: new Map(),
  }

  const shadeMap = new Map<string, ColorUsage>()

  for (const file of files) {
    const content = await readFile(file, 'utf-8')
    const colors = extractColorClasses(content)
    const relativePath = relative(baseDir, file)

    if (!report.fileBreakdown.has(relativePath)) {
      report.fileBreakdown.set(relativePath, new Map())
    }

    const fileColors = report.fileBreakdown.get(relativePath)!

    for (const { color, shade } of colors) {
      report.totalClasses++

      // Update color family count
      const familyCount = report.colorFamilies.get(color) || 0
      report.colorFamilies.set(color, familyCount + 1)

      // Update shade usage
      const shadeKey = `${color}-${shade}`
      if (!shadeMap.has(shadeKey)) {
        shadeMap.set(shadeKey, {
          color,
          shade,
          count: 0,
          files: new Map(),
        })
      }

      const usage = shadeMap.get(shadeKey)!
      usage.count++

      const fileCount = usage.files.get(relativePath) || 0
      usage.files.set(relativePath, fileCount + 1)

      // Update file breakdown
      const fileShadeCount = fileColors.get(shadeKey) || 0
      fileColors.set(shadeKey, fileShadeCount + 1)

      // Track deprecated emerald usage (yellow replaced emerald for user actions)
      if (color === 'emerald') {
        if (!report.deprecatedUsage.find(u => u.color === color && u.shade === shade)) {
          report.deprecatedUsage.push(usage)
        }
      }
    }
  }

  // Convert shade map to array and sort by count
  report.shadeUsage = Array.from(shadeMap.values()).sort((a, b) => b.count - a.count)

  return report
}

/**
 * Format report as human-readable text
 */
function formatReport(report: ColorReport, verbose = false): string {
  const lines: string[] = []

  lines.push('═══════════════════════════════════════════════════════')
  lines.push('  COLOR USAGE ANALYSIS REPORT')
  lines.push('═══════════════════════════════════════════════════════')
  lines.push('')

  // Summary
  lines.push('📊 SUMMARY')
  lines.push(`   Total Color Classes: ${report.totalClasses}`)
  lines.push(`   Unique Shades: ${report.shadeUsage.length}`)
  lines.push(`   Files Analyzed: ${report.fileBreakdown.size}`)
  lines.push('')

  // Color families
  lines.push('🎨 COLOR FAMILIES')
  const sortedFamilies = Array.from(report.colorFamilies.entries()).sort((a, b) => b[1] - a[1])
  for (const [color, count] of sortedFamilies) {
    const percentage = ((count / report.totalClasses) * 100).toFixed(1)
    const bar = '█'.repeat(Math.floor(count / 10))
    lines.push(`   ${color.padEnd(10)} ${count.toString().padStart(4)} (${percentage.padStart(5)}%) ${bar}`)
  }
  lines.push('')

  // Deprecated usage
  if (report.deprecatedUsage.length > 0) {
    lines.push('⚠️  DEPRECATED EMERALD USAGE (replaced by yellow for user actions)')
    for (const usage of report.deprecatedUsage) {
      lines.push(`   ${usage.color}-${usage.shade}: ${usage.count} occurrences`)
      if (verbose) {
        for (const [file, count] of usage.files.entries()) {
          lines.push(`      - ${file} (${count}x)`)
        }
      }
    }
    lines.push('')
  }
  else {
    lines.push('✅ NO DEPRECATED EMERALD USAGE')
    lines.push('')
  }

  // Top shades
  lines.push('🔝 TOP 20 COLOR SHADES')
  const topShades = report.shadeUsage.slice(0, 20)
  for (const usage of topShades) {
    const bar = '▓'.repeat(Math.floor(usage.count / 5))
    lines.push(`   ${`${usage.color}-${usage.shade}`.padEnd(15)} ${usage.count.toString().padStart(3)}x ${bar}`)
  }
  lines.push('')

  // File breakdown (verbose only)
  if (verbose) {
    lines.push('📁 FILE BREAKDOWN')
    const sortedFiles = Array.from(report.fileBreakdown.entries()).sort((a, b) => {
      const aTotal = Array.from(a[1].values()).reduce((sum, count) => sum + count, 0)
      const bTotal = Array.from(b[1].values()).reduce((sum, count) => sum + count, 0)
      return bTotal - aTotal
    })

    for (const [file, colors] of sortedFiles) {
      const totalInFile = Array.from(colors.values()).reduce((sum, count) => sum + count, 0)
      lines.push(`   ${file} (${totalInFile} classes)`)

      const sortedColors = Array.from(colors.entries()).sort((a, b) => b[1] - a[1])
      for (const [shade, count] of sortedColors.slice(0, 10)) {
        lines.push(`      ${shade.padEnd(15)} ${count}x`)
      }
      lines.push('')
    }
  }

  lines.push('═══════════════════════════════════════════════════════')

  return lines.join('\n')
}

/**
 * Format report as JSON
 */
function formatJSON(report: ColorReport): string {
  return JSON.stringify(
    {
      summary: {
        totalClasses: report.totalClasses,
        uniqueShades: report.shadeUsage.length,
        filesAnalyzed: report.fileBreakdown.size,
      },
      colorFamilies: Object.fromEntries(report.colorFamilies),
      deprecatedUsage: report.deprecatedUsage.map(u => ({
        shade: `${u.color}-${u.shade}`,
        count: u.count,
        files: Object.fromEntries(u.files),
      })),
      topShades: report.shadeUsage.slice(0, 50).map(u => ({
        shade: `${u.color}-${u.shade}`,
        count: u.count,
      })),
      fileBreakdown: Object.fromEntries(
        Array.from(report.fileBreakdown.entries()).map(([file, colors]) => [
          file,
          Object.fromEntries(colors),
        ]),
      ),
    },
    null,
    2,
  )
}

/**
 * Main execution
 */
async function main() {
  const args = process.argv.slice(2)
  const verbose = args.includes('--verbose') || args.includes('-v')
  const jsonFormat = args.includes('--json')

  const projectRoot = join(import.meta.dir, '..')
  const webDir = join(projectRoot, 'src', 'web')

  console.error('🔍 Scanning for source files...')
  const files = await findSourceFiles(webDir)
  console.error(`   Found ${files.length} files\n`)

  console.error('📊 Analyzing color usage...')
  const report = await analyzeColors(files, projectRoot)
  console.error('   Analysis complete!\n')

  if (jsonFormat) {
    console.log(formatJSON(report))
  }
  else {
    console.log(formatReport(report, verbose))
  }

  // Exit with error code if deprecated colors found
  if (report.deprecatedUsage.length > 0) {
    console.error('\n⚠️  Warning: Deprecated emerald colors detected! (Use yellow for user actions instead)')
    process.exit(1)
  }
}

main().catch((error) => {
  console.error('Error:', error)
  process.exit(1)
})
