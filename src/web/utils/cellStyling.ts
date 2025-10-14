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
 * @param options.hasCell - Whether cell contains a letter
 * @param options.canClick - Whether cell can be clicked
 * @param options.isHovered - Whether cell is being hovered
 * @returns Combined className string
 */
export function getCellClassName({
  selected,
  inPath,
  isInHoveredPath,
  hasCell,
  canClick,
  isHovered,
}: GetCellClassNameOptions): string {
  return cn(
    // Base classes - flexible sizing
    'aspect-square w-full border flex items-center justify-center text-[length:calc(var(--text-resp-board)*0.85)] font-black transition-all duration-200 relative leading-none',

    // State-based styling (priority order: selected > inPath > isInHoveredPath > hasCell > empty)
    {
      'bg-cyan-800 border-cyan-300 text-white shadow-depth-3 ring-2 ring-cyan-400/50': selected,
      'bg-emerald-700 border-emerald-300 text-white shadow-depth-3 ring-2 ring-emerald-400/50': !selected && inPath,
      'bg-amber-700 border-amber-300 text-white shadow-depth-2 ring-2 ring-amber-400/50': !selected && !inPath && isInHoveredPath,
      'bg-slate-800 border-slate-700 text-slate-300 shadow-depth-2': !selected && !inPath && !isInHoveredPath && hasCell,
      'bg-slate-900 border-slate-700 text-slate-600': !selected && !inPath && !isInHoveredPath && !hasCell,
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
