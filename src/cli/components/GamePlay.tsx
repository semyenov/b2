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
  const [step, setStep] = useState<'unified' | 'word'>('unified')
  const [unifiedInput, setUnifiedInput] = useState('')
  const [row, setRow] = useState<number | null>(null)
  const [col, setCol] = useState<number | null>(null)
  const [letter, setLetter] = useState('')
  const [word, setWord] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  const currentPlayer = game.players[game.currentPlayerIndex]
  // Check if it's this player's turn - must match the exact player name in the game
  const isMyTurn = currentPlayerName !== null && currentPlayerName === currentPlayer

  // Parse unified input progressively: "1" → "1A" → "1AФ"
  const parseUnifiedInput = (input: string) => {
    const cleaned = input.trim().toUpperCase()

    // Stage 1: Just row number (e.g., "1")
    if (cleaned.length === 1 && /^\d$/.test(cleaned)) {
      const rowNum = Number.parseInt(cleaned, 10)
      if (rowNum >= 0 && rowNum < game.size) {
        return { stage: 'row' as const, row: rowNum, col: null, letter: null }
      }
    }

    // Stage 2: Row + Column (e.g., "1A")
    const posMatch = cleaned.match(/^(\d+)([A-Z])$/)
    if (posMatch) {
      const rowNum = Number.parseInt(posMatch[1], 10)
      const colNum = posMatch[2].charCodeAt(0) - 65
      if (rowNum >= 0 && rowNum < game.size && colNum >= 0 && colNum < game.size) {
        return { stage: 'position' as const, row: rowNum, col: colNum, letter: null }
      }
    }

    // Stage 3: Row + Column + Letter (e.g., "1AФ")
    const fullMatch = cleaned.match(/^(\d+)([A-Z])([А-ЯЁA-Z])$/)
    if (fullMatch) {
      const rowNum = Number.parseInt(fullMatch[1], 10)
      const colNum = fullMatch[2].charCodeAt(0) - 65
      const letterChar = fullMatch[3]
      if (rowNum >= 0 && rowNum < game.size && colNum >= 0 && colNum < game.size) {
        return { stage: 'complete' as const, row: rowNum, col: colNum, letter: letterChar }
      }
    }

    return { stage: 'invalid' as const, row: null, col: null, letter: null }
  }

  // Real-time parsing for visual feedback
  const parsed = parseUnifiedInput(unifiedInput)

  useInput((input, key) => {
    if (mode === 'idle') {
      if (input === 'm') {
        if (!isMyTurn) {
          setError('It\'s not your turn!')
          return
        }
        setMode('input')
        setStep('unified')
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
      setUnifiedInput('')
      setRow(null)
      setCol(null)
      setLetter('')
      setWord('')
      setError(null)
    }
  })

  const handleSubmit = async (value: string) => {
    if (step === 'unified') {
      const parsed = parseUnifiedInput(value)
      if (parsed.stage !== 'complete') {
        setError(`Invalid input. Format: {row}{col}{letter} like "1AФ", "2BШ" (row 0-${game.size - 1}, col A-${String.fromCharCode(64 + game.size)})`)
        return
      }
      setUnifiedInput(value)
      setRow(parsed.row)
      setCol(parsed.col)
      setLetter(parsed.letter!)
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
        if (row === null || col === null) {
          setError('Invalid position')
          setMode('idle')
          return
        }
        await onMove({
          playerId: currentPlayerName,
          position: { row, col },
          letter,
          word: value,
        })
        // Reset state
        setMode('idle')
        setUnifiedInput('')
        setRow(null)
        setCol(null)
        setLetter('')
        setWord('')
        setError(null)
      }
      catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to make move')
        setMode('idle')
        setUnifiedInput('')
        setRow(null)
        setCol(null)
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
          highlightRow={parsed.stage === 'row' ? parsed.row! : undefined}
          highlightPosition={parsed.stage === 'position' || parsed.stage === 'complete' ? { row: parsed.row!, col: parsed.col! } : undefined}
          previewLetter={parsed.stage === 'complete' ? { row: parsed.row!, col: parsed.col!, letter: parsed.letter! } : undefined}
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

          {step === 'unified' && (
            <Box marginTop={1} flexDirection="column">
              <Box marginBottom={1}>
                <Text dimColor>
                  Type all in one:
                  {' {'}
                  Row
                  {'}{'}
                  Col
                  {'}{'}
                  Letter
                  {'} '}
                  (e.g., "1AФ", "2BШ")
                </Text>
              </Box>
              <Box marginBottom={1}>
                <Text dimColor>
                  • First char: Row (0-
                  {game.size - 1}
                  ) → highlights row
                </Text>
              </Box>
              <Box marginBottom={1}>
                <Text dimColor>
                  • Second char: Column (A-
                  {String.fromCharCode(64 + game.size)}
                  ) → highlights cell
                </Text>
              </Box>
              <Box marginBottom={1}>
                <Text dimColor>
                  • Third char: Letter (А-Я) → shows in
                  {' '}
                  <Text color="red" bold>RED</Text>
                  {' '}
                  on board
                </Text>
              </Box>
              {parsed.stage === 'row' && (
                <Box marginBottom={1}>
                  <Text color="yellow">
                    → Row
                    {' '}
                    {parsed.row}
                    {' '}
                    selected
                  </Text>
                </Box>
              )}
              {parsed.stage === 'position' && (
                <Box marginBottom={1}>
                  <Text color="yellow">
                    → Position:
                    {' '}
                    {parsed.row}
                    {String.fromCharCode(65 + parsed.col!)}
                    {' '}
                    (Row
                    {' '}
                    {parsed.row}
                    , Col
                    {' '}
                    {String.fromCharCode(65 + parsed.col!)}
                    )
                  </Text>
                </Box>
              )}
              {parsed.stage === 'complete' && (
                <Box marginBottom={1}>
                  <Text color="green">
                    ✓ Complete:
                    {' '}
                    {parsed.row}
                    {String.fromCharCode(65 + parsed.col!)}
                    {' '}
                    +
                    <Text color="red" bold>
                      {parsed.letter}
                    </Text>
                  </Text>
                </Box>
              )}
              <Box>
                <Text>Input: </Text>
                <TextInput
                  value={unifiedInput}
                  onChange={(val) => {
                    setUnifiedInput(val)
                    setError(null)
                  }}
                  onSubmit={handleSubmit}
                />
              </Box>
            </Box>
          )}

          {step === 'word' && (
            <Box marginTop={1} flexDirection="column">
              <Box>
                <Text color="gray">
                  Position:
                  {' '}
                  {row}
                  {col !== null ? String.fromCharCode(65 + col) : '?'}
                  {' '}
                  | Letter:
                  {' '}
                  <Text color="red" bold>{letter.toUpperCase()}</Text>
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
