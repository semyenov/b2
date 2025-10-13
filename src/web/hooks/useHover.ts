import { useCallback, useState } from 'react'

/**
 * Generic hover state hook
 *
 * Manages hover state for any item type with mouse enter/leave handlers
 * Extracted from Board.tsx and GamePanel.tsx to eliminate duplication
 *
 * @example
 * ```tsx
 * const { hoveredItem, handleMouseEnter, handleMouseLeave } = useHover<string>()
 *
 * <button
 *   onMouseEnter={() => handleMouseEnter('item1')}
 *   onMouseLeave={handleMouseLeave}
 * >
 *   Item 1
 * </button>
 * ```
 */
export function useHover<T = unknown>() {
  const [hoveredItem, setHoveredItem] = useState<T | null>(null)

  const handleMouseEnter = useCallback((item: T) => {
    setHoveredItem(item)
  }, [])

  const handleMouseLeave = useCallback(() => {
    setHoveredItem(null)
  }, [])

  const isHovered = useCallback((item: T) => {
    return hoveredItem === item
  }, [hoveredItem])

  return {
    hoveredItem,
    handleMouseEnter,
    handleMouseLeave,
    isHovered,
  }
}
