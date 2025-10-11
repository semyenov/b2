# Web Frontend for Balda Game

## Overview

A modern React-based web frontend for the Balda word game, built with Vite and styled with Tailwind CSS. Features real-time gameplay with WebSocket support, responsive design, and an intuitive user interface.

## Features

- **Real-time Gameplay**: Live game updates via WebSocket connection
- **Responsive Design**: Works on desktop and mobile devices
- **Modern UI**: Styled with Tailwind CSS for a clean, dark theme
- **Game Management**: Create games, join existing games, or watch ongoing matches
- **Quick Start**: One-click 5x5 game creation with random words

## Tech Stack

- **React 19**: Modern React with hooks
- **Vite**: Fast build tool and dev server
- **TypeScript**: Type-safe development
- **Tailwind CSS**: Utility-first CSS framework
- **WebSocket**: Real-time game updates

## Getting Started

### Prerequisites

- Backend server must be running on port 3000
- Bun or Node.js installed

### Installation

```bash
# Install dependencies (if not already installed)
bun install
```

### Development

```bash
# Start backend server
bun run dev

# In a new terminal, start web frontend
bun run dev:web

# Or start both simultaneously
bun run dev:all
```

The web app will be available at http://localhost:5173

### Production Build

```bash
# Build the web frontend
bun run build:web

# Preview the production build
bun run preview:web
```

## Project Structure

```
src/web/
├── components/         # React presentation components
│   ├── Board.tsx           # Game board display
│   ├── BottomControls.tsx  # Move controls panel
│   ├── CreateGame.tsx      # Game creation form
│   ├── GameList.tsx        # Available games list
│   ├── GamePanel.tsx       # Main game interface
│   └── PlayerPanel.tsx     # Player info sidebar
├── hooks/              # Custom React hooks
│   ├── useAIPlayer.ts      # AI automation logic
│   ├── useCreateGameForm.ts # Form state management
│   ├── useGameClient.ts    # Game client state
│   ├── useGameInteraction.ts # UI interaction state
│   └── useSuggestions.ts   # Suggestions loading
├── utils/              # Pure utility functions
│   ├── boardValidation.ts  # Board interaction rules
│   └── moveValidation.ts   # Move validation logic
├── lib/
│   └── client.ts       # API client for backend communication
├── App.tsx             # Main application component
├── main.tsx            # Application entry point
├── index.html          # HTML template
└── index.css           # Global styles with Tailwind
```

## Key Components

### Presentation Components

#### Board.tsx
- Displays the game board with coordinate labels
- Highlights selected cells and word paths
- Responsive cell sizing with hover effects
- Uses `boardValidation` utilities for cell click logic

#### GamePanel.tsx
- Main game interface with board and controls
- Manages move input and submission
- Integrates suggestions display
- Uses `moveValidation` utilities for move logic

#### PlayerPanel.tsx
- Shows player info, scores, and word history
- Visual indicators for current turn and AI players
- Compact sidebar design

#### BottomControls.tsx
- Russian alphabet selection grid
- Move submission controls
- Word display and status

#### CreateGame.tsx
- Game creation form (size + base word)
- Uses `useCreateGameForm` hook for logic
- Russian letter validation

#### GameList.tsx
- Displays available games
- Join functionality
- Game status indicators

### Custom Hooks

#### useGameClient.ts
- Core game client state management
- API communication wrapper
- Screen navigation
- WebSocket connection handling

#### useAIPlayer.ts
- Automatic AI move execution
- Uses suggestions API for move selection
- Thinking delay for better UX
- Error handling for AI failures

#### useGameInteraction.ts
- UI interaction state (cell selection, letter input)
- Word path management
- Selection clearing logic

#### useSuggestions.ts
- Auto-loads suggestions on player's turn
- Caches suggestion results
- Loading state management

#### useCreateGameForm.ts
- Form state management
- Input validation
- Russian letter checking
- Submit handling

### Pure Utilities

#### boardValidation.ts
- `canClickCell()` - Implements Balda cell click rules
- `isPositionInWordPath()` - Path membership checking
- `getPositionPathIndex()` - Position lookup in path
- `isPositionSelected()` - Selection state checking

All functions are pure (no side effects) and fully type-safe.

#### moveValidation.ts
- `formWordFromPath()` - Constructs word from board positions
- `canSubmitMove()` - Validates move readiness
- `buildMoveBody()` - Creates API request object

Composable functions for move workflow.

### API Client (lib/client.ts)
- Type-safe API communication
- WebSocket connection management
- Automatic game state updates
- Error handling

## Game Flow

1. **Main Menu**: Choose to create a game, join existing, or quick start
2. **Create Game**: Specify size, base word, and number of players
3. **Join Game**: Browse available games and join with your name
4. **Gameplay**:
   - View the board and current game state
   - Make moves when it's your turn
   - See real-time updates from other players
   - Track scores and used words

## Styling

The app uses a dark theme with color coding:
- **Cyan**: Headers, game IDs, UI accents
- **Green**: Success states, active player, filled cells
- **Yellow**: Warnings, waiting states, current turn
- **Purple**: Preview states, used words section
- **Red**: Errors, invalid moves

## WebSocket Integration

- Automatic connection when joining a game
- Real-time game state synchronization
- Graceful handling of disconnections
- Message format: `{ type: 'game_update', game: GameState }`

## Error Handling

- Server connection checks on startup
- User-friendly error messages
- Form validation before submission
- Network error recovery

## Architecture Pattern

The web frontend follows a clean architecture with strict separation of concerns:

### Layered Structure
```
┌─────────────────────────────────────┐
│   Presentation Layer (Components)   │  ← React components (JSX only)
├─────────────────────────────────────┤
│    State Layer (Custom Hooks)       │  ← React hooks (state + effects)
├─────────────────────────────────────┤
│   Business Logic (Pure Functions)   │  ← Utilities (no React deps)
├─────────────────────────────────────┤
│      API Layer (Client)              │  ← Backend communication
└─────────────────────────────────────┘
```

### Design Principles
1. **Components** - Thin presentation layer, minimal logic
2. **Hooks** - Encapsulate stateful logic and side effects
3. **Utilities** - Pure functions for business rules
4. **Types** - Strict TypeScript throughout
5. **Testability** - Each layer independently testable

### Benefits
- ✅ **Maintainable** - Clear separation of concerns
- ✅ **Testable** - Pure functions easy to test
- ✅ **Reusable** - Logic shared across components
- ✅ **Type-safe** - Full TypeScript coverage
- ✅ **Scalable** - Easy to extend and modify

For detailed refactoring information, see [CLIENT_LOGIC_REFACTOR.md](./CLIENT_LOGIC_REFACTOR.md).

## Recent Updates

### ✅ UI Redesign V2 - Complete Interface Overhaul (Oct 11, 2025)
Major redesign with modern, elegant interface:
- **Menu Screen**: Gradient title, modern button cards, smooth animations
- **Game Layout**: Centered single-column design, horizontal score bar
- **Game Controls**: Step-by-step guidance, larger word display, AI modal
- **Create Form**: Visual size selector, large input field, help text
- **Animations**: Fade-in, slide-up, hover-lift, shimmer effects
- **Mobile**: Enhanced responsive design, touch-friendly targets
- **Board**: Larger cells (14×14), better spacing, enhanced shadows

See [UI_REDESIGN_V2.md](./UI_REDESIGN_V2.md) for complete details.

### ✅ Client Logic Refactoring (Oct 11, 2025)
Extracted business logic from components into pure utilities and custom hooks:
- Created `utils/boardValidation.ts` - Board interaction rules
- Created `utils/moveValidation.ts` - Move validation logic
- Created `hooks/useCreateGameForm.ts` - Form state management
- Reduced component complexity by 17-33%
- Improved testability and maintainability

See [CLIENT_LOGIC_REFACTOR.md](./CLIENT_LOGIC_REFACTOR.md) for details.

## Future Enhancements

- [x] Move suggestions/hints - ✅ Implemented with AI suggestions
- [ ] Sound effects for moves
- [ ] Player avatars
- [ ] Game replay functionality
- [ ] Statistics and leaderboard
- [ ] Mobile app with React Native
- [ ] Internationalization (i18n)
- [ ] Unit tests for utilities and hooks