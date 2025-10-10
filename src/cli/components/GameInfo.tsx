import type { GameState } from '../api'
import { Box, Text } from 'ink'
import React from 'react'

interface GameInfoProps {
  game: GameState
}

export function GameInfo({ game }: GameInfoProps) {
  const currentPlayer = game.players[game.currentPlayerIndex]

  return (
    <Box flexDirection="column" borderStyle="round" borderColor="magenta" padding={1}>
      <Box marginBottom={1}>
        <Text bold color="magenta">Game Info</Text>
      </Box>

      <Box>
        <Text color="gray">ID: </Text>
        <Text>{game.id}</Text>
      </Box>

      <Box marginTop={1}>
        <Text color="gray">Current Turn: </Text>
        <Text bold color="yellow">{currentPlayer}</Text>
      </Box>

      <Box marginTop={1}>
        <Text bold color="cyan">Scores:</Text>
      </Box>
      {game.players.map((player) => {
        const score = game.scores[player] || 0
        const isCurrent = player === currentPlayer
        return (
          <Box key={player} marginLeft={2}>
            <Text color={isCurrent ? 'yellow' : 'white'}>
              {isCurrent ? '▶ ' : '  '}
              {player}
              :
              {' '}
            </Text>
            <Text bold color={isCurrent ? 'yellow' : 'green'}>{score}</Text>
          </Box>
        )
      })}

      <Box marginTop={1}>
        <Text color="gray">Moves: </Text>
        <Text>{game.moves.length}</Text>
      </Box>

      <Box marginTop={1}>
        <Text color="gray">Used Words: </Text>
        <Text>{game.usedWords.length}</Text>
      </Box>
    </Box>
  )
}
