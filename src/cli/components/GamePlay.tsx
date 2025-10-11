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

  return (
    <Box flexDirection="column">
      <Box marginBottom={1} flexDirection="column">
        <Box flexDirection="column">
          <Box>
            <Text bold color="magenta">
              ID игры (поделитесь им для приглашения игроков):
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
              Играете как:
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
                ⏳ Ожидание хода игрока
                {' '}
                {currentPlayer}
                ...
              </Text>
            </Box>
          )}
          {isMyTurn && currentPlayerName && (
            <Box marginBottom={1}>
              <Text color="green" bold>
                ▶ Ваш ход! Сделайте ход.
              </Text>
            </Box>
          )}
          <Text bold>Команды:</Text>
          <Text>
            {' '}
            [м] Ход  [р] Обновить  [с] Подсказки  [б] Назад
          </Text>
        </Box>
      )}

      {mode === 'input' && (
        <Box marginTop={1} flexDirection="column" borderStyle="single" padding={1}>
          <Text bold color="cyan">Сделать ход</Text>

          {step === 'unified' && (
            <Box marginTop={1} flexDirection="column">
              <Box marginBottom={1}>
                <Text dimColor>
                  Введите всё вместе:
                  {' {'}
                  Ряд
                  {'}{'}
                  Кол
                  {'}{'}
                  Буква
                  {'} '}
                  (например, "1АФ", "2БШ")
                </Text>
              </Box>
              <Box marginBottom={1}>
                <Text dimColor>
                  • Первый символ: Ряд (0-
                  {game.size - 1}
                  ) → подсветит ряд
                </Text>
              </Box>
              <Box marginBottom={1}>
                <Text dimColor>
                  • Второй символ: Колонка (А-
                  {String.fromCharCode(1039 + game.size)}
                  ) → подсветит ячейку
                </Text>
              </Box>
              <Box marginBottom={1}>
                <Text dimColor>
                  • Третий символ: Буква (А-Я) → покажет
                  {' '}
                  <Text color="red" bold>КРАСНЫМ</Text>
                  {' '}
                  на доске
                </Text>
              </Box>
              {parsed.stage === 'row' && (
                <Box marginBottom={1}>
                  <Text color="yellow">
                    → Ряд
                    {' '}
                    {parsed.row}
                    {' '}
                    выбран
                  </Text>
                </Box>
              )}
              {parsed.stage === 'position' && (
                <Box marginBottom={1}>
                  <Text color="yellow">
                    → Позиция:
                    {' '}
                    {parsed.row}
                    {String.fromCharCode(1040 + parsed.col!)}
                    {' '}
                    (Ряд
                    {' '}
                    {parsed.row}
                    , Кол
                    {' '}
                    {String.fromCharCode(1040 + parsed.col!)}
                    )
                  </Text>
                </Box>
              )}
              {parsed.stage === 'complete' && (
                <Box marginBottom={1}>
                  <Text color="green">
                    ✓ Готово:
                    {' '}
                    {parsed.row}
                    {String.fromCharCode(1040 + parsed.col!)}
                    {' '}
                    +
                    <Text color="red" bold>
                      {parsed.letter}
                    </Text>
                  </Text>
                </Box>
              )}
              <Box>
                <Text>Ввод: </Text>
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
                  Позиция:
                  {' '}
                  {row}
                  {col !== null ? String.fromCharCode(1040 + col) : '?'}
                  {' '}
                  | Буква:
                  {' '}
                  <Text color="red" bold>{letter.toUpperCase()}</Text>
                </Text>
              </Box>
              <Box marginTop={1}>
                <Text>Слово: </Text>
                <TextInput value={word} onChange={setWord} onSubmit={handleSubmit} />
              </Box>
            </Box>
          )}

          <Box marginTop={1}>
            <Text dimColor>Нажмите ESC для отмены</Text>
          </Box>
        </Box>
      )}
    </Box>
  )
}
