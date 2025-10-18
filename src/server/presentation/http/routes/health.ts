import { Elysia } from 'elysia'

/**
 * Health check routes
 */
export const healthRoutes = new Elysia({ name: 'health', tags: ['health'] })
  .head('/health', () => new Response(null, { status: 200 }), {
    detail: {
      summary: 'Health check (HEAD)',
      description: 'Returns the health status of the API server for HEAD requests.',
      tags: ['health'],
    },
  })
  .get('/health', () => ({ status: 'ok' }), {
    detail: {
      summary: 'Health check',
      description: 'Returns the health status of the API server.',
      tags: ['health'],
    },
  })
