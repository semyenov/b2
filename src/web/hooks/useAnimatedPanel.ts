import { ANIMATION_DURATION_MS } from '@constants/ui'

import { useEffect, useState } from 'react'

/**
 * useAnimatedPanel Hook
 *
 * Manages panel visibility state with smooth slide-up/slide-down animations.
 * Provides controlled visibility state and animation flags for CSS transitions.
 *
 * **Design Pattern:**
 * - Separates animation orchestration from component rendering
 * - Handles timing for enter/exit animations
 * - Prevents premature DOM removal during exit animations
 *
 * @param shouldShow - External condition that determines if panel should be visible
 * @returns Object containing visibility flags and panel state
 *
 * @example
 * ```tsx
 * function GamePanel({ showSuggestions, selectedCell }) {
 *   const shouldShowPanel = showSuggestions || !!selectedCell
 *   const { isVisible, isClosing } = useAnimatedPanel(shouldShowPanel)
 *
 *   if (!isVisible) return null
 *
 *   return (
 *     <div className={isClosing ? 'animate-slide-down' : 'animate-slide-up'}>
 *       Panel content
 *     </div>
 *   )
 * }
 * ```
 */
export function useAnimatedPanel(shouldShow: boolean) {
  const [isVisible, setIsVisible] = useState(false)
  const [isClosing, setIsClosing] = useState(false)

  useEffect(() => {
    if (shouldShow) {
      // Show immediately with enter animation
      setIsVisible(true)
      setIsClosing(false)
      return undefined
    }
    else if (isVisible) {
      // Start closing animation
      setIsClosing(true)

      // Wait for animation to complete before hiding
      const timer = setTimeout(() => {
        setIsVisible(false)
        setIsClosing(false)
      }, ANIMATION_DURATION_MS)

      return () => clearTimeout(timer)
    }
    return undefined
  }, [shouldShow, isVisible])

  return {
    /**
     * Whether the panel should be mounted in the DOM
     * `false` means the component should not render
     */
    isVisible,

    /**
     * Whether the panel is currently playing the exit animation
     * Use this to apply exit animation CSS classes
     */
    isClosing,
  }
}
