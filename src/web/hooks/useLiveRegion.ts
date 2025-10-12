import type { GameState } from '../lib/client'
import { useEffect, useRef, useState } from 'react'
import { A11Y_LABELS } from '../constants/game'

interface UseLiveRegionOptions {
  currentGame: GameState | null
  screen: string
  isMyTurn: () => boolean
}

/**
 * Custom hook to manage ARIA live region announcements
 * Handles accessibility notifications for screen readers
 */
export function useLiveRegion({
  currentGame,
  screen,
  isMyTurn,
}: UseLiveRegionOptions): string {
  const [liveRegionMessage, setLiveRegionMessage] = useState<string>('')
  const previousTurnRef = useRef<number | null>(null)

  useEffect(() => {
    if (!currentGame || screen !== 'play') {
      return
    }

    const currentTurn = currentGame.currentPlayerIndex
    if (previousTurnRef.current !== currentTurn) {
      previousTurnRef.current = currentTurn
      const currentPlayer = currentGame.players[currentTurn]

      if (isMyTurn()) {
        setLiveRegionMessage(A11Y_LABELS.YOUR_TURN)
      }
      else {
        setLiveRegionMessage(A11Y_LABELS.WAITING_FOR_OPPONENT(currentPlayer))
      }
    }
  }, [currentGame, screen, isMyTurn])

  return liveRegionMessage
}
