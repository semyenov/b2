# Balda Game - Frontend Architecture Diagram

## System Overview

```
┌────────────────────────────────────────────────────────────────────┐
│                         USER INTERFACE                              │
│                     (Browser / Web Client)                          │
└────────────────────────┬───────────────────────────────────────────┘
                         │
                         │ HTTP / WebSocket
                         │
┌────────────────────────▼───────────────────────────────────────────┐
│                    WEB FRONTEND (React/Vite)                        │
│                                                                      │
│  ┌──────────────────────────────────────────────────────────────┐ │
│  │            CONFIGURATION LAYER (src/web/config/)             │ │
│  │                                                              │ │
│  │  env.ts                                                      │ │
│  │  └─ Type-safe environment configuration                     │ │
│  │     • VITE_API_URL                                           │ │
│  │     • mode (development/production)                          │ │
│  └──────────────────────────────────────────────────────────────┘ │
│                         ▲                                            │
│                         │ uses config                                │
│  ┌──────────────────────┴──────────────────────────────────────┐ │
│  │            API LAYER (src/web/lib/client.ts)                 │ │
│  │                                                              │ │
│  │  ApiClient                                                   │ │
│  │  ├─ HTTP Methods                                             │ │
│  │  │  • getGames()                                             │ │
│  │  │  • createGame()                                           │ │
│  │  │  • makeMove()                                             │ │
│  │  │  • getSuggestions()                                       │ │
│  │  │  • updatePlayerName()                                     │ │
│  │  └─ WebSocket                                                │ │
│  │     • connectWebSocket(gameId, onMessage, onClose)           │ │
│  │     • Real-time game updates                                 │ │
│  └──────────────────────────────────────────────────────────────┘ │
│                         ▲                                            │
│                         │ uses ApiClient                             │
│  ┌──────────────────────┴──────────────────────────────────────┐ │
│  │         BUSINESS LOGIC LAYER (src/web/utils/)                │ │
│  │                    Pure Functions                            │ │
│  │                                                              │ │
│  │  Game Logic                                                  │ │
│  │  ├─ gameHelpers.ts    → getBaseWord, getGameStatus          │ │
│  │  ├─ boardValidation.ts → canClickCell, adjacency rules      │ │
│  │  ├─ moveValidation.ts  → formWordFromPath, canSubmitMove    │ │
│  │  └─ gamePathFinder.ts  → findWordPath (DFS)                 │ │
│  │                                                              │ │
│  │  Utilities                                                   │ │
│  │  ├─ logger.ts         → Production error logging            │ │
│  │  ├─ positionUtils.ts  → Position helpers                    │ │
│  │  ├─ wordUtils.ts      → Word manipulation                   │ │
│  │  ├─ wordScore.ts      → Score calculation                   │ │
│  │  ├─ russianPlural.ts  → Plural forms                        │ │
│  │  ├─ classNames.ts     → CSS utilities (cn)                  │ │
│  │  └─ ...more utilities                                       │ │
│  └──────────────────────────────────────────────────────────────┘ │
│                         ▲                                            │
│                         │ uses utilities                             │
│  ┌──────────────────────┴──────────────────────────────────────┐ │
│  │         STATE LAYER (src/web/hooks/)                         │ │
│  │              Custom React Hooks                              │ │
│  │                                                              │ │
│  │  Core Game State                                             │ │
│  │  ├─ useGameClient()         [332 LOC]                       │ │
│  │  │  • screens, games, currentGame, playerName               │ │
│  │  │  • loading, error, aiThinking, aiError                   │ │
│  │  │  • loadGames, createGame, joinGame, makeMove             │ │
│  │  │  • WebSocket management                                  │ │
│  │  │  • AI player automation (embedded)                       │ │
│  │  │                                                           │ │
│  │  ├─ useGameControls()       [79 LOC]                        │ │
│  │  │  • showSuggestions, toggleSuggestions                    │ │
│  │  │  • makeMove wrapper, handleExitToMenu                    │ │
│  │  │                                                           │ │
│  │  ├─ useGameInteraction()    [136 LOC]                       │ │
│  │  │  • selectedCell, selectedLetter, wordPath                │ │
│  │  │  • handleCellClick, handleLetterSelect                   │ │
│  │  │  • handleSuggestionSelect                                │ │
│  │  │                                                           │ │
│  │  └─ useSuggestions()        [61 LOC]                        │ │
│  │     • suggestions, loadingSuggestions                       │ │
│  │     • loadSuggestions, clearSuggestions                     │ │
│  │                                                              │ │
│  │  Supporting Hooks                                            │ │
│  │  ├─ usePlayerStats()        → Score calculations (memoized) │ │
│  │  ├─ useLiveRegion()         → Accessibility announcements   │ │
│  │  ├─ useCreateGameForm()     → Form validation               │ │
│  │  ├─ useAnimatedPanel()      → Animations                    │ │
│  │  ├─ useClickOutside()       → Click detection               │ │
│  │  ├─ useFullscreen()         → Fullscreen API                │ │
│  │  ├─ useHover()              → Hover state                   │ │
│  │  ├─ useKeyboardNavigation() → Keyboard controls             │ │
│  │  └─ useGameActions()        → Additional actions            │ │
│  └──────────────────────────────────────────────────────────────┘ │
│                         ▲                                            │
│                         │ uses hooks                                 │
│  ┌──────────────────────┴──────────────────────────────────────┐ │
│  │       PRESENTATION LAYER (src/web/components/)               │ │
│  │                 React Components                             │ │
│  │                                                              │ │
│  │  App.tsx [146 LOC]                                           │ │
│  │  └─ Main orchestration layer                                │ │
│  │     ├─ Imports all hooks                                    │ │
│  │     ├─ Manages screen routing                               │ │
│  │     └─ Renders current screen                               │ │
│  │                                                              │ │
│  │  Screens                                                     │ │
│  │  ├─ MenuScreen        → Game type selection                 │ │
│  │  ├─ GameScreen        → Main gameplay                       │ │
│  │  └─ ListScreen        → Game browser                        │ │
│  │                                                              │ │
│  │  Game Components                                             │ │
│  │  ├─ Board             → Game board display                  │ │
│  │  ├─ GamePanel         → Main game UI + alphabet grid        │ │
│  │  └─ PlayerPanel       → Score + stats + word history        │ │
│  │                                                              │ │
│  │  Forms                                                       │ │
│  │  └─ CreateGame        → Game creation form                  │ │
│  │                                                              │ │
│  │  UI Components                                               │ │
│  │  ├─ Banner            → Toast notifications                 │ │
│  │  ├─ MenuButton        → Reusable button                     │ │
│  │  └─ StatusMessage     → Step-by-step instructions           │ │
│  │                                                              │ │
│  │  Error Handling                                              │ │
│  │  └─ ErrorBoundary     → React error boundary                │ │
│  └──────────────────────────────────────────────────────────────┘ │
│                                                                      │
│  ┌──────────────────────────────────────────────────────────────┐ │
│  │         TYPE DEFINITIONS (src/web/types/)                    │ │
│  │                                                              │ │
│  │  ├─ api.ts       → API response types                       │ │
│  │  ├─ game.ts      → Game domain types (Board, Position)      │ │
│  │  ├─ hooks.ts     → Hook return types                        │ │
│  │  └─ ui.ts        → UI component types                       │ │
│  └──────────────────────────────────────────────────────────────┘ │
│                                                                      │
│  ┌──────────────────────────────────────────────────────────────┐ │
│  │         CONSTANTS (src/web/constants/)                       │ │
│  │                                                              │ │
│  │  ├─ game.ts          → Game configuration                   │ │
│  │  ├─ messages.ts      → User-facing messages (Russian)       │ │
│  │  ├─ statusConfig.ts  → Game status configs                  │ │
│  │  └─ suggestions.ts   → Suggestion configs                   │ │
│  └──────────────────────────────────────────────────────────────┘ │
└──────────────────────────────────────────────────────────────────────┘
                         │
                         │ HTTP / WebSocket
                         │
┌────────────────────────▼───────────────────────────────────────────┐
│                    BACKEND (Bun/Elysia)                             │
│                                                                      │
│  ├─ Game Engine (Balda logic)                                       │
│  ├─ AI Suggestions (Dictionary analysis)                            │
│  ├─ WebSocket Hub (Real-time broadcasting)                          │
│  ├─ Drizzle ORM (PostgreSQL)                                        │
│  └─ File Storage (unstorage)                                        │
└──────────────────────────────────────────────────────────────────────┘
```

---

## Data Flow Diagram

### 1. Initial Page Load
```
Browser
  │
  ├─> Load index.html
  │   └─> Load bundle.js (234 kB → 72 kB gzipped)
  │
  ├─> App.tsx renders
  │   ├─> useGameClient() initializes
  │   │   ├─> ApiClient created (useRef)
  │   │   └─> Check server health
  │   │
  │   └─> MenuScreen renders
  │       └─> Show menu buttons
  │
  └─> User sees menu (Ready)
```

### 2. Quick Start Flow
```
User clicks "Быстрая игра 5x5"
  │
  ├─> quickStart() called
  │   │
  │   ├─> GET /api/dictionary/random?length=5&count=1
  │   │   └─> Backend returns random 5-letter word
  │   │
  │   ├─> createGame() called
  │   │   ├─> POST /api/games
  │   │   │   Body: { size: 5, baseWord: "слово", players: [...] }
  │   │   └─> Backend creates game, returns GameState
  │   │
  │   └─> joinGame(gameId, playerName)
  │       ├─> setCurrentGame(game)
  │       ├─> setPlayerName(name)
  │       ├─> setScreen('play')
  │       │
  │       └─> useEffect detects screen='play'
  │           └─> WebSocket connection established
  │               └─> ws://localhost:3000/api/games/{gameId}/ws
  │
  └─> GameScreen renders (User sees game board)
```

### 3. Make Move Flow
```
User clicks empty cell (3, 2)
  │
  ├─> handleCellClick(3, 2) called
  │   └─> setSelectedCell({ row: 3, col: 2 })
  │
User clicks letter 'К' in alphabet grid
  │
  ├─> handleLetterSelect('К') called
  │   └─> setSelectedLetter('К')
  │
User clicks cells to build word: К-О-Т
  │
  ├─> handleCellClick(2, 1) → 'К' added to wordPath
  ├─> handleCellClick(2, 2) → 'О' added to wordPath
  └─> handleCellClick(2, 3) → 'Т' added to wordPath
  │
User clicks "Подтвердить ход"
  │
  ├─> makeMove() called
  │   │
  │   ├─> buildMoveBody() constructs:
  │   │   {
  │   │     playerId: "Player_123",
  │   │     position: { row: 3, col: 2 },
  │   │     letter: "К",
  │   │     word: "КОТ"
  │   │   }
  │   │
  │   ├─> POST /api/games/{gameId}/move
  │   │   └─> Backend validates move
  │   │       ├─ Check dictionary
  │   │       ├─ Check placement rules
  │   │       ├─ Check path exists
  │   │       ├─ Check uniqueness
  │   │       └─ Update game state
  │   │
  │   ├─> Backend returns updated GameState
  │   │
  │   ├─> setCurrentGame(result) [Immediate update]
  │   │
  │   ├─> Backend broadcasts via WebSocket (50ms delay)
  │   │   └─> { type: 'game_update', game: {...} }
  │   │
  │   └─> WebSocket handler receives update
  │       └─> setCurrentGame(updatedGame) [Eventual consistency]
  │
  ├─> clearAll() called
  │   ├─> setSelectedCell(undefined)
  │   ├─> setSelectedLetter('')
  │   └─> setWordPath([])
  │
  └─> UI updates
      ├─> Board shows new letter
      ├─> Score updates
      └─> Turn switches to opponent
```

### 4. AI Turn Flow
```
Human makes move
  │
  ├─> makeMove() succeeds
  │   └─> setCurrentGame(result)
  │       • currentPlayerIndex now points to AI
  │
useGameClient useEffect triggered
  │
  ├─> Detects AI turn
  │   • currentPlayer in aiPlayers array
  │   • moves.length !== lastProcessedMoveCount
  │
  ├─> makeAIMove() async function
  │   │
  │   ├─> setAIThinking(true)
  │   │   └─> Banner shows "AI думает..."
  │   │
  │   ├─> await setTimeout(1500ms) [UX thinking delay]
  │   │
  │   ├─> GET /api/games/{gameId}/suggest?limit=20
  │   │   └─> Backend returns suggestions sorted by score
  │   │
  │   ├─> Select best suggestion (suggestions[0])
  │   │
  │   ├─> Construct moveBody from suggestion
  │   │
  │   ├─> await makeMove(moveBody) [Same function as human]
  │   │   ├─> POST /api/games/{gameId}/move
  │   │   └─> setCurrentGame(result)
  │   │
  │   ├─> lastProcessedMoveCount.current = moves.length + 1
  │   │   [Prevent re-triggering]
  │   │
  │   └─> setAIThinking(false)
  │
  └─> UI updates
      ├─> Board shows AI's move
      ├─> Turn switches back to human
      └─> Human can make next move
```

### 5. Real-time Update Flow (Multiplayer)
```
Player 1 makes move on Browser A
  │
  ├─> POST /api/games/{gameId}/move
  │   └─> Backend updates game state
  │       └─> wsHub.broadcast(gameId, updatedGame)
  │
Backend broadcasts to all connected clients
  │
  ├─> Browser A (Player 1)
  │   └─> WebSocket message received
  │       └─> setCurrentGame(updatedGame) [Redundant, already updated]
  │
  └─> Browser B (Player 2)
      └─> WebSocket message received
          └─> setCurrentGame(updatedGame) [Real-time sync]
          │
          └─> GameScreen re-renders
              ├─> Board shows Player 1's move
              ├─> Scores update
              └─> "Ваш ход!" message appears
```

---

## State Management Flow

### Hook Dependency Graph
```
App.tsx
  │
  ├─> useGameClient() [Core State Hub]
  │   ├─ State: screen, gameId, currentGame, playerName
  │   ├─ State: loading, error, aiThinking, aiError
  │   ├─ Actions: loadGames, createGame, joinGame, makeMove
  │   ├─ Uses: ApiClient (useRef)
  │   ├─ Uses: WebSocket (useRef)
  │   └─ Embedded: AI player automation (useEffect)
  │
  ├─> useSuggestions({ apiClient, currentGame })
  │   ├─ State: suggestions, loadingSuggestions
  │   ├─ Actions: loadSuggestions, clearSuggestions
  │   └─ Depends on: gameId from currentGame
  │
  ├─> useGameInteraction({ currentGame, isMyTurn })
  │   ├─ State: selectedCell, selectedLetter, wordPath
  │   ├─ Actions: handleCellClick, handleLetterSelect
  │   ├─ Uses: boardValidation.ts utilities
  │   └─ Depends on: currentGame.board
  │
  ├─> useGameControls({
  │     makeApiMove, clearSuggestions, clearInteraction,
  │     setScreen, loadSuggestions
  │   })
  │   ├─ State: showSuggestions
  │   ├─ Actions: toggleSuggestions, makeMove (wrapper)
  │   └─ Orchestrates other hooks
  │
  └─> useLiveRegion({ currentGame, screen, isMyTurn })
      └─ Returns: Accessibility announcement string
```

### State Update Cascades

**Scenario: User makes move**
```
User clicks Submit
  │
  ├─> useGameControls.makeMove()
  │   ├─> useGameClient.makeMove()
  │   │   ├─> ApiClient.makeMove()
  │   │   │   └─> setCurrentGame(result) [1. State update]
  │   │   │
  │   │   └─> WebSocket receives broadcast
  │   │       └─> setCurrentGame(updatedGame) [2. Redundant update]
  │   │
  │   ├─> clearSuggestions()
  │   │   └─> setSuggestions([]) [3. State update]
  │   │
  │   ├─> clearInteraction()
  │   │   └─> setSelectedCell(undefined) [4. State update]
  │   │       setSelectedLetter('') [5. State update]
  │   │       setWordPath([]) [6. State update]
  │   │
  │   └─> setShowSuggestions(false) [7. State update]
  │
  └─> React re-renders
      ├─> GameScreen (receives new currentGame)
      ├─> Board (shows new letter)
      ├─> PlayerPanel (shows updated score)
      └─> StatusMessage (shows turn message)
```

**Total State Updates**: 7 updates → Batched by React 18

---

## Performance Characteristics

### Bundle Analysis
```
Total: 234.57 kB (raw) → 72.82 kB (gzipped)

Breakdown:
├─ CSS (Tailwind)      45.22 kB → 8.81 kB gzipped
├─ React + ReactDOM    ~130 kB → ~40 kB gzipped
├─ Components          ~30 kB  → ~10 kB gzipped
├─ Hooks               ~15 kB  → ~5 kB gzipped
├─ Utilities           ~10 kB  → ~4 kB gzipped
└─ Other               ~4 kB   → ~5 kB gzipped
```

### Critical Path
```
DNS Lookup → TCP Connect → TLS Handshake → Request → Response
   ~20ms        ~30ms          ~50ms         ~10ms     ~100ms
                                                         │
                                                         ├─> Parse HTML
                                                         │   ~5ms
                                                         │
                                                         ├─> Load JS bundle
                                                         │   ~200ms (72 kB @ 3G)
                                                         │
                                                         ├─> Execute JS
                                                         │   ~100ms
                                                         │
                                                         ├─> Initial render
                                                         │   ~50ms
                                                         │
                                                         └─> Interactive
                                                             [Total: ~565ms]
```

### Runtime Performance
```
Operation             | Time      | Optimized?
─────────────────────────────────────────────
Cell click            | <1ms      | ✅ useCallback
Letter select         | <1ms      | ✅ useCallback
Board render          | ~5ms      | ⚠️ No React.memo
Build word path       | ~2ms      | ✅ Pure function
Submit move           | ~50ms     | ✅ Optimistic update
Load suggestions      | ~100ms    | ✅ Cached in hook
AI turn               | ~1.6s     | ✅ Includes UX delay
WebSocket update      | ~50ms     | ✅ Debounced
Re-render on state    | ~10ms     | ✅ React 18 batching
```

### Memory Usage
```
Component         | State Size | Re-render Frequency
──────────────────────────────────────────────────────
useGameClient     | ~5 KB      | On move, WS update
useSuggestions    | ~2 KB      | On toggle
useGameInteraction| ~1 KB      | On cell/letter click
useGameControls   | <1 KB      | On toggle
GameScreen        | Renders    | On any state change
Board             | Renders    | On currentGame change (should memo)
PlayerPanel       | Renders    | On currentGame change (should memo)
```

---

## Error Handling Architecture

### Multi-Layer Error Handling
```
Layer 1: API Client (lib/client.ts)
  │
  ├─> fetch() throws
  │   └─> Caught by fetchJson()
  │       ├─> Parse error JSON
  │       ├─> Extract user-friendly message
  │       └─> throw new Error(message)
  │
  └─> WebSocket errors
      └─> Logged to console + onError callback

Layer 2: Hook Layer (useGameClient.ts)
  │
  ├─> apiCall() wrapper
  │   ├─> setLoading(true)
  │   ├─> try { await fn() }
  │   ├─> catch (err) {
  │   │     translateErrorMessage(err.message)
  │   │     setError(errorMessage)
  │   │   }
  │   └─> finally { setLoading(false) }
  │
  └─> WebSocket onClose
      └─> setError(ERROR_MESSAGES.CONNECTION_LOST)

Layer 3: Component Layer (App.tsx)
  │
  ├─> {error && <Banner variant="error" ... />}
  │
  └─> {aiError && <Banner variant="warning" ... />}

Layer 4: Global Error Boundary (ErrorBoundary.tsx)
  │
  ├─> componentDidCatch(error, errorInfo)
  │   └─> logger.error('React error', error)
  │
  └─> Render fallback UI
      └─> "Something went wrong" + Reload button
```

### Error Recovery Strategies
```
Error Type              | Recovery Strategy
───────────────────────────────────────────────────
Network error           | Retry with exponential backoff
WebSocket disconnect    | Auto-reconnect on next screen='play'
Invalid move            | Show error, keep state
Game not found          | Return to menu
Server error (500)      | Show error, suggest refresh
AI move failed          | Show warning, allow manual play
Parse error             | Log + show generic error
```

---

## Deployment Architecture

### Development
```
┌──────────────────┐         ┌──────────────────┐
│  Vite Dev Server │◄────────┤   Source Files   │
│  localhost:5173  │         │   src/web/       │
└────────┬─────────┘         └──────────────────┘
         │
         │ Proxy: /api → http://localhost:3000
         │
         ▼
┌──────────────────┐
│  Backend Server  │
│  localhost:3000  │
│  Bun/Elysia      │
└──────────────────┘
```

### Production
```
┌────────────────────────┐
│   CDN (Optional)       │
│   • Static assets      │
│   • bundle.js (72 kB)  │
│   • index.html         │
└───────────┬────────────┘
            │
            │ HTTPS
            │
┌───────────▼────────────┐       ┌──────────────────┐
│   Web Server           │       │  Backend Server  │
│   (nginx/caddy)        │◄──────┤  production.com  │
│   • Serve static files │ HTTPS │  • API           │
│   • Reverse proxy      │       │  • WebSocket     │
│   • SSL termination    │       │  • PostgreSQL    │
└────────────────────────┘       └──────────────────┘
            │
            │ WSS (WebSocket Secure)
            │
            ▼
┌────────────────────────┐
│   Browser Client       │
│   • React app          │
│   • WebSocket conn     │
│   • Real-time updates  │
└────────────────────────┘
```

---

## Security Considerations

### Frontend Security
```
1. Environment Variables
   ├─ VITE_API_URL validated on startup
   └─ No secrets in frontend (public bundle)

2. API Communication
   ├─ HTTPS only in production
   ├─ CORS configured on backend
   └─ No localStorage for sensitive data

3. WebSocket Security
   ├─ WSS (secure WebSocket) in production
   ├─ Game ID validation
   └─ No authentication (for this simple game)

4. Content Security Policy (Recommended)
   └─ Add CSP headers to prevent XSS

5. Input Validation
   ├─ Client-side validation in forms
   └─ Server-side validation in backend (primary)
```

---

## Monitoring & Observability

### Current Implementation
```
Logger (src/web/utils/logger.ts)
  │
  ├─> Development
  │   └─> console.log all levels (DEBUG, INFO, WARN, ERROR)
  │
  └─> Production
      ├─> console.warn/error only
      └─> sessionStorage error tracking (last 50 errors)
```

### Recommended Additions
```
1. Error Tracking Service
   ├─ Sentry.io
   │  └─> Automatic error capture
   │      Source maps for stack traces
   │
   └─ LogRocket
      └─> Session replay
          Performance monitoring

2. Analytics
   ├─ Google Analytics / Plausible
   │  └─> User behavior tracking
   │      Conversion funnels
   │
   └─ Custom Events
      ├─> Game created
      ├─> Move made
      ├─> Game finished
      └─> AI vs Human ratio

3. Performance Monitoring
   └─ Web Vitals
      ├─> LCP (Largest Contentful Paint)
      ├─> FID (First Input Delay)
      ├─> CLS (Cumulative Layout Shift)
      └─> Custom metrics (move latency)
```

---

## Testing Strategy (Recommended)

### Unit Tests
```
src/web/utils/__tests__/
  ├─ gameHelpers.test.ts
  │  └─> Test pure functions
  │      • getBaseWord()
  │      • getGameStatus()
  │      • formatTimeAgo()
  │
  ├─ boardValidation.test.ts
  │  └─> Test game rules
  │      • canClickCell()
  │      • isAdjacent()
  │
  └─ moveValidation.test.ts
     └─> Test move logic
         • formWordFromPath()
         • canSubmitMove()
```

### Integration Tests
```
src/web/hooks/__tests__/
  ├─ useGameClient.test.ts
  │  └─> Test state management
  │      • makeMove flow
  │      • WebSocket connection
  │      • Error handling
  │
  └─ useGameInteraction.test.ts
     └─> Test UI interactions
         • Cell selection
         • Word path building
```

### E2E Tests (Playwright/Cypress)
```
tests/e2e/
  ├─ quick-start.spec.ts
  │  └─> Test full game flow
  │      1. Click "Quick Start"
  │      2. Make move
  │      3. Verify board updates
  │
  └─ ai-game.spec.ts
     └─> Test AI gameplay
         1. Start game vs AI
         2. Make move
         3. Wait for AI move
         4. Verify AI moved
```

---

**Architecture Maintained By**: Development Team
**Last Updated**: 2025-10-16
**Version**: 1.0.50
