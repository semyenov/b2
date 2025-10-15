#!/usr/bin/env bun

/**
 * Coverage threshold checker
 * Validates test coverage against defined thresholds
 * Runs `bun test --coverage` and parses the output
 */

import { $ } from 'bun'

// Define coverage thresholds
const thresholds = {
  functions: 78,
  lines: 80,
}

async function checkCoverage() {
  console.log('🧪 Running tests with coverage...\n')

  try {
    // Run bun test with coverage
    const result = await $`bun test --coverage`.nothrow().quiet()
    const output = result.stderr.toString() + result.stdout.toString()

    // Parse coverage from output
    // Format: "All files                        |   78.81 |   82.34 |"
    const allFilesLine = output.split('\n').find(line => line.includes('All files'))

    if (!allFilesLine) {
      console.error('❌ Could not parse coverage output')
      process.exit(1)
    }

    // Extract percentages
    const parts = allFilesLine.split('|').map(p => p.trim())
    const functionsPercent = Number.parseFloat(parts[1] || '0')
    const linesPercent = Number.parseFloat(parts[2] || '0')

    console.log('\n📊 Coverage Report:')
    console.log('===================\n')

    let failed = false

    // Check functions coverage
    const funcIcon = functionsPercent >= thresholds.functions ? '✅' : '❌'
    const funcStatus = functionsPercent >= thresholds.functions ? 'PASS' : 'FAIL'
    console.log(
      `${funcIcon} functions    ${functionsPercent.toFixed(2).padStart(6)}% (threshold: ${thresholds.functions}%) - ${funcStatus}`,
    )
    if (functionsPercent < thresholds.functions) {
      failed = true
    }

    // Check lines coverage
    const lineIcon = linesPercent >= thresholds.lines ? '✅' : '❌'
    const lineStatus = linesPercent >= thresholds.lines ? 'PASS' : 'FAIL'
    console.log(
      `${lineIcon} lines        ${linesPercent.toFixed(2).padStart(6)}% (threshold: ${thresholds.lines}%) - ${lineStatus}`,
    )
    if (linesPercent < thresholds.lines) {
      failed = true
    }

    console.log('\n')

    if (failed) {
      console.error('❌ Coverage thresholds not met!\n')
      process.exit(1)
    }

    console.log('✅ All coverage thresholds met!\n')
    console.log('📄 Detailed coverage report: ./coverage/lcov.info\n')
    process.exit(0)
  }
  catch (error) {
    console.error('❌ Error running coverage:', error)
    process.exit(1)
  }
}

checkCoverage()
