import type { Suggestion } from '../api'
import { Box, Text, useInput } from 'ink'
import React from 'react'

interface SuggestionsProps {
  suggestions: Suggestion[]
  onClose?: () => void
}

export function Suggestions({ suggestions, onClose }: SuggestionsProps) {
  useInput(() => {
    if (onClose) {
      onClose()
    }
  })
  return (
    <Box flexDirection="column" borderStyle="round" borderColor="yellow" padding={1}>
      <Box marginBottom={1}>
        <Text bold color="yellow">AI Move Suggestions</Text>
      </Box>

      {suggestions.length === 0
        ? (
            <Text color="gray">No suggestions available</Text>
          )
        : (
            <Box flexDirection="column">
              {suggestions.slice(0, 10).map((suggestion, index) => {
                const posStr = `${suggestion.position.row}${String.fromCharCode(65 + suggestion.position.col)}`
                return (
                  <Box key={index}>
                    <Text color="cyan">
                      {index + 1}
                      .
                    </Text>
                    <Text bold color="yellow">
                      {' '}
                      {posStr}
                    </Text>
                    <Text color="green">
                      {' '}
                      +
                      {suggestion.letter}
                    </Text>
                    <Text>
                      {' '}
                      →
                      {' '}
                      <Text bold>{suggestion.word}</Text>
                    </Text>
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

      <Box marginTop={1}>
        <Text dimColor>Press any key to close</Text>
      </Box>
    </Box>
  )
}
