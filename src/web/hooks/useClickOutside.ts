import type { RefObject } from 'react'
import { useEffect, useRef } from 'react'

/**
 * Custom hook to detect clicks outside of a referenced element
 *
 * @param callback - Function to call when clicking outside
 * @param enabled - Whether the hook is active (default: true)
 *
 * @example
 * ```tsx
 * const ref = useClickOutside(() => console.log('Clicked outside!'))
 * return <div ref={ref}>Content</div>
 * ```
 */
export function useClickOutside<T extends HTMLElement = HTMLElement>(
  callback: () => void,
  enabled: boolean = true,
  excludeRefs: RefObject<HTMLElement | null>[] = [],
): React.RefObject<T | null> {
  const ref = useRef<T | null>(null)

  useEffect(() => {
    if (!enabled) {
      return
    }

    const handleClickOutside = (event: MouseEvent) => {
      // Ignore clicks inside any of the excluded elements
      if (excludeRefs.some(r => r.current && r.current.contains(event.target as Node))) {
        return
      }
      // Check if click is outside the referenced element
      if (ref.current && !ref.current.contains(event.target as Node)) {
        callback()
      }
    }

    // Add event listener on mount
    document.addEventListener('mousedown', handleClickOutside)

    // Cleanup on unmount
    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [callback, enabled, excludeRefs])

  return ref
}
