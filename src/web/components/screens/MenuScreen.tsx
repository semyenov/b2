import { UI_MESSAGES } from '@constants/messages'
import { memo } from 'react'
import { Button, Card } from '../ui'

interface MenuScreenProps {
  onQuickStart: () => void
  onQuickStartVsAI: () => void
  onCreateGame: () => void
  onJoinGame: () => void
}

/**
 * MenuScreen - Main menu layout
 *
 * Extracted from App.tsx to separate screen layout from routing logic
 * Provides the main menu interface with game mode selection
 */
export const MenuScreen = memo(({
  onQuickStart,
  onQuickStartVsAI,
  onCreateGame,
  onJoinGame,
}: MenuScreenProps) => {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen px-4">
      {/* Hero Section */}
      <div className="text-center mb-12">
        <h1 className="text-6xl md:text-7xl font-black text-transparent bg-clip-text bg-gradient-to-r from-info-400 via-info-400 to-purple-500 mb-4 tracking-tight drop-shadow-2xl">
          {UI_MESSAGES.GAME_TITLE}
        </h1>
        <p className="text-gray-400 text-base md:text-lg font-medium tracking-wide">
          {UI_MESSAGES.GAME_SUBTITLE}
        </p>
      </div>

      {/* Menu Card */}
      <div className="w-full max-w-md">
        <Card variant="gradient" padding="spacious">
          <div className="space-y-3">
            <Button
              variant="success"
              size="lg"
              leftIcon="⚡"
              fullWidth
              onClick={onQuickStart}
            >
              {UI_MESSAGES.QUICK_START}
            </Button>

            <Button
              variant="warning"
              size="lg"
              leftIcon="🤖"
              fullWidth
              onClick={onQuickStartVsAI}
            >
              {UI_MESSAGES.PLAY_VS_AI}
            </Button>

            {/* Divider */}
            <div className="flex items-center gap-3 py-2">
              <div className="flex-1 h-px bg-gradient-to-r from-transparent via-gray-600 to-transparent" />
              <span className="text-gray-500 text-sm font-medium">{UI_MESSAGES.OR}</span>
              <div className="flex-1 h-px bg-gradient-to-r from-transparent via-gray-600 to-transparent" />
            </div>

            <Button
              variant="primary"
              size="md"
              leftIcon="➕"
              fullWidth
              onClick={onCreateGame}
            >
              {UI_MESSAGES.CREATE_GAME}
            </Button>

            <Button
              variant="secondary"
              size="md"
              leftIcon="🎮"
              fullWidth
              onClick={onJoinGame}
            >
              {UI_MESSAGES.JOIN_GAME}
            </Button>
          </div>
        </Card>

        {/* Version/Footer */}
        <div className="text-center mt-6 text-gray-600 text-sm">
          {UI_MESSAGES.VERSION}
        </div>
      </div>
    </div>
  )
})

MenuScreen.displayName = 'MenuScreen'
