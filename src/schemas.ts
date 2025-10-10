import { Type } from "@sinclair/typebox";

export const PositionSchema = Type.Object({
  row: Type.Integer({ minimum: 0 }),
  col: Type.Integer({ minimum: 0 })
});

export const CreateGameBodySchema = Type.Object({
  size: Type.Integer({ minimum: 3 }),
  baseWord: Type.String({ minLength: 1 }),
  players: Type.Optional(Type.Array(Type.String({ minLength: 1 }), { minItems: 1 }))
});

export const GameIdParamsSchema = Type.Object({
  id: Type.String({ minLength: 1 })
});

export const MoveBodySchema = Type.Object({
  playerId: Type.String({ minLength: 1 }),
  position: PositionSchema,
  letter: Type.String({ minLength: 1, maxLength: 1 }),
  word: Type.String({ minLength: 1 })
});

export const FindPlacementsQuerySchema = Type.Object({
  word: Type.String({ minLength: 1 })
});

export const PlacementSchema = Type.Object({
  position: PositionSchema,
  letter: Type.String({ minLength: 1, maxLength: 1 })
});

export const PlacementsResponseSchema = Type.Array(PlacementSchema);

export const DictionaryStatsSchema = Type.Object({
  loaded: Type.Boolean(),
  source: Type.Union([Type.Literal("file"), Type.Literal("builtin")]),
  size: Type.Optional(Type.Integer({ minimum: 0 }))
});

export const SuggestQuerySchema = Type.Object({
  limit: Type.Optional(Type.Integer({ minimum: 1, maximum: 200 }))
});

export const SuggestionSchema = Type.Object({
  position: PositionSchema,
  letter: Type.String({ minLength: 1, maxLength: 1 }),
  word: Type.String({ minLength: 1 }),
  score: Type.Number()
});

export const SuggestResponseSchema = Type.Array(SuggestionSchema);

export const GameStateSchema = Type.Object({
  id: Type.String(),
  size: Type.Integer(),
  board: Type.Array(Type.Array(Type.Union([Type.String(), Type.Null()]))),
  players: Type.Array(Type.String()),
  currentPlayerIndex: Type.Integer(),
  moves: Type.Array(
    Type.Object({
      playerId: Type.String(),
      position: PositionSchema,
      letter: Type.String(),
      word: Type.String(),
      appliedAt: Type.Integer()
    })
  ),
  createdAt: Type.Integer(),
  scores: Type.Record(Type.String(), Type.Integer()),
  usedWords: Type.Array(Type.String())
});

export const ErrorSchema = Type.Object({
  error: Type.String()
});


