import type { CreateGameBody, GameState, MoveBody, Suggestion } from './api'
import { Box, Text, useApp, useInput } from 'ink'
import Spinner from 'ink-spinner'
import React, { useEffect, useState } from 'react'
import { ApiClient } from './api'
import { CreateGame } from './components/CreateGame'
import { GameList } from './components/GameList'
import { GamePlay } from './components/GamePlay'
import { MainMenu } from './components/MainMenu'
import { Suggestions } from './components/Suggestions'

type Screen
  = | { type: 'menu' }
    | { type: 'list' }
    | { type: 'create' }
    | { type: 'play', gameId: string }
    | { type: 'suggestions', suggestions: Suggestion[] }

export function App() {
  const { exit } = useApp()
  const [screen, setScreen] = useState<Screen>({ type: 'menu' })
  const [games, setGames] = useState<GameState[]>([])
  const [currentGame, setCurrentGame] = useState<GameState | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [apiClient] = useState(() => new ApiClient())

  // Check server health on mount
  useEffect(() => {
    const checkHealth = async () => {
      try {
        await apiClient.getHealth()
      }
      catch {
        setError('Cannot connect to server. Make sure it\'s running on http://localhost:3000')
      }
    }
    void checkHealth()
  }, [apiClient])

  // Handle ESC key to clear errors
  useInput((input, key) => {
    if (key.escape && error) {
      setError(null)
    }
    if (screen.type === 'suggestions' && !loading) {
      setScreen({ type: 'play', gameId: currentGame!.id })
    }
  })

  const loadGames = async () => {
    setLoading(true)
    setError(null)
    try {
      const allGames = await apiClient.getGames()
      setGames(allGames)
    }
    catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load games')
    }
    finally {
      setLoading(false)
    }
  }

  const loadGame = async (gameId: string) => {
    setLoading(true)
    setError(null)
    try {
      const game = await apiClient.getGame(gameId)
      setCurrentGame(game)
      setScreen({ type: 'play', gameId })
    }
    catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load game')
      setScreen({ type: 'menu' })
    }
    finally {
      setLoading(false)
    }
  }

  const handleMenuSelect = async (action: 'list' | 'create' | 'exit') => {
    if (action === 'exit') {
      exit()
    }
    else if (action === 'list') {
      await loadGames()
      setScreen({ type: 'list' })
    }
    else if (action === 'create') {
      setScreen({ type: 'create' })
    }
  }

  const handleCreateGame = async (body: CreateGameBody) => {
    setLoading(true)
    setError(null)
    try {
      const game = await apiClient.createGame(body)
      setCurrentGame(game)
      setScreen({ type: 'play', gameId: game.id })
    }
    catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create game')
      setScreen({ type: 'menu' })
    }
    finally {
      setLoading(false)
    }
  }

  const handleGameSelect = async (game: GameState) => {
    await loadGame(game.id)
  }

  const handleMove = async (move: MoveBody) => {
    if (!currentGame)
      return

    setLoading(true)
    setError(null)
    try {
      const updatedGame = await apiClient.makeMove(currentGame.id, move)
      setCurrentGame(updatedGame)
    }
    catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to make move')
    }
    finally {
      setLoading(false)
    }
  }

  const handleRefresh = async () => {
    if (!currentGame)
      return
    await loadGame(currentGame.id)
  }

  const handleSuggest = async () => {
    if (!currentGame)
      return

    setLoading(true)
    setError(null)
    try {
      const suggestions = await apiClient.getSuggestions(currentGame.id, 10)
      setScreen({ type: 'suggestions', suggestions })
    }
    catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to get suggestions')
    }
    finally {
      setLoading(false)
    }
  }

  const handleBack = () => {
    setScreen({ type: 'menu' })
    setCurrentGame(null)
    setError(null)
  }

  return (
    <Box flexDirection="column" padding={1}>
      {loading && (
        <Box marginBottom={1}>
          <Text color="cyan">
            <Spinner type="dots" />
            {' '}
            Loading...
          </Text>
        </Box>
      )}

      {error && (
        <Box
          marginBottom={1}
          borderStyle="round"
          borderColor="red"
          padding={1}
        >
          <Text color="red">
            ❌
            {error}
          </Text>
          <Text dimColor> (Press ESC to dismiss)</Text>
        </Box>
      )}

      {!loading && screen.type === 'menu' && (
        <MainMenu onSelect={handleMenuSelect} />
      )}

      {!loading && screen.type === 'list' && (
        <GameList
          games={games}
          onSelect={handleGameSelect}
          onBack={handleBack}
        />
      )}

      {!loading && screen.type === 'create' && (
        <CreateGame onSubmit={handleCreateGame} onCancel={handleBack} />
      )}

      {!loading && screen.type === 'play' && currentGame && (
        <GamePlay
          game={currentGame}
          onMove={handleMove}
          onRefresh={handleRefresh}
          onSuggest={handleSuggest}
          onBack={handleBack}
        />
      )}

      {!loading && screen.type === 'suggestions' && (
        <Suggestions
          suggestions={screen.suggestions}
          onClose={() => setScreen({ type: 'play', gameId: currentGame!.id })}
        />
      )}
    </Box>
  )
}
