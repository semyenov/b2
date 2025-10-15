/**
 * Test API client helper
 * Provides utilities for testing API endpoints
 */

/**
 * Create a test client for Elysia app
 */
export function createTestClient(app: any) {
  return {
    async get(path: string) {
      const response = await app.handle(new Request(`http://localhost${path}`))
      return {
        status: response.status,
        data: response.ok ? await response.json() : null,
        error: !response.ok ? await response.text() : null,
      }
    },

    async post(path: string, body?: any) {
      const response = await app.handle(
        new Request(`http://localhost${path}`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: body ? JSON.stringify(body) : undefined,
        }),
      )
      return {
        status: response.status,
        data: response.ok ? await response.json() : null,
        error: !response.ok ? await response.text() : null,
      }
    },

    async patch(path: string, body?: any) {
      const response = await app.handle(
        new Request(`http://localhost${path}`, {
          method: 'PATCH',
          headers: {
            'Content-Type': 'application/json',
          },
          body: body ? JSON.stringify(body) : undefined,
        }),
      )
      return {
        status: response.status,
        data: response.ok ? await response.json() : null,
        error: !response.ok ? await response.text() : null,
      }
    },

    async delete(path: string) {
      const response = await app.handle(
        new Request(`http://localhost${path}`, {
          method: 'DELETE',
        }),
      )
      return {
        status: response.status,
        data: response.ok ? await response.json() : null,
        error: !response.ok ? await response.text() : null,
      }
    },
  }
}

/**
 * Wait for a condition to be true
 */
export async function waitFor(
  condition: () => boolean | Promise<boolean>,
  timeout = 1000,
  interval = 50,
): Promise<void> {
  const startTime = Date.now()
  while (Date.now() - startTime < timeout) {
    if (await condition()) {
      return
    }
    await new Promise(resolve => setTimeout(resolve, interval))
  }
  throw new Error('Timeout waiting for condition')
}
