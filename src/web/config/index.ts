/**
 * Web Frontend Configuration Loader
 * Loads and validates web frontend configuration using c12
 *
 * This configuration is loaded during the Vite build process and injected
 * into the application at build time via Vite's define option.
 *
 * Configuration is loaded from multiple sources (in order of priority):
 * 1. Environment variables (highest priority)
 * 2. .env files
 * 3. web.config.ts file
 * 4. Default values (lowest priority)
 */

import type { WebConfig } from './schema'
import { loadConfig as c12LoadConfig } from 'c12'
import { consola } from 'consola'
import { defaultWebConfig } from './schema'

/**
 * Cached configuration instance
 */
let cachedConfig: WebConfig | null = null

/**
 * Load web frontend configuration from all sources
 * Merges environment variables, config files, and defaults
 *
 * Now loads from unified balda.config.ts and extracts the 'web' section
 */
export async function loadConfig(): Promise<WebConfig> {
  // Return cached config if already loaded
  if (cachedConfig) {
    return cachedConfig
  }

  try {
    // Load unified configuration using c12 (from balda.config.ts)
    const { config: unifiedConfig } = await c12LoadConfig<{ web?: Partial<WebConfig> }>({
      name: 'balda', // Load balda.config.ts
      defaults: { web: defaultWebConfig },
      dotenv: false, // Load from .env files
      packageJson: false, // Don't load from package.json
      envName: process.env['NODE_ENV'] || 'development',
    })

    // Extract web config from unified config
    cachedConfig = unifiedConfig?.web as WebConfig
    consola.success('Web frontend configuration loaded successfully')

    return cachedConfig
  }
  catch (error) {
    consola.error('Failed to load web frontend configuration:', error)
    throw error
  }
}

/**
 * Get configuration synchronously
 * Must call loadConfig() first during build process
 */
export function getConfig(): WebConfig {
  if (!cachedConfig) {
    throw new Error('Web configuration not loaded. Call loadWebConfig() during build process.')
  }
  return cachedConfig
}

export { type WebConfig } from './schema'
