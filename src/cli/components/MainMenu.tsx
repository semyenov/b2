import { Box, Text } from 'ink'
import SelectInput from 'ink-select-input'
import React from 'react'

interface MainMenuProps {
  onSelect: (action: 'list' | 'create' | 'exit') => void
}

export function MainMenu({ onSelect }: MainMenuProps) {
  const items = [
    { label: '📋 List Games', value: 'list' as const },
    { label: '➕ Create New Game', value: 'create' as const },
    { label: '🚪 Exit', value: 'exit' as const },
  ]

  const handleSelect = (item: { value: 'list' | 'create' | 'exit' }) => {
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
