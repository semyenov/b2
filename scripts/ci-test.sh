#!/bin/bash
# CI Test Script
# Runs all quality checks in sequence

set -e  # Exit on error

echo "🔍 Running CI checks..."
echo ""

echo "📦 Installing dependencies..."
bun install --frozen-lockfile
echo "✅ Dependencies installed"
echo ""

echo "🎨 Running linter..."
bun run lint
echo "✅ Linting passed"
echo ""

echo "🔍 Running type checker..."
bun run check
echo "✅ Type checking passed"
echo ""

echo "🧪 Running tests..."
bun test
echo "✅ Tests passed"
echo ""

echo "📊 Checking coverage..."
bun run coverage:check
echo "✅ Coverage thresholds met"
echo ""

echo "🏗️  Building web frontend..."
bun run build:web
echo "✅ Build successful"
echo ""

echo "✨ All CI checks passed!"
