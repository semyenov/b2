import type { Elysia } from 'elysia'
import { dictionaryRoutes } from './dictionary'
import { gamesRoutes } from './games'
import { healthRoutes } from './health'

/**
 * Register all HTTP routes
 * Composes health, auth, dictionary, and games routes into the app
 */
// eslint-disable-next-line ts/ban-ts-comment
// @ts-ignore - Elysia type system complexities with JWT plugins cause type inference issues
export function registerRoutes(app: Elysia): Elysia {
  // Import and create auth routes (lazy loaded after config is initialized)
  const authPluginImport = import('../../../routes/auth')
    .then(m => m.createAuthPlugin())

  // eslint-disable-next-line ts/ban-ts-comment
  // @ts-ignore - Elysia type system complexities
  return app
    .use(healthRoutes)
    .use(async () => await authPluginImport)
    .use(dictionaryRoutes)
    .use(gamesRoutes)
}
