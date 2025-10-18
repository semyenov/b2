/**
 * Global type declarations for Vite-injected values
 */

import type { WebConfig } from '@web/config/schema'

declare global {
  /**
   * Web configuration injected by Vite at build time
   * Loaded from web.config.ts using c12
   */
  const __WEB_CONFIG__: WebConfig
}

export {}
