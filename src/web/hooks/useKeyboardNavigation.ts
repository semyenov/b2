import { useCallback } from 'react'

/**
 * Keyboard navigation hook
 *
 * Provides standardized keyboard event handlers for interactive elements
 * Extracted from Board.tsx and GamePanel.tsx to eliminate duplication
 *
 * @example
 * ```tsx
 * const { handleKeyDown } = useKeyboardNavigation()
 *
 * <button
 *   onClick={() => handleClick(value)}
 *   onKeyDown={e => handleKeyDown(e, () => handleClick(value), isDisabled)}
 * >
 * ```
 */
export function useKeyboardNavigation() {
  /**
   * Handle Enter or Space key to trigger action
   *
   * @param event - Keyboard event
   * @param onAction - Action to trigger on Enter/Space
   * @param isDisabled - Whether the element is disabled
   */
  const handleKeyDown = useCallback(
    (
      event: React.KeyboardEvent,
      onAction: () => void,
      isDisabled = false,
    ) => {
      if (isDisabled)
        return

      // Trigger action on Enter or Space
      if (event.key === 'Enter' || event.key === ' ') {
        event.preventDefault()
        onAction()
      }
    },
    [],
  )

  return {
    handleKeyDown,
  }
}
