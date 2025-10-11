import { Box, Text } from 'ink'
import SelectInput from 'ink-select-input'
import React from 'react'

interface MainMenuProps {
  onSelect: (action: 'list' | 'create' | 'join' | 'quick5x5' | 'exit') => void
}

export function MainMenu({ onSelect }: MainMenuProps) {
  const items = [
    { label: '⚡ Быстрый старт 5x5 (Случайное слово)', value: 'quick5x5' as const },
    { label: '➕ Создать новую игру', value: 'create' as const },
    { label: '🔗 Присоединиться по коду', value: 'join' as const },
    { label: '📋 Список всех игр', value: 'list' as const },
    { label: '🚪 Выход', value: 'exit' as const },
  ]

  const handleSelect = (item: { value: 'list' | 'create' | 'join' | 'quick5x5' | 'exit' }) => {
    onSelect(item.value)
  }

  return (
    <Box flexDirection="column">
      <Box marginBottom={1} paddingX={1}>
        <Text bold color="cyan">
          🎮 Балда - Словесная игра - CLI
        </Text>
      </Box>

      <Box marginBottom={1} paddingX={1}>
        <Text dimColor>
          Выберите опцию:
        </Text>
      </Box>

      <SelectInput items={items} onSelect={handleSelect} />
    </Box>
  )
}
