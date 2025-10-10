import { Elysia } from "elysia";
import { createGame, applyMove, findPlacementsForWord } from "./engine/balda";
import { suggestWords } from "./engine/suggest";
import { store } from "./store";
import {
  CreateGameBodySchema,
  GameIdParamsSchema,
  MoveBodySchema,
  GameStateSchema,
  ErrorSchema,
  FindPlacementsQuerySchema,
  PlacementsResponseSchema,
  DictionaryStatsSchema,
  SuggestQuerySchema,
  SuggestResponseSchema
} from "./schemas";
import type { SizedDictionary } from "./dictionary";

let dictionaryPromise: Promise<SizedDictionary> | null = null;
async function getDictionary(): Promise<SizedDictionary> {
  if (!dictionaryPromise) {
    const dictPath = process.env.DICT_PATH;
    if (dictPath) {
      const { loadDictionaryFromFile } = await import("./dictionary");
      dictionaryPromise = loadDictionaryFromFile(dictPath);
    } else {
      const { AllowAllSizedDictionary } = await import("./dictionary");
      dictionaryPromise = Promise.resolve(new AllowAllSizedDictionary());
    }
  }
  return dictionaryPromise;
}

export function registerRoutes(app: Elysia): Elysia {
  return app
    .get("/health", () => ({ status: "ok" }))
    .get("/games", () => store.getAll())
    .get(
      "/dictionary",
      async () => {
        const dictPath = process.env.DICT_PATH;
        if (!dictPath) return { loaded: true, source: "builtin" as const };
        const { loadDictionaryFromFile } = await import("./dictionary");
        const dict = await loadDictionaryFromFile(dictPath);
        return { loaded: true, source: "file" as const, size: dict.size() };
      },
      { response: { 200: DictionaryStatsSchema } }
    )
    .get(
      "/games/:id/suggest",
      async ({ params, query, set }) => {
        const game = store.get(params.id);
        if (!game) {
          set.status = 404;
          return { error: "Not Found" };
        }
        const dict = await getDictionary();
        const q = query as unknown as { limit?: string | number };
        const limit = Number(q.limit ?? 20);
        return suggestWords(game.board, dict, { limit });
      },
      { query: SuggestQuerySchema, response: { 200: SuggestResponseSchema, 404: ErrorSchema } }
    )
    .post(
      "/games",
      async ({ body }) => {
        const id = crypto.randomUUID();
        const game = createGame(id, body.size, body.baseWord, body.players);
        store.set(game);
        return game;
      },
      {
        body: CreateGameBodySchema,
        response: { 200: GameStateSchema }
      }
    )
    .get(
      "/games/:id/placements",
      ({ params, query, set }) => {
        const game = store.get(params.id);
        if (!game) {
          set.status = 404;
          return { error: "Not Found" };
        }
        const q = query as unknown as { word?: string };
        const word = String(q.word || "");
        if (!word) {
          set.status = 400;
          return { error: "Missing word" };
        }
        return findPlacementsForWord(game.board, word);
      },
      { query: FindPlacementsQuerySchema, response: { 200: PlacementsResponseSchema, 400: ErrorSchema, 404: ErrorSchema } }
    )
    .get(
      "/games/:id",
      ({ params, set }) => {
        const game = store.get(params.id);
        if (!game) {
          set.status = 404;
          return { error: "Not Found" };
        }
        return game;
      },
      { params: GameIdParamsSchema, response: { 200: GameStateSchema, 404: ErrorSchema } }
    )
    .post(
      "/games/:id/move",
      async ({ params, body, set }) => {
        const game = store.get(params.id);
        if (!game) {
          set.status = 404;
          return { error: "Not Found" };
        }
        const dictionary = await getDictionary();
        const res = applyMove(game, body, dictionary);
        if (!res.ok) {
          set.status = 400;
          return { error: res.message };
        }
        return res.game;
      },
      {
        params: GameIdParamsSchema,
        body: MoveBodySchema,
        response: { 200: GameStateSchema, 400: ErrorSchema, 404: ErrorSchema }
      }
    );
}


