import { DictionaryStatsSchema, RandomWordsQuerySchema, RandomWordsResponseSchema } from '@shared/schemas'
import { Elysia } from 'elysia'
import { getDictionary } from './dictionaryLoader'

/**
 * Dictionary routes plugin - handles dictionary-related endpoints
 */
export const dictionaryRoutes = new Elysia({ name: 'dictionary', prefix: '/dictionary', tags: ['dictionary'] })
  .head('/', () => new Response(null, { status: 200 }), {
    detail: {
      summary: 'Dictionary metadata HEAD check',
      description: 'HEAD request support for dictionary metadata endpoint.',
      tags: ['dictionary'],
    },
  })
  .get('/', async () => {
    const dictPath = process.env['DICT_PATH']
    if (!dictPath)
      return { loaded: true, source: 'builtin' as const }
    const { loadDictionaryFromFile } = await import('../../../domain/dictionary/dictionary')
    const dict = await loadDictionaryFromFile(dictPath)
    return { loaded: true, source: 'file' as const, size: dict.size() }
  }, {
    response: { 200: DictionaryStatsSchema },
    detail: {
      summary: 'Get dictionary metadata',
      description: 'Returns information about the loaded dictionary including source (file or builtin) and size.',
      tags: ['dictionary'],
    },
  })
  .get('/random', async ({ query }) => {
    const dict = await getDictionary()
    const length = query.length ? Number(query.length) : 5
    const count = query.count ? Number(query.count) : 1
    const words = dict.getRandomWords(length, count)
    return { words }
  }, {
    query: RandomWordsQuerySchema,
    response: { 200: RandomWordsResponseSchema },
    detail: {
      summary: 'Get random words from dictionary',
      description: 'Returns random words of specified length from the dictionary. Useful for generating base words for new games.',
      tags: ['dictionary'],
    },
  })
