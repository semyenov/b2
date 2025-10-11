import type { GameState, MoveBody } from '../api'
import { Box, Text, useInput } from 'ink'
import TextInput from 'ink-text-input'
import React, { useState } from 'react'
import { Board } from './Board'
import { GameInfo } from './GameInfo'

interface GamePlayProps {
  game: GameState
  currentPlayerName: string | null
  onMove: (move: MoveBody) => Promise<void>
  onRefresh: () => Promise<void>
  onSuggest: () => Promise<void>
  onBack: () => void
}

export function GamePlay({ game, currentPlayerName, onMove, onRefresh, onSuggest, onBack }: GamePlayProps) {
  const [mode, setMode] = useState<'idle' | 'input'>('idle')
  const [step, setStep] = useState<'row' | 'col' | 'letter' | 'word'>('row')
  const [row, setRow] = useState('')
  const [col, setCol] = useState('')
  const [letter, setLetter] = useState('')
  const [word, setWord] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  const currentPlayer = game.players[game.currentPlayerIndex]
  // Check if it's this player's turn - must match the exact player name in the game
  const isMyTurn = currentPlayerName !== null && currentPlayerName === currentPlayer

  useInput((input, key) => {
    if (mode === 'idle') {
      if (input === 'm') {
        if (!isMyTurn) {
          setError('It\'s not your turn!')
          return
        }
        setMode('input')
        setStep('row')
        setError(null)
      }
      else if (input === 'r') {
        void onRefresh()
      }
      else if (input === 's') {
        void onSuggest()
      }
      else if (input === 'b') {
        onBack()
      }
      else if (key.escape) {
        onBack()
      }
    }
    else if (key.escape) {
      setMode('idle')
      setRow('')
      setCol('')
      setLetter('')
      setWord('')
      setError(null)
    }
  })

  const handleSubmit = async (value: string) => {
    if (step === 'row') {
      const rowNum = Number(value)
      if (Number.isNaN(rowNum) || rowNum < 0 || rowNum >= game.size) {
        setError('Invalid row number')
        return
      }
      setRow(value)
      setStep('col')
      setError(null)
    }
    else if (step === 'col') {
      const colNum = Number(value)
      if (Number.isNaN(colNum) || colNum < 0 || colNum >= game.size) {
        setError('Invalid column number')
        return
      }
      setCol(value)
      setStep('letter')
      setError(null)
    }
    else if (step === 'letter') {
      if (value.length !== 1) {
        setError('Enter exactly one letter')
        return
      }
      setLetter(value)
      setStep('word')
      setError(null)
    }
    else if (step === 'word') {
      if (!value.trim()) {
        setError('Word cannot be empty')
        return
      }
      setWord(value)

      // Submit the move
      setLoading(true)
      try {
        // Use the actual player's name, not whose turn it is
        if (!currentPlayerName) {
          setError('Player name not set')
          setMode('idle')
          return
        }
        await onMove({
          playerId: currentPlayerName,
          position: { row: Number(row), col: Number(col) },
          letter,
          word: value,
        })
        // Reset state
        setMode('idle')
        setRow('')
        setCol('')
        setLetter('')
        setWord('')
        setError(null)
      }
      catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to make move')
        setMode('idle')
        setRow('')
        setCol('')
        setLetter('')
        setWord('')
      }
      finally {
        setLoading(false)
      }
    }
  }

  return (
    <Box flexDirection="column">
      <Box marginBottom={1} flexDirection="column">
        <Box flexDirection="column">
          <Box>
            <Text bold color="magenta">
              Game ID (share this to invite players):
            </Text>
          </Box>
          <Box marginTop={1} paddingX={1} borderStyle="round" borderColor="cyan">
            <Text bold color="cyan">
              {game.id}
            </Text>
          </Box>
        </Box>
        {currentPlayerName && (
          <Box marginTop={1}>
            <Text>
              Playing as:
              {' '}
            </Text>
            <Text bold color="green">
              {currentPlayerName}
            </Text>
          </Box>
        )}
      </Box>

      <Box gap={2}>
        <Board
          game={game}
          highlightPosition={row && col ? { row: Number(row), col: Number(col) } : undefined}
        />
        <GameInfo game={game} />
      </Box>

      {loading && (
        <Box marginTop={1}>
          <Text color="yellow">Processing move...</Text>
        </Box>
      )}

      {error && (
        <Box marginTop={1}>
          <Text color="red">
            Error:
            {error}
          </Text>
        </Box>
      )}

      {mode === 'idle' && !loading && (
        <Box marginTop={1} flexDirection="column">
          {!isMyTurn && currentPlayerName && (
            <Box marginBottom={1}>
              <Text color="yellow">
                ⏳ Waiting for
                {' '}
                {currentPlayer}
                {' '}
                to make a move...
              </Text>
            </Box>
          )}
          {isMyTurn && currentPlayerName && (
            <Box marginBottom={1}>
              <Text color="green" bold>
                ▶ Your turn! Make a move.
              </Text>
            </Box>
          )}
          <Text bold>Commands:</Text>
          <Text>
            {' '}
            [m] Make Move  [r] Refresh  [s] Suggestions  [b] Back
          </Text>
        </Box>
      )}

      {mode === 'input' && (
        <Box marginTop={1} flexDirection="column" borderStyle="single" padding={1}>
          <Text bold color="cyan">Make a Move</Text>

          {step === 'row' && (
            <Box marginTop={1}>
              <Text>Row: </Text>
              <TextInput value={row} onChange={setRow} onSubmit={handleSubmit} />
            </Box>
          )}

          {step === 'col' && (
            <Box marginTop={1}>
              <Box>
                <Text color="gray">
                  Row:
                  {row}
                </Text>
              </Box>
              <Box marginTop={1}>
                <Text>Col: </Text>
                <TextInput value={col} onChange={setCol} onSubmit={handleSubmit} />
              </Box>
            </Box>
          )}

          {step === 'letter' && (
            <Box marginTop={1} flexDirection="column">
              <Box>
                <Text color="gray">
                  Position: (
                  {row}
                  ,
                  {' '}
                  {col}
                  )
                </Text>
              </Box>
              <Box marginTop={1}>
                <Text>Letter: </Text>
                <TextInput value={letter} onChange={setLetter} onSubmit={handleSubmit} />
              </Box>
            </Box>
          )}

          {step === 'word' && (
            <Box marginTop={1} flexDirection="column">
              <Box>
                <Text color="gray">
                  Position: (
                  {row}
                  ,
                  {' '}
                  {col}
                  )
                </Text>
              </Box>
              <Box>
                <Text color="gray">
                  Letter:
                  {letter}
                </Text>
              </Box>
              <Box marginTop={1}>
                <Text>Word: </Text>
                <TextInput value={word} onChange={setWord} onSubmit={handleSubmit} />
              </Box>
            </Box>
          )}

          <Box marginTop={1}>
            <Text dimColor>Press ESC to cancel</Text>
          </Box>
        </Box>
      )}
    </Box>
  )
}
