import type { Suggestion } from '../api'
import { Box, Text, useInput, useStdout } from 'ink'
import React from 'react'

interface SuggestionsProps {
  suggestions: Suggestion[]
  onClose?: () => void
}

export function Suggestions({ suggestions, onClose }: SuggestionsProps) {
  const { stdout } = useStdout()
  const terminalWidth = stdout?.columns || 80
  const terminalHeight = stdout?.rows || 24

  useInput(() => {
    if (onClose) {
      onClose()
    }
  })

  // Split suggestions into columns for better space usage
  const columns = Math.max(2, Math.floor(terminalWidth / 40))

  return (
    <Box flexDirection="column" width={terminalWidth} height={terminalHeight}>
      {/* HEADER */}
      <Box width={terminalWidth} justifyContent="center" borderStyle="double" borderColor="yellow">
        <Text bold color="yellow">
          {' '}
          🤖 ПОДСКАЗКИ AI (
          {suggestions.length}
          )
          {' '}
        </Text>
      </Box>

      {/* CONTENT */}
      <Box flexDirection="column" flexGrow={1} padding={1}>
        {suggestions.length === 0
          ? (
              <Box justifyContent="center" alignItems="center" flexGrow={1}>
                <Text color="gray">Нет доступных подсказок</Text>
              </Box>
            )
          : (
              <Box flexDirection="row" flexWrap="wrap">
                {suggestions.slice(0, 20).map((suggestion, index) => {
                  // Format position as chess notation (e.g., "1А", "2Б") using Russian letters
                  const posStr = `${suggestion.position.row}${String.fromCharCode(1040 + suggestion.position.col)}`
                  return (
                    <Box key={index} width={Math.floor(terminalWidth / columns)} paddingRight={1}>
                      <Text color="cyan">
                        {index + 1}
                        .
                      </Text>
                      <Text bold color="yellow">
                        {' '}
                        {posStr}
                      </Text>
                      <Text color="green">
                        +
                        {suggestion.letter}
                      </Text>
                      <Text> → </Text>
                      <Text bold>{suggestion.word}</Text>
                      <Text color="magenta">
                        {' '}
                        [
                        {suggestion.score.toFixed(1)}
                        ]
                      </Text>
                    </Box>
                  )
                })}
              </Box>
            )}
      </Box>

      {/* STATUS BAR */}
      <Box width={terminalWidth} borderStyle="double" borderColor="yellow" justifyContent="center">
        <Text dimColor>Нажмите любую клавишу для закрытия</Text>
      </Box>
    </Box>
  )
}
