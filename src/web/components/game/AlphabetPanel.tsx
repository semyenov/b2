import { RUSSIAN_ALPHABET } from '@constants/game'
import { UI_MESSAGES } from '@constants/messages'
import { useHover } from '@hooks/useHover'
import { useKeyboardNavigation } from '@hooks/useKeyboardNavigation'
import { isLetterButtonDisabled } from '@utils/uiHelpers'
import { memo } from 'react'
import { LetterButton } from './LetterButton'
import { PanelContainer } from './PanelContainer'

export interface AlphabetPanelProps {
  selectedLetter?: string
  disabled?: boolean
  selectedCell?: { row: number, col: number }
  onLetterSelect?: (letter: string) => void
}

/**
 * Alphabet Panel Component
 * Displays Russian alphabet grid for letter selection
 * Used in game play when player selects an empty cell
 */
export const AlphabetPanel = memo<AlphabetPanelProps>(({
  selectedLetter,
  disabled,
  selectedCell,
  onLetterSelect,
}) => {
  const { hoveredItem: hoveredLetter, handleMouseEnter, handleMouseLeave } = useHover<string>()
  const { handleKeyDown } = useKeyboardNavigation()

  return (
    <PanelContainer>
      {/* Alphabet Grid */}
      <div
        className="flex-1 min-h-0 flex items-center justify-center px-4 py-4"
        role="group"
        aria-label={UI_MESSAGES.ALPHABET_PANEL_ARIA}
      >
        <div className="alphabet-grid grid grid-cols-6 gap-2 h-full">
          {RUSSIAN_ALPHABET.map((letter) => {
            const isDisabled = !!disabled
            const isSelected = selectedLetter === letter
            const buttonDisabled = isLetterButtonDisabled(isDisabled, selectedCell, selectedLetter, letter)
            const isHovered = hoveredLetter === letter && !isDisabled && !!selectedCell && !selectedLetter

            return (
              <LetterButton
                key={letter}
                letter={letter}
                isSelected={isSelected}
                isHovered={isHovered}
                isDisabled={buttonDisabled}
                onClick={() => onLetterSelect?.(letter)}
                onKeyDown={e => handleKeyDown(e, () => onLetterSelect?.(letter), buttonDisabled)}
                onMouseEnter={() => handleMouseEnter(letter)}
                onMouseLeave={handleMouseLeave}
              />
            )
          })}
        </div>
      </div>
    </PanelContainer>
  )
})

AlphabetPanel.displayName = 'AlphabetPanel'
