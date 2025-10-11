import { Box, Text } from 'ink'
import SelectInput from 'ink-select-input'
import React from 'react'

interface MainMenuProps {
  onSelect: (action: 'list' | 'create' | 'join' | 'quick5x5' | 'exit') => void
}

export function MainMenu({ onSelect }: MainMenuProps) {
  const items = [
    { label: '⚡ Quick Start 5x5 (Random Word)', value: 'quick5x5' as const },
    { label: '➕ Create New Game', value: 'create' as const },
    { label: '🔗 Join Game by Code', value: 'join' as const },
    { label: '📋 List All Games', value: 'list' as const },
    { label: '🚪 Exit', value: 'exit' as const },
  ]

  const handleSelect = (item: { value: 'list' | 'create' | 'join' | 'quick5x5' | 'exit' }) => {
    onSelect(item.value)
  }

  return (
    <Box flexDirection="column">
      <Box marginBottom={1} paddingX={1}>
        <Text bold color="cyan">
          🎮 Balda Word Game - CLI Frontend
        </Text>
      </Box>

      <Box marginBottom={1} paddingX={1}>
        <Text dimColor>
          Select an option:
        </Text>
      </Box>

      <SelectInput items={items} onSelect={handleSelect} />
    </Box>
  )
}
