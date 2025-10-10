import type { GameState } from '../api'
import { Box, Text } from 'ink'
import SelectInput from 'ink-select-input'
import React from 'react'

interface GameListProps {
  games: GameState[]
  onSelect: (game: GameState) => void
  onBack: () => void
}

export function GameList({ games, onSelect, onBack }: GameListProps) {
  const items = [
    ...games.map(game => ({
      label: `${game.id.slice(0, 8)} - ${game.players.join(', ')} - ${game.moves.length} moves`,
      value: game.id,
    })),
    { label: '← Back to Menu', value: '__back__' },
  ]

  const handleSelect = (item: { value: string }) => {
    if (item.value === '__back__') {
      onBack()
    }
    else {
      const game = games.find(g => g.id === item.value)
      if (game)
        onSelect(game)
    }
  }

  return (
    <Box flexDirection="column">
      <Box marginBottom={1}>
        <Text bold color="cyan">Select a Game</Text>
      </Box>

      {games.length === 0
        ? (
            <Box>
              <Text color="yellow">No games found. Create a new game!</Text>
            </Box>
          )
        : (
            <SelectInput items={items} onSelect={handleSelect} />
          )}
    </Box>
  )
}
