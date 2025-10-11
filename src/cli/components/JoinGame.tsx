import { Box, Text, useInput } from 'ink'
import TextInput from 'ink-text-input'
import React, { useState } from 'react'

interface JoinGameProps {
  onSubmit: (gameId: string, playerName: string) => void
  onCancel?: () => void
}

export function JoinGame({ onSubmit, onCancel }: JoinGameProps) {
  const [step, setStep] = useState<'gameId' | 'playerName'>('gameId')
  const [gameId, setGameId] = useState('')
  const [playerName, setPlayerName] = useState('')

  useInput((input, key) => {
    if (key.escape && onCancel) {
      onCancel()
    }
  })

  const handleSubmit = (value: string) => {
    if (step === 'gameId') {
      if (!value.trim()) {
        return
      }
      setGameId(value.trim())
      setStep('playerName')
    }
    else if (step === 'playerName') {
      if (!value.trim()) {
        return
      }
      onSubmit(gameId, value.trim())
    }
  }

  return (
    <Box flexDirection="column">
      <Box marginBottom={1}>
        <Text bold color="cyan">Присоединиться к игре</Text>
      </Box>

      {step === 'gameId' && (
        <Box flexDirection="column">
          <Box marginBottom={1}>
            <Text>Введите полный ID игры:</Text>
          </Box>
          <Box marginBottom={1}>
            <Text dimColor>
              (Попросите создателя игры поделиться полным ID с их экрана)
            </Text>
          </Box>
          <Box>
            <Text color="cyan">ID игры: </Text>
            <TextInput value={gameId} onChange={setGameId} onSubmit={handleSubmit} />
          </Box>
        </Box>
      )}

      {step === 'playerName' && (
        <Box flexDirection="column">
          <Box>
            <Text color="gray">
              Присоединение к игре:
              {' '}
              {gameId.slice(0, 8)}
              ...
            </Text>
          </Box>
          <Box marginTop={1} marginBottom={1}>
            <Text>Введите ваше имя:</Text>
          </Box>
          <Box>
            <Text color="cyan">Имя: </Text>
            <TextInput value={playerName} onChange={setPlayerName} onSubmit={handleSubmit} />
          </Box>
        </Box>
      )}

      <Box marginTop={1}>
        <Text dimColor>Нажмите ESC для отмены (Ctrl+C для выхода)</Text>
      </Box>
    </Box>
  )
}
