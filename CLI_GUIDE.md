# Balda CLI Frontend Guide

## Overview

The Balda CLI frontend is an interactive terminal application built with [React Ink](https://github.com/vadimdemedes/ink) that provides a user-friendly interface for playing the Balda word game.

## Prerequisites

Before using the CLI, make sure:
1. The server is running: `bun run dev` (in a separate terminal)
2. The server is accessible at `http://localhost:3000`

## Starting the CLI

```bash
bun run cli
```

## Features

### Main Menu
When you start the CLI, you'll see the main menu with three options:
- **📋 List Games** - View and select from existing games
- **➕ Create New Game** - Start a new game
- **🚪 Exit** - Quit the application

### Creating a Game
1. Select "Create New Game" from the main menu
2. Enter the board size (minimum 3)
3. Enter a base word (will be placed in the center row)
4. Enter player names separated by commas (e.g., "Alice, Bob, Charlie")

### Playing a Game
When viewing a game, you'll see:
- **Visual Board** - A grid showing current letter placements
- **Game Info** - Current player, scores, and game statistics
- **Used Words** - List of words already played

#### Available Commands
- **[m] Make Move** - Place a letter and form a word
- **[r] Refresh** - Reload the game state
- **[s] Suggestions** - Get AI-powered move suggestions
- **[b] Back** - Return to main menu
- **ESC** - Cancel current action or return to menu

### Making a Move
When you press `[m]` to make a move:
1. Enter the row number (0-based index)
2. Enter the column number (0-based index)
3. Enter the letter to place
4. Enter the word you're forming

The CLI will validate your move and update the board if successful.

### AI Suggestions
Press `[s]` to get AI-powered move suggestions. The suggestions are ranked by score and show:
- Position (row, col)
- Letter to place
- Word to form
- Score value

## UI Elements

### Board Display
- **Green letters** - Placed letters
- **Gray dots (·)** - Empty cells
- **Yellow highlight** - Selected position during move input
- **Blue borders** - Cell boundaries
- **Row/Column numbers** - Coordinates for move input

### Game Info Panel
- **Current Turn** - Highlighted in yellow with ▶ indicator
- **Scores** - All players' scores
- **Moves** - Total number of moves made
- **Used Words** - Count of unique words played

### Color Coding
- **Cyan** - Headers and titles
- **Green** - Positive actions and placed letters
- **Yellow** - Current player and highlights
- **Magenta** - Info panels and scores
- **Red** - Errors
- **Gray** - Secondary information

## Keyboard Shortcuts

- **Arrow Keys** - Navigate menus
- **Enter** - Select option or confirm input
- **ESC** - Cancel/Go back
- **Ctrl+C** - Force quit application

## Error Handling

If you encounter an error:
- Error messages appear in a red box at the top
- Press ESC to dismiss error messages
- Check that the server is running
- Verify your move is valid according to game rules

## Tips

1. **Board Coordinates** - Remember that rows and columns start from 0
2. **Word Formation** - Your word must include the new letter you're placing
3. **AI Suggestions** - Use `[s]` if you're stuck - the AI provides smart move ideas
4. **Refresh** - Press `[r]` if you're playing with others and want to see their moves
5. **Visual Feedback** - The board highlights your selected position during move input

## Architecture

The CLI is built with:
- **React Ink** - Terminal UI rendering
- **TypeScript** - Type safety
- **Bun Runtime** - Fast execution
- **API Client** - Communicates with the Elysia backend

## Project Structure

```
src/cli/
├── api.ts                 # API client for backend communication
├── App.tsx                # Main application component
├── index.tsx              # Entry point
└── components/
    ├── Board.tsx          # Game board display
    ├── CreateGame.tsx     # Game creation form
    ├── GameInfo.tsx       # Score and status panel
    ├── GameList.tsx       # List of available games
    ├── GamePlay.tsx       # Main gameplay interface
    ├── MainMenu.tsx       # Main menu screen
    └── Suggestions.tsx    # AI suggestions display
```

## Development

To modify the CLI:
1. Edit components in `src/cli/components/`
2. The CLI auto-reloads on changes when using `bun run --watch src/cli/index.tsx`
3. Follow the project's ESLint rules for consistent code style

## Troubleshooting

**"Cannot connect to server"**
- Make sure the server is running: `bun run dev`
- Check that port 3000 is not blocked

**"Game not found"**
- The game may have been deleted
- Try refreshing the game list

**"Invalid move"**
- Check that the position is empty
- Verify the word includes your new letter
- Ensure the word hasn't been used before
- Make sure you're forming a valid path on the board

## Future Enhancements

Potential improvements:
- WebSocket support for real-time updates
- Multiple server connection support
- Game replay/history view
- Advanced statistics and analytics
- Custom color themes
- Configuration file support

