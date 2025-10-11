import type { GameState } from '../api'
import { Box, Text, useInput } from 'ink'
import SelectInput from 'ink-select-input'
import TextInput from 'ink-text-input'
import React, { useState } from 'react'

interface GameListProps {
  games: GameState[]
  onWatch: (game: GameState) => void
  onJoin: (game: GameState, playerName: string) => void
  onBack: () => void
}

export function GameList({ games, onWatch, onJoin, onBack }: GameListProps) {
  const [selectedGame, setSelectedGame] = useState<GameState | null>(null)
  const [action, setAction] = useState<'menu' | 'join'>('menu')
  const [playerName, setPlayerName] = useState('')

  // Helper to check if game has real players (not just placeholders)
  const hasRealPlayers = (game: GameState) => {
    return game.players.some(p => !p.startsWith('Player '))
  }

  // Helper to check if game has available slots
  const hasAvailableSlots = (game: GameState) => {
    return game.players.some(p => p.startsWith('Player ') && p !== 'Player 1')
  }

  // Format game display with indicators
  const formatGameLabel = (game: GameState) => {
    const id = game.id.slice(0, 8)
    const players = game.players.join(', ')
    const moves = game.moves.length
    const hasReal = hasRealPlayers(game)
    const hasSlots = hasAvailableSlots(game)

    // Indicators
    const indicator = hasReal ? '👥' : '🤖'
    const slotsText = hasSlots ? ' [ВОЙТИ]' : ''

    return `${indicator} ${id} - ${players} - ${moves} ходов${slotsText}`
  }

  const items = [
    ...games.map(game => ({
      label: formatGameLabel(game),
      value: game.id,
    })),
    { label: '← Назад в меню', value: '__back__' },
  ]

  useInput((input, key) => {
    if (key.escape && action === 'join') {
      setAction('menu')
      setSelectedGame(null)
      setPlayerName('')
    }
  })

  const handleSelect = (item: { value: string }) => {
    if (item.value === '__back__') {
      onBack()
    }
    else {
      const game = games.find(g => g.id === item.value)
      if (game) {
        setSelectedGame(game)
        // If game has available slots, show join/watch options
        if (hasAvailableSlots(game)) {
          setAction('join')
        }
        else {
          // No slots, just watch
          onWatch(game)
        }
      }
    }
  }

  const handleJoinSubmit = (value: string) => {
    if (selectedGame && value.trim()) {
      onJoin(selectedGame, value.trim())
    }
  }

  const handleWatch = () => {
    if (selectedGame) {
      onWatch(selectedGame)
    }
  }

  // Join screen
  if (action === 'join' && selectedGame) {
    return (
      <Box flexDirection="column">
        <Box marginBottom={1}>
          <Text bold color="cyan">Присоединиться к игре</Text>
        </Box>

        <Box marginBottom={1}>
          <Text>
            Игра:
            {' '}
            <Text color="yellow">{selectedGame.id.slice(0, 8)}</Text>
          </Text>
        </Box>

        <Box marginBottom={1}>
          <Text>
            Игроки:
            {' '}
            <Text color="green">{selectedGame.players.join(', ')}</Text>
          </Text>
        </Box>

        <Box marginBottom={1}>
          <Text>
            Ходов:
            {' '}
            {selectedGame.moves.length}
          </Text>
        </Box>

        <Box marginTop={1} marginBottom={1} flexDirection="column">
          <Text bold>Введите ваше имя для присоединения как игрок:</Text>
          <Box marginTop={1}>
            <Text>Имя: </Text>
            <TextInput value={playerName} onChange={setPlayerName} onSubmit={handleJoinSubmit} />
          </Box>
        </Box>

        <Box marginTop={1} flexDirection="column">
          <Text dimColor>Нажмите Enter для присоединения как игрок</Text>
          <Box marginTop={1}>
          <Text dimColor>
            Или нажмите
            {' '}
            <Text bold>[ц]</Text>
            {' '}
            только для просмотра
          </Text>
          </Box>
          <Text dimColor>Нажмите ESC для отмены</Text>
        </Box>

        {/* Hidden input handler for 'w' key - support both Latin and Cyrillic */}
        {React.createElement(() => {
          useInput((input) => {
            // Support: w, в (Russian v which is w position), ц (w on Russian layout)
            if (input === 'w' || input === 'в' || input === 'ц') {
              handleWatch()
            }
          })
          return null
        })}
      </Box>
    )
  }

  // Game list screen
  return (
    <Box flexDirection="column">
      <Box marginBottom={1}>
        <Text bold color="cyan">Выберите игру</Text>
      </Box>

      {games.length === 0 && (
        <Box marginBottom={1}>
          <Text color="yellow">Игр не найдено. Создайте новую игру!</Text>
        </Box>
      )}

      {games.length > 0 && (
        <Box marginBottom={1} flexDirection="column">
          <Text dimColor>
            👥 = Есть игроки  |  🤖 = Только заглушки  |  [ВОЙТИ] = Есть места
          </Text>
        </Box>
      )}

      <SelectInput items={items} onSelect={handleSelect} />
    </Box>
  )
}
