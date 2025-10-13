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
    <Box flexDirection="column" width="100%">
      {/* Main status section with enhanced styling */}
      <Box
        flexDirection="row"
        justifyContent="space-between"
        alignItems="center"
        paddingX={2}
        paddingY={1}
        borderStyle="round"
        borderColor={error ? 'red' : loading ? 'yellow' : isMyTurn ? 'green' : 'blue'}
        width="100%"
        backgroundColor={error ? 'red' : loading ? 'yellow' : isMyTurn ? 'green' : 'blue'}
      >
        {/* Left side - Status indicator */}
        <Box flexDirection="row" alignItems="center" gap={1}>
          {loading && (
            <>
              <Text color="white" bold>⏳</Text>
              <Text color="white" bold>Обработка...</Text>
            </>
          )}
          {!loading && error && (
            <>
              <Text color="white" bold>❌</Text>
              <Text color="white" bold>{error}</Text>
            </>
          )}
          {!loading && !error && mode === 'idle' && currentPlayerName && (
            <>
              {isMyTurn
                ? (
                  <>
                    <Text color="white" bold>🎯</Text>
                    <Text color="white" bold>Ваш ход!</Text>
                  </>
                )
                : (
                  <>
                    <Text color="white" bold>⏳</Text>
                    <Text color="white" bold>
                      Ожидание хода игрока {currentPlayer}...
                    </Text>
                  </>
                )}
            </>
          )}
          {!loading && !error && mode === 'input' && inputPrompt && (
            <>
              <Text color="white" bold>💬</Text>
              <Text color="white" bold>{inputPrompt}</Text>
            </>
          )}
        </Box>

        {/* Right side - Mode indicator */}
        <Box>
          <Text color="white" dimColor>
            {mode === 'idle' ? '🎮 ИГРА' : '⌨️ ВВОД'}
          </Text>
        </Box>
      </Box>

      {/* Enhanced command palette */}
      <Box
        flexDirection="row"
        justifyContent="space-between"
        alignItems="center"
        paddingX={2}
        paddingY={1}
        borderStyle="single"
        borderColor="gray"
        width="100%"
        backgroundColor="black"
      >
        {/* Primary commands */}
        <Box flexDirection="row" gap={2}>
          {mode === 'idle' ? (
            <>
              <Text color="cyan" bold>[м]</Text>
              <Text color="white">Ход</Text>
              <Text color="cyan" bold>[р]</Text>
              <Text color="white">Обновить</Text>
              <Text color="cyan" bold>[с]</Text>
              <Text color="white">Подсказки</Text>
              <Text color="cyan" bold>[б]</Text>
              <Text color="white">Назад</Text>
            </>
          ) : (
            <>
              <Text color="red" bold>[ESC]</Text>
              <Text color="white">Отмена</Text>
              <Text color="green" bold>[Enter]</Text>
              <Text color="white">Подтвердить</Text>
            </>
          )}
        </Box>

        {/* Secondary info */}
        <Box>
          <Text color="gray" dimColor>
            {mode === 'idle' ? '[ESC] Выход' : 'Введите команду'}
          </Text>
        </Box>
      </Box>
    </Box>
  )
}
