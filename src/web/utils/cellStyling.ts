import { cn } from './classNames'

/**
 * Cell styling utilities
 *
 * Extracted from Board.tsx to separate styling logic from component
 * Provides pure function for board cell CSS class names
 */

interface GetCellClassNameOptions {
  selected: boolean
  inPath: boolean
  isInHoveredPath: boolean
  isInRecentOpponentPath: boolean
  isNewLetterInPath: boolean
  isNewLetterInOpponentPath: boolean
  isNewLetterInHoveredPath: boolean
  isHoveredWordFromUser: boolean
  hasCell: boolean
  canClick: boolean
  isHovered: boolean
}

/**
 * Generate CSS classes for board cell based on state
 *
 * @param options - Cell state options
 * @param options.selected - Whether cell is currently selected
 * @param options.inPath - Whether cell is part of current word path
 * @param options.isInHoveredPath - Whether cell is part of hovered word path (from Sidebar)
 * @param options.isInRecentOpponentPath - Whether cell is part of recent opponent move (2s highlight)
 * @param options.isNewLetterInPath - Whether this cell is the newly placed letter in current path
 * @param options.isNewLetterInOpponentPath - Whether this cell is the newly placed letter in opponent path
 * @param options.isNewLetterInHoveredPath - Whether this cell is the newly placed letter in hovered path
 * @param options.hasCell - Whether cell contains a letter
 * @param options.canClick - Whether cell can be clicked
 * @param options.isHovered - Whether cell is being hovered
 * @returns Combined className string
 */
export function getCellClassName({
  selected,
  inPath,
  isInHoveredPath,
  isInRecentOpponentPath,
  isNewLetterInPath,
  isNewLetterInOpponentPath,
  isNewLetterInHoveredPath,
  isHoveredWordFromUser,
  hasCell,
  canClick,
  isHovered,
}: GetCellClassNameOptions): string {
  return cn(
    // Base classes - flexible sizing
    'aspect-square w-full border flex items-center justify-center text-[length:calc(var(--text-resp-board)*0.85)] font-black transition-all duration-200 relative leading-none',

    // State-based styling (priority order: selected > inPath > isInRecentOpponentPath > isInHoveredPath > hasCell > empty)
    {
      'bg-emerald-900 border-emerald-400 text-white shadow-depth-3 ring-4 ring-emerald-500/80': selected,
      // User moves (current path + user's hovered words): new letter is darker, existing letters are brighter
      'bg-emerald-800 border-emerald-300 text-white shadow-depth-3 ring-4 ring-emerald-400/70': !selected && ((inPath && isNewLetterInPath) || (!inPath && !isInRecentOpponentPath && isInHoveredPath && isHoveredWordFromUser && isNewLetterInHoveredPath)),
      'bg-emerald-600 border-emerald-200 text-white shadow-depth-3 ring-2 ring-emerald-300/50': !selected && ((inPath && !isNewLetterInPath) || (!inPath && !isInRecentOpponentPath && isInHoveredPath && isHoveredWordFromUser && !isNewLetterInHoveredPath)),
      // Opponent moves (recent + opponent's hovered words): new letter is darker, existing letters are brighter
      'bg-amber-800 border-amber-300 text-white shadow-depth-3 ring-4 ring-amber-400/90 animate-pulse shadow-amber-500/40': !selected && !inPath && isInRecentOpponentPath && isNewLetterInOpponentPath,
      'bg-amber-600 border-amber-200 text-white shadow-depth-3 ring-2 ring-amber-300/50 animate-pulse': !selected && !inPath && isInRecentOpponentPath && !isNewLetterInOpponentPath,
      'bg-amber-800 border-amber-300 text-white shadow-depth-3 ring-4 ring-amber-400/70': !selected && !inPath && !isInRecentOpponentPath && isInHoveredPath && !isHoveredWordFromUser && isNewLetterInHoveredPath,
      'bg-amber-600 border-amber-200 text-white shadow-depth-2 ring-2 ring-amber-300/50': !selected && !inPath && !isInRecentOpponentPath && isInHoveredPath && !isHoveredWordFromUser && !isNewLetterInHoveredPath,
      'bg-slate-800 border-slate-700 text-slate-300 shadow-depth-2': !selected && !inPath && !isInRecentOpponentPath && !isInHoveredPath && hasCell,
      'bg-slate-900 border-slate-700 text-slate-600': !selected && !inPath && !isInRecentOpponentPath && !isInHoveredPath && !hasCell,
    },

    // Interactive styling
    {
      'cursor-pointer hover:shadow-depth-3 hover:transform hover:scale-105 hover:bg-slate-700 hover:z-10 hover:border-yellow-400 hover:ring-2 hover:ring-yellow-500/50': canClick,
      'cursor-default': !canClick,
    },

    // Hover ring
    {
      'ring-4 ring-yellow-400': isHovered && canClick && selected,
      'ring-4 ring-yellow-400 bg-slate-700 border-yellow-500': isHovered && canClick && !selected,
    },
  )
}
