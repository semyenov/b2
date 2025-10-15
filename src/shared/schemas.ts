import { Type } from '@sinclair/typebox'

export const PositionSchema = Type.Object({
  row: Type.Integer({
    minimum: 0,
    error: 'Row must be a non-negative integer',
  }),
  col: Type.Integer({
    minimum: 0,
    error: 'Column must be a non-negative integer',
  }),
})

export const CreateGameBodySchema = Type.Object({
  size: Type.Integer({
    minimum: 3,
    error: 'Board size must be at least 3',
  }),
  baseWord: Type.String({
    minLength: 1,
    error: 'Base word is required and cannot be empty',
  }),
  players: Type.Optional(Type.Array(
    Type.String({
      minLength: 1,
      error: 'Player name cannot be empty',
    }),
    {
      minItems: 1,
      error: 'At least one player is required',
    },
  )),
  aiPlayers: Type.Optional(Type.Array(
    Type.String({
      minLength: 1,
      error: 'AI player name cannot be empty',
    }),
  )),
})

export const GameIdParamsSchema = Type.Object({
  id: Type.String({
    minLength: 1,
    error: 'Game ID is required',
  }),
})

export const MoveBodySchema = Type.Object({
  playerId: Type.String({
    minLength: 1,
    error: 'Player ID is required',
  }),
  position: PositionSchema,
  letter: Type.String({
    minLength: 1,
    maxLength: 1,
    error: 'Letter must be exactly one character',
  }),
  word: Type.String({
    minLength: 1,
    error: 'Word is required',
  }),
})

export const FindPlacementsQuerySchema = Type.Object({
  word: Type.String({
    minLength: 1,
    error: 'Word query parameter is required',
  }),
})

export const PlacementSchema = Type.Object({
  position: PositionSchema,
  letter: Type.String({ minLength: 1, maxLength: 1 }),
})

export const PlacementsResponseSchema = Type.Array(PlacementSchema)

export const DictionaryStatsSchema = Type.Object({
  loaded: Type.Boolean(),
  source: Type.Union([Type.Literal('file'), Type.Literal('builtin')]),
  size: Type.Optional(Type.Integer({ minimum: 0 })),
})

export const SuggestQuerySchema = Type.Object({
  limit: Type.Optional(Type.Union([
    Type.Integer({
      minimum: 1,
      maximum: 200,
    }),
    Type.String({
      pattern: '^[0-9]+$',
    }),
  ], {
    error: 'Limit must be between 1 and 200',
  })),
})

export const SuggestionSchema = Type.Object({
  position: PositionSchema,
  letter: Type.String({ minLength: 1, maxLength: 1 }),
  word: Type.String({ minLength: 1 }),
  score: Type.Number(),
})

export const SuggestResponseSchema = Type.Array(SuggestionSchema)

export const GameStateSchema = Type.Object({
  id: Type.String(),
  size: Type.Integer(),
  board: Type.Array(Type.Array(Type.Union([Type.String(), Type.Null()]))),
  players: Type.Array(Type.String()),
  aiPlayers: Type.Array(Type.String()),
  currentPlayerIndex: Type.Integer(),
  moves: Type.Array(
    Type.Object({
      playerId: Type.String(),
      position: PositionSchema,
      letter: Type.String(),
      word: Type.String(),
      appliedAt: Type.Integer(),
    }),
  ),
  createdAt: Type.Integer(),
  scores: Type.Record(Type.String(), Type.Integer()),
  usedWords: Type.Array(Type.String()),
})

export const ErrorSchema = Type.Object({
  error: Type.String(),
})

export const UpdatePlayerBodySchema = Type.Object({
  oldName: Type.String({
    minLength: 1,
    error: 'Old player name is required',
  }),
  newName: Type.String({
    minLength: 1,
    error: 'New player name is required',
  }),
})

export const RandomWordsQuerySchema = Type.Object({
  length: Type.Optional(Type.Union([
    Type.Integer({
      minimum: 3,
      maximum: 10,
    }),
    Type.String({
      pattern: '^[0-9]+$',
    }),
  ])),
  count: Type.Optional(Type.Union([
    Type.Integer({
      minimum: 1,
      maximum: 100,
    }),
    Type.String({
      pattern: '^[0-9]+$',
    }),
  ])),
})

export const RandomWordsResponseSchema = Type.Object({
  words: Type.Array(Type.String()),
})

// Auth schemas
export const RegisterBodySchema = Type.Object({
  email: Type.String({
    format: 'email',
    error: 'Invalid email format',
  }),
  username: Type.String({
    minLength: 3,
    maxLength: 20,
    pattern: '^[a-zA-Z0-9_-]+$',
    error: 'Username must be 3-20 characters and contain only letters, numbers, underscores, and hyphens',
  }),
  password: Type.String({
    minLength: 8,
    error: 'Password must be at least 8 characters',
  }),
})

export const LoginBodySchema = Type.Object({
  email: Type.String({
    format: 'email',
    error: 'Invalid email format',
  }),
  password: Type.String({
    minLength: 1,
    error: 'Password is required',
  }),
})

export const PublicUserSchema = Type.Object({
  id: Type.String(),
  email: Type.String({ format: 'email' }),
  username: Type.String(),
  createdAt: Type.Integer(),
})

export const AuthResponseSchema = Type.Object({
  user: PublicUserSchema,
  token: Type.String(),
  refreshToken: Type.String(),
})

export const RefreshTokenBodySchema = Type.Object({
  refreshToken: Type.String({
    minLength: 1,
    error: 'Refresh token is required',
  }),
})

export const RefreshTokenResponseSchema = Type.Object({
  token: Type.String(),
})
