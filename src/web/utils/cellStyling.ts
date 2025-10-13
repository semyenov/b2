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
 * @param options.hasCell - Whether cell contains a letter
 * @param options.canClick - Whether cell can be clicked
 * @param options.isHovered - Whether cell is being hovered
 * @returns Combined className string
 */
export function getCellClassName({
  selected,
  inPath,
  hasCell,
  canClick,
  isHovered,
}: GetCellClassNameOptions): string {
  return cn(
    // Base classes - flexible sizing
    'aspect-square w-full border-2 flex items-center justify-center text-[var(--text-resp-board)] font-black transition-all duration-200 relative leading-none',

    // State-based styling
    {
      'bg-blue-600 border-blue-300 text-white shadow-depth-3 ring-2 ring-blue-400/50': selected,
      'bg-emerald-600 border-emerald-300 text-white shadow-depth-3 ring-2 ring-emerald-400/50': !selected && inPath,
      'bg-slate-700 border-slate-500 text-cyan-300 shadow-depth-2': !selected && !inPath && hasCell,
      'bg-slate-900 border-slate-700 text-slate-600': !selected && !inPath && !hasCell,
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
