import type { UseFullscreenReturn } from '@types'
import { useEffect, useState } from 'react'
import { logger } from '@utils/logger'

/**
 * Custom hook for managing fullscreen mode
 * Provides cross-browser fullscreen toggle functionality
 *
 * @returns Object containing fullscreen state and toggle function
 */
export function useFullscreen(): UseFullscreenReturn {
  const [isFullscreen, setIsFullscreen] = useState(false)

  // Update state when fullscreen changes (via F11, ESC, etc.)
  useEffect(() => {
    function handleFullscreenChange() {
      setIsFullscreen(!!document.fullscreenElement)
    }

    document.addEventListener('fullscreenchange', handleFullscreenChange)
    return () => document.removeEventListener('fullscreenchange', handleFullscreenChange)
  }, [])

  /**
   * Toggle fullscreen mode on/off
   */
  function toggleFullscreen() {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().catch((err) => {
        logger.error('Failed to enter fullscreen', err)
      })
    }
    else {
      document.exitFullscreen().catch((err) => {
        logger.error('Failed to exit fullscreen', err)
      })
    }
  }

  return {
    isFullscreen,
    toggleFullscreen,
  }
}
