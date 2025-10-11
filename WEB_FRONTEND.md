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
├── api/
│   └── client.ts       # API client for backend communication
├── components/
│   ├── Board.tsx       # Game board component
│   ├── CreateGame.tsx  # Game creation form
│   ├── GameInfo.tsx    # Game state display
│   ├── GameList.tsx    # Available games list
│   └── MoveInput.tsx   # Move input form
├── App.tsx             # Main application component
├── main.tsx            # Application entry point
├── index.html          # HTML template
└── index.css           # Global styles with Tailwind
```

## Key Components

### Board Component
- Displays the game board with Russian letter headers
- Highlights selected positions and preview letters
- Responsive cell sizing

### MoveInput Component
- Form for entering moves (position + letter + word)
- Input validation with error messages
- Disabled state when not player's turn

### GameInfo Component
- Shows current player, scores, and game statistics
- Visual indicators for active player
- Real-time score updates

### API Client
- Type-safe API communication
- WebSocket connection management
- Automatic reconnection on disconnect

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

## Future Enhancements

- [ ] Move suggestions/hints
- [ ] Sound effects for moves
- [ ] Player avatars
- [ ] Game replay functionality
- [ ] Statistics and leaderboard
- [ ] Mobile app with React Native
- [ ] Internationalization (i18n)