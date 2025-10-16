import { A11Y_LABELS } from '@constants/game'
import { cn } from '@utils/classNames'
import { memo } from 'react'

export interface LetterButtonProps {
  letter: string
  isSelected: boolean
  isHovered: boolean
  isDisabled: boolean
  onClick: () => void
  onKeyDown: (e: React.KeyboardEvent) => void
  onMouseEnter: () => void
  onMouseLeave: () => void
}

/**
 * Letter Button Component
 * Individual alphabet letter button with states and interactions
 */
export const LetterButton = memo<LetterButtonProps>(({
  letter,
  isSelected,
  isHovered,
  isDisabled,
  onClick,
  onKeyDown,
  onMouseEnter,
  onMouseLeave,
}) => {
  // Determine button style based on state
  const getButtonStyle = () => {
    if (isSelected) {
      return 'bg-user-600 border-user-300 text-white shadow-lg ring-2 ring-user-400'
    }
    if (isHovered) {
      return 'bg-user-400 border-user-400 text-surface-900 shadow-lg ring-2 ring-user-500'
    }
    if (isDisabled) {
      return 'bg-surface-800 text-surface-500 cursor-not-allowed border-surface-700'
    }
    return 'bg-surface-800 text-surface-300 border-surface-700 hover:bg-surface-700 hover:border-user-400 hover:ring-2 hover:ring-user-400 hover:shadow-lg hover:shadow-user-400/10 hover:scale-[1.02]'
  }

  return (
    <button
      type="button"
      onClick={onClick}
      onKeyDown={onKeyDown}
      onMouseEnter={onMouseEnter}
      onMouseLeave={onMouseLeave}
      disabled={isDisabled}
      aria-label={isSelected ? A11Y_LABELS.LETTER_BUTTON_SELECTED(letter) : A11Y_LABELS.LETTER_BUTTON(letter)}
      aria-pressed={isSelected}
      className={cn(
        'w-full aspect-square font-black text-xl sm:text-2xl transition-all duration-300 border-2',
        'group relative',
        getButtonStyle(),
        !isDisabled && 'cursor-pointer',
      )}
    >
      {letter}
      {/* Hover effect overlay */}
      {!isDisabled && (
        <div className="absolute inset-0 bg-user-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
      )}
    </button>
  )
})

LetterButton.displayName = 'LetterButton'
