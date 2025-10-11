import type { CreateGameBody, GameState, MoveBody, Suggestion } from './api'
import { Box, Text, useApp, useInput } from 'ink'
import Spinner from 'ink-spinner'
import React, { useEffect, useRef, useState } from 'react'
import { ApiClient } from './api'
import { CreateGame } from './components/CreateGame'
import { GameList } from './components/GameList'
import { GamePlay } from './components/GamePlay'
import { JoinGame } from './components/JoinGame'
import { MainMenu } from './components/MainMenu'
import { Suggestions } from './components/Suggestions'

type Screen
  = | { type: 'menu' }
    | { type: 'list' }
    | { type: 'create' }
    | { type: 'join' }
    | { type: 'play', gameId: string }
    | { type: 'suggestions', suggestions: Suggestion[] }

export function App() {
  const { exit } = useApp()
  const [screen, setScreen] = useState<Screen>({ type: 'menu' })
  const [games, setGames] = useState<GameState[]>([])
  const [currentGame, setCurrentGame] = useState<GameState | null>(null)
  const [currentPlayerName, setCurrentPlayerName] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [apiClient] = useState(() => new ApiClient())
  const wsRef = useRef<WebSocket | null>(null)

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

  // WebSocket connection management
  useEffect(() => {
    if (screen.type === 'play' && screen.gameId) {
      // Connect WebSocket for real-time updates using gameId from screen, not currentGame
      // This prevents reconnection when currentGame updates
      wsRef.current = apiClient.connectWebSocket(screen.gameId, (updatedGame) => {
        setCurrentGame(updatedGame)
      })

      // Periodic refresh to ensure sync (every 5 seconds)
      const refreshInterval = setInterval(async () => {
        try {
          const latestGame = await apiClient.getGame(screen.gameId)
          setCurrentGame(latestGame)
        }
        catch {
          // Ignore errors in background refresh
        }
      }, 5000)

      return () => {
        // Cleanup WebSocket on unmount or when leaving play screen
        if (wsRef.current) {
          wsRef.current.close()
          wsRef.current = null
        }
        clearInterval(refreshInterval)
      }
    }
  }, [screen, apiClient])

  // Handle ESC key to clear errors
  useInput((input, key) => {
    if (key.escape && error) {
      setError(null)
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

  const loadGame = async (gameId: string, playerName?: string) => {
    setLoading(true)
    setError(null)
    try {
      const game = await apiClient.getGame(gameId)
      setCurrentGame(game)
      if (playerName) {
        setCurrentPlayerName(playerName)
      }
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

  const handleMenuSelect = async (action: 'list' | 'create' | 'join' | 'quick5x5' | 'exit') => {
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
    else if (action === 'join') {
      setScreen({ type: 'join' })
    }
    else if (action === 'quick5x5') {
      await handleQuickStart5x5()
    }
  }

  const handleQuickStart5x5 = async () => {
    setLoading(true)
    setError(null)
    try {
      // Get a random 5-letter word from the dictionary
      const words = await apiClient.getRandomWords(5, 1)
      if (!words || words.length === 0) {
        setError('No 5-letter words available in dictionary. Please use custom game creation.')
        setScreen({ type: 'menu' })
        return
      }

      const randomWord = words[0]
      const playerName = 'Player 1'

      // Create game with the random word
      const game = await apiClient.createGame({
        size: 5,
        baseWord: randomWord,
        players: [playerName, 'Player 2'],
      })

      // Fetch the game again to ensure we have the latest state
      const latestGame = await apiClient.getGame(game.id)
      setCurrentGame(latestGame)
      setCurrentPlayerName(playerName)
      setScreen({ type: 'play', gameId: game.id })
    }
    catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to start quick game')
      setScreen({ type: 'menu' })
    }
    finally {
      setLoading(false)
    }
  }

  const handleCreateGame = async (body: CreateGameBody, playerName: string) => {
    setLoading(true)
    setError(null)
    try {
      const game = await apiClient.createGame(body)
      // Fetch the game again to ensure we have the latest state
      const latestGame = await apiClient.getGame(game.id)
      setCurrentGame(latestGame)
      setCurrentPlayerName(playerName)
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

  const handleJoinGame = async (gameId: string, playerName: string) => {
    setLoading(true)
    setError(null)
    try {
      // First load the game to see current state
      const game = await apiClient.getGame(gameId)

      // Check if this player name is already in the game
      if (game.players.includes(playerName)) {
        // Player is already in the game, just join with their existing name
        setCurrentGame(game)
        setCurrentPlayerName(playerName)
        setScreen({ type: 'play', gameId })
        return
      }

      // Find placeholder players (Player 2, Player 3, etc.)
      const placeholderPlayer = game.players.find(p => p.startsWith('Player ') && p !== 'Player 1')

      if (placeholderPlayer) {
        // Replace the placeholder with the actual player name
        try {
          await apiClient.updatePlayerName(gameId, placeholderPlayer, playerName)
          // Refetch the game to ensure we have the latest state
          const latestGame = await apiClient.getGame(gameId)
          setCurrentGame(latestGame)
          setCurrentPlayerName(playerName)
          setScreen({ type: 'play', gameId })
        }
        catch (updateErr) {
          // If update fails (e.g., name already taken), join as observer
          setError(`Could not join as player: ${updateErr instanceof Error ? updateErr.message : 'Unknown error'}`)
          setCurrentGame(game)
          setCurrentPlayerName(null) // Join as observer
          setScreen({ type: 'play', gameId })
        }
      }
      else {
        // No placeholder slots available, join as observer
        setCurrentGame(game)
        setCurrentPlayerName(null) // Join as observer
        setScreen({ type: 'play', gameId })
      }
    }
    catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to join game')
      setScreen({ type: 'menu' })
    }
    finally {
      setLoading(false)
    }
  }

  const handleGameWatch = async (game: GameState) => {
    // Watch game without joining as a player
    await loadGame(game.id)
    setCurrentPlayerName(null) // No player name = observer
  }

  const handleGameJoin = async (game: GameState, playerName: string) => {
    // Join game as a player
    await handleJoinGame(game.id, playerName)
  }

  const handleMove = async (move: MoveBody) => {
    if (!currentGame)
      return

    setLoading(true)
    setError(null)
    try {
      await apiClient.makeMove(currentGame.id, move)
      // Immediately fetch the latest game state to ensure consistency
      const latestGame = await apiClient.getGame(currentGame.id)
      setCurrentGame(latestGame)
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
    setCurrentPlayerName(null)
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
          onWatch={handleGameWatch}
          onJoin={handleGameJoin}
          onBack={handleBack}
        />
      )}

      {!loading && screen.type === 'create' && (
        <CreateGame onSubmit={handleCreateGame} onCancel={handleBack} />
      )}

      {!loading && screen.type === 'join' && (
        <JoinGame onSubmit={handleJoinGame} onCancel={handleBack} />
      )}

      {!loading && screen.type === 'play' && currentGame && (
        <GamePlay
          game={currentGame}
          currentPlayerName={currentPlayerName}
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
