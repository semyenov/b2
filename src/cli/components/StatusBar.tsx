import { Box, Text } from 'ink'
import React from 'react'

interface StatusBarProps {
  mode: 'idle' | 'input'
  isMyTurn: boolean
  currentPlayer: string
  currentPlayerName: string | null
  error?: string | null
  loading?: boolean
  inputPrompt?: string
}

export function StatusBar({ mode, isMyTurn, currentPlayer, currentPlayerName, error, loading, inputPrompt }: StatusBarProps) {
  return (
    <Box flexDirection="column" borderStyle="single" borderColor="cyan" width="100%">
      {/* Status line */}
      <Box paddingX={1} width="100%">
        {loading && (
          <Text color="yellow">⏳ Обработка...</Text>
        )}
        {!loading && error && (
          <Text color="red">
            ❌
            {error}
          </Text>
        )}
        {!loading && !error && mode === 'idle' && currentPlayerName && (
          <>
            {isMyTurn
              ? (
                  <Text color="green" bold>&gt; Ваш ход!</Text>
                )
              : (
                  <Text color="yellow">
                    ⏳ Ожидание хода игрока
                    {currentPlayer}
                    ...
                  </Text>
                )}
          </>
        )}
        {!loading && !error && mode === 'input' && inputPrompt && (
          <Text color="cyan">{inputPrompt}</Text>
        )}
      </Box>

      {/* Command line */}
      <Box paddingX={1} width="100%" borderStyle="single" borderColor="gray">
        {mode === 'idle'
          ? (
              <Text dimColor>[м] Ход  [р] Обновить  [с] Подсказки  [б] Назад  [ESC] Выход</Text>
            )
          : (
              <Text dimColor>[ESC] Отмена  [Enter] Подтвердить</Text>
            )}
      </Box>
    </Box>
  )
}
