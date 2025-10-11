import type { GameState } from '../api'
import { Box, Text } from 'ink'
import React from 'react'

interface BoardProps {
  game: GameState
  highlightPosition?: { row: number, col: number }
  highlightRow?: number
  previewLetter?: { row: number, col: number, letter: string }
}

export function Board({ game, highlightPosition, highlightRow, previewLetter }: BoardProps) {
  const { board, size } = game

  return (
    <Box flexDirection="column" borderStyle="round" borderColor="cyan" padding={1}>
      <Box marginBottom={1}>
        <Text bold color="cyan">
          Доска Балда (
          {size}
          x
          {size}
          )
        </Text>
      </Box>

      {/* Column headers (Russian letters) */}
      <Box>
        <Text>   </Text>
        {Array.from({ length: size }, (_, i) => (
          <Text key={i} color="cyan" bold>
            {' '}
            {/* А=1040 in Unicode */}
            {String.fromCharCode(1040 + i)}
            {' '}
          </Text>
        ))}
      </Box>

      {/* Board rows */}
      {board.map((row, rowIndex) => {
        const isRowHighlighted = highlightRow === rowIndex

        return (
          <Box key={rowIndex}>
            <Text color={isRowHighlighted ? 'yellow' : 'gray'} bold={isRowHighlighted}>
              {rowIndex}
              {' '}
            </Text>
            {row.map((cell, colIndex) => {
              const isPositionHighlighted
                = highlightPosition?.row === rowIndex
                  && highlightPosition?.col === colIndex

              const hasPreviewLetter
                = previewLetter?.row === rowIndex
                  && previewLetter?.col === colIndex

              const displayLetter = hasPreviewLetter ? previewLetter.letter : cell

              return (
                <Box
                  key={colIndex}
                  width={3}
                  justifyContent="center"
                  borderStyle="single"
                  borderColor={
                    hasPreviewLetter
                      ? 'red'
                      : isPositionHighlighted
                        ? 'yellow'
                        : isRowHighlighted
                          ? 'yellow'
                          : 'blue'
                  }
                >
                  <Text
                    bold={isPositionHighlighted || isRowHighlighted || hasPreviewLetter}
                    color={
                      hasPreviewLetter
                        ? 'red'
                        : isPositionHighlighted
                          ? 'yellow'
                          : isRowHighlighted
                            ? 'yellow'
                            : cell
                              ? 'green'
                              : 'gray'
                    }
                  >
                    {displayLetter || '·'}
                  </Text>
                </Box>
              )
            })}
          </Box>
        )
      })}
    </Box>
  )
}
