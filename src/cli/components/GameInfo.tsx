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
        <Text bold color="magenta">Информация об игре</Text>
      </Box>

      <Box>
        <Text color="gray">Текущий ход: </Text>
        <Text bold color="yellow">{currentPlayer}</Text>
      </Box>

      <Box marginTop={1}>
        <Text bold color="cyan">Очки:</Text>
      </Box>
      {game.players.map((player) => {
        const score = game.scores[player] || 0
        const isCurrent = player === currentPlayer
        return (
          <Box key={player} marginLeft={2}>
            <Text color={isCurrent ? 'yellow' : 'white'}>
              {isCurrent ? '> ' : '  '}
              {player}
              :
              {' '}
            </Text>
            <Text bold color={isCurrent ? 'yellow' : 'green'}>{score}</Text>
          </Box>
        )
      })}

      <Box marginTop={1}>
        <Text color="gray">Ходов: </Text>
        <Text>{game.moves.length}</Text>
      </Box>

      <Box marginTop={1}>
        <Text color="gray">Использовано слов: </Text>
        <Text>{game.usedWords.length}</Text>
      </Box>
    </Box>
  )
}
