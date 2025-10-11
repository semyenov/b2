import type { CreateGameBody } from '../api'
import { Box, Text, useInput } from 'ink'
import TextInput from 'ink-text-input'
import React, { useState } from 'react'

interface CreateGameProps {
  onSubmit: (game: CreateGameBody, playerName: string) => void
  onCancel?: () => void
}

export function CreateGame({ onSubmit, onCancel }: CreateGameProps) {
  const [step, setStep] = useState<'size' | 'baseWord' | 'playerName'>('size')
  const [size, setSize] = useState('')
  const [baseWord, setBaseWord] = useState('')
  const [playerName, setPlayerName] = useState('')

  useInput((input, key) => {
    if (key.escape && onCancel) {
      onCancel()
    }
  })

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
      setStep('playerName')
    }
    else if (step === 'playerName') {
      if (!value.trim()) {
        return
      }
      setPlayerName(value.trim())

      // Create game with placeholder for second player
      onSubmit({
        size: Number(size),
        baseWord,
        players: [value.trim(), 'Player 2'],
      }, value.trim())
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

      {step === 'playerName' && (
        <Box flexDirection="column">
          <Box>
            <Text color="gray">
              Size:
              {' '}
              {size}
            </Text>
          </Box>
          <Box>
            <Text color="gray">
              Base Word:
              {' '}
              {baseWord}
            </Text>
          </Box>
          <Box marginTop={1} marginBottom={1}>
            <Text>Enter your player name:</Text>
          </Box>
          <Box marginBottom={1}>
            <Text dimColor>
              (Another player can join using the game code)
            </Text>
          </Box>
          <Box>
            <Text color="cyan">Your Name: </Text>
            <TextInput value={playerName} onChange={setPlayerName} onSubmit={handleSubmit} />
          </Box>
        </Box>
      )}

      <Box marginTop={1}>
        <Text dimColor>Press ESC to cancel (Ctrl+C to exit)</Text>
      </Box>
    </Box>
  )
}
