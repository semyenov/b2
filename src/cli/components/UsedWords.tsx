import type { GameState } from '../api'
import { Box, Text } from 'ink'
import React from 'react'

interface UsedWordsProps {
  game: GameState
}

export function UsedWords({ game }: UsedWordsProps) {
  // Group words by player
  const wordsByPlayer = game.players.reduce((acc, player) => {
    acc[player] = game.moves
      .filter(move => move.playerId === player)
      .map(move => move.word)
    return acc
  }, {} as Record<string, string[]>)

  const currentPlayer = game.players[game.currentPlayerIndex]

  return (
    <Box flexDirection="row" width="100%" gap={2}>
      {game.players.map((player, _index) => {
        const words = wordsByPlayer[player] || []
        const isCurrent = player === currentPlayer
        const score = game.scores[player] || 0

        return (
          <Box
            key={player}
            flexDirection="column"
            flexGrow={1}
            flexBasis={0}
            borderStyle="single"
            borderColor={isCurrent ? 'yellow' : 'gray'}
            paddingX={1}
          >
            {/* Player header */}
            <Box marginBottom={1}>
              <Text bold color={isCurrent ? 'yellow' : 'white'}>
                {isCurrent ? '> ' : '  '}
                {player}
              </Text>
              <Text dimColor> - </Text>
              <Text bold color="green">
                {score}
                {' '}
                очков
              </Text>
            </Box>

            {/* Words list */}
            {words.length > 0
              ? (
                  <Box flexDirection="column">
                    {words.map((word, idx) => (
                      <Text key={idx} dimColor>
                        {idx + 1}
                        .
                        {word}
                      </Text>
                    ))}
                  </Box>
                )
              : (
                  <Text dimColor italic>Нет слов</Text>
                )}
          </Box>
        )
      })}
    </Box>
  )
}
