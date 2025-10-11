import type { GameState } from '../api'
import { Box, Text, useStdout } from 'ink'
import React from 'react'

interface BoardProps {
  game: GameState
  highlightPosition?: { row: number, col: number }
  highlightRow?: number
  previewLetter?: { row: number, col: number, letter: string }
}

export function Board({ game, highlightPosition, highlightRow, previewLetter }: BoardProps) {
  const { board, size } = game
  const { stdout } = useStdout()
  const terminalWidth = stdout.columns || 80

  // Calculate cell size to make board as large as possible while remaining square
  // Leave space for row numbers (3 chars) and column headers
  const availableWidth = terminalWidth - 6
  const cellWidth = Math.max(3, Math.floor(availableWidth / size))
  const cellHeight = 1

  return (
    <Box flexDirection="column" width="100%" alignItems="center">
      {/* Column headers (Russian letters) */}
      <Box>
        <Text>   </Text>
        {Array.from({ length: size }, (_, i) => (
          <Box key={i} width={cellWidth} justifyContent="center">
            <Text color="cyan" bold>
              {/* А=1040 in Unicode */}
              {String.fromCharCode(1040 + i)}
            </Text>
          </Box>
        ))}
      </Box>

      {/* Board rows */}
      {board.map((row, rowIndex) => {
        const isRowHighlighted = highlightRow === rowIndex

        return (
          <Box key={rowIndex}>
            <Box width={3}>
              <Text color={isRowHighlighted ? 'yellow' : 'gray'} bold={isRowHighlighted}>
                {rowIndex}
              </Text>
            </Box>
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
                  width={cellWidth}
                  height={cellHeight}
                  justifyContent="center"
                  alignItems="center"
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
