/**
 * Grid Configuration for Chain of Thrones
 *
 * Centralized grid dimensions to support future scalability.
 *
 * v0.2: Fixed 3x3 grid
 * v0.3+: Will be contract-driven when multi-player support is added
 *
 * @see CLAUDE.md - Roadmap section for v0.3 grid scalability
 */

export const GRID_CONFIG = {
  /** Number of rows in the game grid */
  rows: 3,

  /** Number of columns in the game grid */
  cols: 3,

  /** Width of each cell as percentage (100 / cols) */
  get cellWidthPercent(): number {
    return 100 / this.cols
  },

  /** Height of each cell as percentage (100 / rows) */
  get cellHeightPercent(): number {
    return 100 / this.rows
  },

  /** X offset to center of cell */
  get centerOffsetX(): number {
    return this.cellWidthPercent / 2
  },

  /** Y offset to center of cell */
  get centerOffsetY(): number {
    return this.cellHeightPercent / 2
  },

  /** Total number of cells */
  get totalCells(): number {
    return this.rows * this.cols
  },

  /** Tailwind grid-cols class (for current 3x3 grid) */
  get gridColsClass(): string {
    return `grid-cols-${this.cols}`
  },

  /** Tailwind grid-rows class (for current 3x3 grid) */
  get gridRowsClass(): string {
    return `grid-rows-${this.rows}`
  },
} as const

/**
 * Calculate absolute position for army animations
 * @param x Row coordinate (0-indexed)
 * @param y Column coordinate (0-indexed)
 * @returns Position as { left: string, top: string } in percentage
 */
export function getGridCellPosition(x: number, y: number): { left: string; top: string } {
  return {
    left: `${y * GRID_CONFIG.cellWidthPercent + GRID_CONFIG.centerOffsetX}%`,
    top: `${x * GRID_CONFIG.cellHeightPercent + GRID_CONFIG.centerOffsetY}%`,
  }
}

/**
 * Validate if coordinates are within grid bounds
 * @param x Row coordinate
 * @param y Column coordinate
 * @returns true if coordinates are valid
 */
export function isValidGridPosition(x: number, y: number): boolean {
  return x >= 0 && x < GRID_CONFIG.rows && y >= 0 && y < GRID_CONFIG.cols
}
