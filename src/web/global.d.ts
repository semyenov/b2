/**
 * Global type declarations for Vite-injected values
 */

import type { WebConfig } from '@shared/config/web/schema'

declare global {
  /**
   * Web configuration injected by Vite at build time
   * Loaded from web.config.ts using c12
   */
  const __WEB_CONFIG__: WebConfig

  /**
   * Application version from package.json
   */
  const __APP_VERSION__: string

  /**
   * API base URL (for convenience)
   */
  const __API_BASE_URL__: string

  /**
   * WebSocket base URL (for convenience)
   */
  const __WS_BASE_URL__: string
}

export {}
