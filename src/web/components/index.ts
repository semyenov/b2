/**
 * Component exports - Organized by domain
 *
 * Main entry point for all components
 * Exports are organized into:
 * - ui: Generic reusable UI primitives
 * - game: Game-specific components
 * - utilities: ErrorBoundary and other utilities
 *
 * NOTE: Screens and forms are NOT exported here to enable code splitting.
 * They are lazy-loaded directly in App.tsx for optimal bundle size.
 */

// Utilities
export { ErrorBoundary, withErrorBoundary } from './ErrorBoundary'

// Game Components (used within GameScreen, not lazy-loaded)
export * from './game'

// UI Primitives (shared across all screens, must be in main bundle)
export * from './ui'

// ❌ Screens and Forms are NOT exported here - they are lazy-loaded in App.tsx
// This prevents them from being bundled into the main chunk
// export * from './forms'    // Commented out for code splitting
// export * from './screens'  // Commented out for code splitting
