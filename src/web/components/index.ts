/**
 * Component exports - Organized by domain
 *
 * Main entry point for all components
 * Exports are organized into:
 * - ui: Generic reusable UI primitives
 * - game: Game-specific components
 * - forms: Form and list screens
 * - screens: Top-level screen layouts
 * - utilities: ErrorBoundary and other utilities
 */

// UI Primitives
export * from './ui'

// Game Components
export * from './game'

// Form Components
export * from './forms'

// Screen Layouts
export * from './screens'

// Utilities
export { ErrorBoundary, withErrorBoundary } from './ErrorBoundary'
