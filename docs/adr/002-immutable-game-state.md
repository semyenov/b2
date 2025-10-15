# ADR-002: Immutable Game State

## Status

Accepted

## Context

We needed to decide how to manage game state updates in the backend. The game state is complex, containing:
- Board configuration (2D array of letters)
- Player information and scores
- Move history
- Current turn index
- Used words tracking

The key considerations were:
- **Correctness** - Ensure state updates don't cause race conditions
- **Debugging** - Make it easy to trace state changes
- **Undo/Replay** - Support potential future features (undo moves, replay games)
- **WebSocket broadcasting** - Efficiently send state to connected clients
- **Testability** - Make state transformations easy to test

Common approaches:
1. **Mutable state** - Modify state object in place
2. **Immutable state** - Create new state object on every update
3. **Hybrid** - Immutable at top level, mutable nested structures

## Decision

We will use **fully immutable game state** with functional updates.

All state transformations return new objects instead of modifying existing ones.

```typescript
// Example: Applying a move
function applyMove(
  game: GameState,
  move: MoveInput,
  dictionary: Dictionary
): Result<GameState> {
  // Validation first
  if (!isValidMove(game, move, dictionary)) {
    return { ok: false, message: 'Invalid move' }
  }

  // Create new state (immutable)
  const newGame: GameState = {
    ...game,
    board: updateBoard(game.board, move.position, move.letter),
    currentPlayerIndex: (game.currentPlayerIndex + 1) % game.players.length,
    scores: {
      ...game.scores,
      [move.playerId]: game.scores[move.playerId] + calculateScore(move.word),
    },
    moves: [...game.moves, { ...move, appliedAt: Date.now() }],
    usedWords: [...game.usedWords, move.word],
  }

  return { ok: true, game: newGame }
}
```

## Rationale

### Correctness

Immutability prevents bugs caused by unexpected state mutations:
- No side effects in helper functions
- State updates are explicit and traceable
- Concurrent operations (WebSocket broadcasts) see consistent snapshots
- Easier to reason about state flow

### Debugging

Immutable state makes debugging significantly easier:
- Old states remain accessible (no "time-travel" debugger needed)
- Can log state before/after transformations
- Can compare states to see what changed
- Move history is a natural audit log

### Testability

Pure functions with immutable inputs are trivial to test:

```typescript
test('applyMove should update scores correctly', () => {
  const game = createTestGame()
  const move = { playerId: 'Alice', word: 'БАЛДА', ... }

  const result = applyMove(game, move, dictionary)

  expect(result.ok).toBe(true)
  expect(result.game.scores.Alice).toBe(9)
  expect(game.scores.Alice).toBe(0) // Original unchanged
})
```

### Performance is Acceptable

Modern JavaScript engines optimize shallow object copies efficiently:
- Spread operator (`...`) is fast for shallow objects
- Board updates use array slicing, not full deep clones
- WebSocket broadcasts serialize state anyway (no benefit to mutation)

Benchmarks show minimal overhead:
- State update: ~0.2ms (immutable) vs ~0.1ms (mutable)
- This difference is negligible compared to path-finding (5-15ms)

## Consequences

### Positive

- **No race conditions** - Each operation works on independent state
- **Simple undo** - Keep history of previous states
- **Easy debugging** - Compare states, log transformations
- **Testable** - Pure functions are trivial to test
- **Predictable** - State changes are explicit, not hidden
- **WebSocket-friendly** - Broadcasts always send consistent snapshots

### Negative

- **Memory overhead** - Each update creates new objects
- **Performance cost** - Shallow copying takes time (though minimal)
- **Learning curve** - Team must avoid mutation habits
- **Verbose updates** - Spread operators can be repetitive for nested updates

### Mitigation Strategies

**Memory management:**
- Old game states are garbage collected after WebSocket broadcast
- Only store minimal move history (not full state history)
- PostgreSQL migration will store only current state

**Deep update complexity:**
- Use helper functions for complex updates (e.g., `updateBoard()`)
- Consider `immer` library if nested updates become too verbose

## Alternatives Considered

### Alternative 1: Mutable State

**Description**: Modify game state object in place

```typescript
function applyMove(game: GameState, move: MoveInput) {
  game.board[move.position.row][move.position.col] = move.letter
  game.scores[move.playerId] += calculateScore(move.word)
  game.currentPlayerIndex = (game.currentPlayerIndex + 1) % game.players.length
  game.moves.push(move)
  return game
}
```

**Pros:**
- Slightly better performance
- Less memory allocation
- Simpler syntax for updates

**Cons:**
- Risk of unintended side effects
- Harder to debug (state changes not traceable)
- Difficult to implement undo/replay
- Race conditions with concurrent access
- Testing requires state reset between tests

**Why not chosen:**
The debugging and correctness benefits of immutability outweigh the minimal performance gain. Our game is not performance-critical enough to justify the added complexity.

### Alternative 2: Immer Library

**Description**: Use Immer for "mutable" syntax with immutable results

```typescript
import produce from 'immer'

function applyMove(game: GameState, move: MoveInput) {
  return produce(game, draft => {
    draft.board[move.position.row][move.position.col] = move.letter
    draft.scores[move.playerId] += calculateScore(move.word)
    draft.currentPlayerIndex = (draft.currentPlayerIndex + 1) % game.players.length
    draft.moves.push(move)
  })
}
```

**Pros:**
- Simpler syntax for deep updates
- Still produces immutable results
- Popular library (well-maintained)

**Cons:**
- External dependency
- Adds bundle size (~6KB gzipped)
- Learning curve for new concept (draft state)
- Overkill for our relatively shallow state structure

**Why not chosen:**
Our state updates are shallow enough that spread operators are sufficient. We can revisit this if nested updates become too verbose.

## References

- [Immutability in React and Redux](https://redux.js.org/usage/structuring-reducers/immutable-update-patterns)
- [You Might Not Need Immer](https://immerjs.github.io/immer/performance/#you-might-not-need-immer)
- [The Case for Immutability](https://medium.com/@kentcdodds/the-state-reducer-pattern-with-react-hooks-b48c0ef3fb9c)

## Notes

- **Date**: 2025-10-15
- **Author**: semyenov
- **Related**: ADR-004 (TypeBox validation enforces immutable patterns)
