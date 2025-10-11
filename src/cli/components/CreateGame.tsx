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
        <Text bold color="cyan">Создать новую игру</Text>
      </Box>

      {step === 'size' && (
        <Box flexDirection="column">
          <Box marginBottom={1}>
            <Text>Введите размер доски (минимум 3):</Text>
          </Box>
          <Box>
            <Text color="cyan">Размер: </Text>
            <TextInput value={size} onChange={setSize} onSubmit={handleSubmit} />
          </Box>
        </Box>
      )}

      {step === 'baseWord' && (
        <Box flexDirection="column">
          <Box>
            <Text color="gray">
              Размер:
              {' '}
              {size}
            </Text>
          </Box>
          <Box marginTop={1} marginBottom={1}>
            <Text>Введите базовое слово (размещается в центре):</Text>
          </Box>
          <Box>
            <Text color="cyan">Базовое слово: </Text>
            <TextInput value={baseWord} onChange={setBaseWord} onSubmit={handleSubmit} />
          </Box>
        </Box>
      )}

      {step === 'playerName' && (
        <Box flexDirection="column">
          <Box>
            <Text color="gray">
              Размер:
              {' '}
              {size}
            </Text>
          </Box>
          <Box>
            <Text color="gray">
              Базовое слово:
              {' '}
              {baseWord}
            </Text>
          </Box>
          <Box marginTop={1} marginBottom={1}>
            <Text>Введите ваше имя:</Text>
          </Box>
          <Box marginBottom={1}>
            <Text dimColor>
              (Другой игрок может присоединиться используя код игры)
            </Text>
          </Box>
          <Box>
            <Text color="cyan">Ваше имя: </Text>
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
