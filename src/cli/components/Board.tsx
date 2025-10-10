import type { GameState } from '../api'
import { Box, Text } from 'ink'
import React from 'react'

interface BoardProps {
  game: GameState
  highlightPosition?: { row: number, col: number }
}

export function Board({ game, highlightPosition }: BoardProps) {
  const { board, size } = game

  return (
    <Box flexDirection="column" borderStyle="round" borderColor="cyan" padding={1}>
      <Box marginBottom={1}>
        <Text bold color="cyan">
          Balda Board (
          {size}
          x
          {size}
          )
        </Text>
      </Box>

      {/* Column headers */}
      <Box>
        <Text>   </Text>
        {Array.from({ length: size }, (_, i) => (
          <Text key={i} color="gray">
            {' '}
            {i}
            {' '}
          </Text>
        ))}
      </Box>

      {/* Board rows */}
      {board.map((row, rowIndex) => (
        <Box key={rowIndex}>
          <Text color="gray">
            {rowIndex}
            {' '}
          </Text>
          {row.map((cell, colIndex) => {
            const isHighlighted
              = highlightPosition?.row === rowIndex
                && highlightPosition?.col === colIndex

            return (
              <Box
                key={colIndex}
                width={3}
                justifyContent="center"
                borderStyle="single"
                borderColor={isHighlighted ? 'yellow' : 'blue'}
              >
                <Text
                  bold={isHighlighted}
                  color={isHighlighted ? 'yellow' : cell ? 'green' : 'gray'}
                >
                  {cell || '·'}
                </Text>
              </Box>
            )
          })}
        </Box>
      ))}
    </Box>
  )
}
