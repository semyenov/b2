/**
 * Web Frontend Configuration
 * Centralized configuration loaded by c12 and injected by Vite at build time
 *
 * Configuration is loaded from multiple sources (priority order):
 * 1. Environment variables (VITE_* prefix)
 * 2. .env files
 * 3. web.config.ts file
 * 4. Default values
 *
 * The configuration is injected as global constants during the Vite build process,
 * making it available in the browser without additional runtime loading.
 */

import type { WebConfig } from '@web/config/schema'

/**
 * Complete web configuration
 * Loaded by c12 during build and injected by Vite
 */
export const config: WebConfig = __WEB_CONFIG__
