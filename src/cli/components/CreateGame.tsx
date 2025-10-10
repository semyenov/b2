import type { CreateGameBody } from '../api'
import { Box, Text } from 'ink'
import TextInput from 'ink-text-input'
import React, { useState } from 'react'

interface CreateGameProps {
  onSubmit: (game: CreateGameBody) => void
  onCancel?: () => void
}

export function CreateGame({ onSubmit, onCancel: _onCancel }: CreateGameProps) {
  const [step, setStep] = useState<'size' | 'baseWord' | 'players'>('size')
  const [size, setSize] = useState('')
  const [baseWord, setBaseWord] = useState('')
  const [players, setPlayers] = useState('')

  const handleSubmit = (value: string) => {
    if (step === 'size') {
      const sizeNum = Number(value)
      if (Number.isNaN(sizeNum) || sizeNum < 3) {
        // Invalid, stay on same step
        return
      }
      setSize(value)
      setStep('baseWord')
    }
    else if (step === 'baseWord') {
      if (!value.trim()) {
        return
      }
      setBaseWord(value)
      setStep('players')
    }
    else if (step === 'players') {
      const playerList = value
        .split(',')
        .map(p => p.trim())
        .filter(p => p.length > 0)

      if (playerList.length === 0) {
        return
      }

      onSubmit({
        size: Number(size),
        baseWord,
        players: playerList,
      })
    }
  }

  return (
    <Box flexDirection="column">
      <Box marginBottom={1}>
        <Text bold color="cyan">Create New Game</Text>
      </Box>

      {step === 'size' && (
        <Box flexDirection="column">
          <Box marginBottom={1}>
            <Text>Enter board size (minimum 3):</Text>
          </Box>
          <Box>
            <Text color="cyan">Size: </Text>
            <TextInput value={size} onChange={setSize} onSubmit={handleSubmit} />
          </Box>
        </Box>
      )}

      {step === 'baseWord' && (
        <Box flexDirection="column">
          <Box>
            <Text color="gray">
              Size:
              {size}
            </Text>
          </Box>
          <Box marginTop={1} marginBottom={1}>
            <Text>Enter base word (placed in the center):</Text>
          </Box>
          <Box>
            <Text color="cyan">Base Word: </Text>
            <TextInput value={baseWord} onChange={setBaseWord} onSubmit={handleSubmit} />
          </Box>
        </Box>
      )}

      {step === 'players' && (
        <Box flexDirection="column">
          <Box>
            <Text color="gray">
              Size:
              {size}
            </Text>
          </Box>
          <Box>
            <Text color="gray">
              Base Word:
              {baseWord}
            </Text>
          </Box>
          <Box marginTop={1} marginBottom={1}>
            <Text>Enter player names (comma-separated):</Text>
          </Box>
          <Box>
            <Text color="cyan">Players: </Text>
            <TextInput value={players} onChange={setPlayers} onSubmit={handleSubmit} />
          </Box>
        </Box>
      )}

      <Box marginTop={1}>
        <Text dimColor>Press ESC to cancel (Ctrl+C to exit)</Text>
      </Box>
    </Box>
  )
}
