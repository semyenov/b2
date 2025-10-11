import type { GameState, MoveBody } from '../api'
import { Box, Text, useInput } from 'ink'
import TextInput from 'ink-text-input'
import React, { useState } from 'react'
import { Board } from './Board'
import { FullScreenLayout } from './FullScreenLayout'
import { StatusBar } from './StatusBar'
import { UsedWords } from './UsedWords'

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

  // Parse unified input progressively: "1" → "1А" → "1АФ"
  const parseUnifiedInput = (input: string) => {
    const cleaned = input.trim().toUpperCase()

    // Stage 1: Just row number (e.g., "1")
    if (cleaned.length === 1 && /^\d$/.test(cleaned)) {
      const rowNum = Number.parseInt(cleaned, 10)
      if (rowNum >= 0 && rowNum < game.size) {
        return { stage: 'row' as const, row: rowNum, col: null, letter: null }
      }
    }

    // Stage 2: Row + Column (e.g., "1А") - Russian letters
    const posMatch = cleaned.match(/^(\d+)([А-ЯЁ])$/)
    if (posMatch) {
      const rowNum = Number.parseInt(posMatch[1], 10)
      const colNum = posMatch[2].charCodeAt(0) - 1040 // А=1040 in Unicode
      if (rowNum >= 0 && rowNum < game.size && colNum >= 0 && colNum < game.size) {
        return { stage: 'position' as const, row: rowNum, col: colNum, letter: null }
      }
    }

    // Stage 3: Row + Column + Letter (e.g., "1АФ")
    const fullMatch = cleaned.match(/^(\d+)([А-ЯЁ])([А-ЯЁ])$/)
    if (fullMatch) {
      const rowNum = Number.parseInt(fullMatch[1], 10)
      const colNum = fullMatch[2].charCodeAt(0) - 1040 // А=1040 in Unicode
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
      // Support both Latin and Cyrillic keyboard layouts
      if (input === 'm' || input === 'м' || input === 'ь') { // m, м (Russian m), ь (Russian m on some layouts)
        if (!isMyTurn) {
          setError('Сейчас не ваш ход!')
          return
        }
        setMode('input')
        setStep('unified')
        setError(null)
      }
      else if (input === 'r' || input === 'р' || input === 'к') { // r, р (Russian r), к (Russian r on some layouts)
        void onRefresh()
      }
      else if (input === 's' || input === 'с' || input === 'ы') { // s, с (Russian s), ы (Russian s on some layouts)
        void onSuggest()
      }
      else if (input === 'b' || input === 'б' || input === 'и') { // b, б (Russian b), и (Russian b on some layouts)
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
        setError(`Неверный формат. Введите: {ряд}{колонка}{буква} например "1АФ", "2БШ" (ряд 0-${game.size - 1}, кол А-${String.fromCharCode(1039 + game.size)})`)
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
        setError('Слово не может быть пустым')
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

  // Build input prompt for status bar
  const getInputPrompt = () => {
    if (step === 'unified') {
      if (parsed.stage === 'row') {
        return `Ряд ${parsed.row} выбран → добавьте колонку (А-${String.fromCharCode(1039 + game.size)})`
      }
      if (parsed.stage === 'position') {
        return `Позиция ${parsed.row}${String.fromCharCode(1040 + parsed.col!)} → добавьте букву (А-Я)`
      }
      if (parsed.stage === 'complete') {
        return `✓ ${parsed.row}${String.fromCharCode(1040 + parsed.col!)} + ${parsed.letter} → нажмите Enter`
      }
      return `Введите: {ряд}{колонка}{буква} например "1АФ" (ряд 0-${game.size - 1}, кол А-${String.fromCharCode(1039 + game.size)})`
    }
    else {
      return `Позиция: ${row}${col !== null ? String.fromCharCode(1040 + col) : '?'} | Буква: ${letter.toUpperCase()} → Введите слово`
    }
  }

  return (
    <FullScreenLayout
      header={(
        <Box flexDirection="column" width="100%">
          {/* Game ID */}
          <Box paddingX={2} paddingY={1} justifyContent="center" borderStyle="double" borderColor="magenta">
            <Text bold color="magenta">ID: </Text>
            <Text bold color="cyan">{game.id}</Text>
            {currentPlayerName && (
              <>
                <Text dimColor> | </Text>
                <Text>Вы: </Text>
                <Text bold color="green">{currentPlayerName}</Text>
              </>
            )}
          </Box>

          {/* Scores */}
          <Box paddingX={2} paddingY={1} justifyContent="space-around" borderStyle="single" borderColor="cyan">
            {game.players.map((player) => {
              const score = game.scores[player] || 0
              const isCurrent = player === currentPlayer
              return (
                <Box key={player} gap={1}>
                  <Text color={isCurrent ? 'yellow' : 'white'} bold={isCurrent}>
                    {isCurrent ? '> ' : ''}
                    {player}
                    :
                  </Text>
                  <Text bold color={isCurrent ? 'yellow' : 'green'}>{score}</Text>
                </Box>
              )
            })}
          </Box>
        </Box>
      )}
      footer={(
        <StatusBar
          mode={mode}
          isMyTurn={isMyTurn}
          currentPlayer={currentPlayer}
          currentPlayerName={currentPlayerName}
          error={error}
          loading={loading}
          inputPrompt={mode === 'input' ? getInputPrompt() : undefined}
        />
      )}
    >
      <Box flexDirection="column" width="100%">
        {/* Board - takes center space */}
        <Box paddingY={1}>
          <Board
            game={game}
            highlightRow={parsed.stage === 'row' ? parsed.row! : undefined}
            highlightPosition={parsed.stage === 'position' || parsed.stage === 'complete' ? { row: parsed.row!, col: parsed.col! } : undefined}
            previewLetter={parsed.stage === 'complete' ? { row: parsed.row!, col: parsed.col!, letter: parsed.letter! } : undefined}
          />
        </Box>

        {/* Used Words - side by side below board */}
        <Box paddingX={2} paddingY={1}>
          <UsedWords game={game} />
        </Box>

        {/* Input area when in input mode */}
        {mode === 'input' && (
          <Box paddingX={2} flexDirection="column">
            {step === 'unified' && (
              <Box>
                <Text bold color="cyan">Ввод: </Text>
                <TextInput
                  value={unifiedInput}
                  onChange={(val) => {
                    setUnifiedInput(val)
                    setError(null)
                  }}
                  onSubmit={handleSubmit}
                />
              </Box>
            )}

            {step === 'word' && (
              <Box>
                <Text bold color="cyan">Слово: </Text>
                <TextInput value={word} onChange={setWord} onSubmit={handleSubmit} />
              </Box>
            )}
          </Box>
        )}
      </Box>
    </FullScreenLayout>
  )
}
