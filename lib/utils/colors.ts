/**
 * Color Utilities
 *
 * Centralized color management for player territories, battles, and UI states.
 * Used across GameMap, GameOperationPanel, GameStatus, and other components.
 */

/**
 * Player color palette
 * Consistent colors for territory ownership visualization
 */
export const PLAYER_COLORS = {
  P1: "#3B82F6", // Blue
  P2: "#EF4444", // Red
  P3: "#10B981", // Green
  P4: "#F59E0B", // Yellow
} as const

/**
 * Default color for neutral/unowned territories
 */
export const NEUTRAL_COLOR = "#6B7280" // Gray

/**
 * Get territory color by owner
 * @param owner - Player identifier (P1, P2, P3, P4)
 * @returns Hex color string
 */
export function getTerritoryColor(owner: string): string {
  return PLAYER_COLORS[owner as keyof typeof PLAYER_COLORS] || NEUTRAL_COLOR
}

/**
 * Battle state colors
 */
export const BATTLE_COLORS = {
  attacker: {
    text: "text-green-400",
    bg: "bg-green-900/50",
    border: "border-green-600",
    progress: "bg-green-500",
  },
  defender: {
    text: "text-red-400",
    bg: "bg-red-900/50",
    border: "border-red-600",
    progress: "bg-red-500",
  },
  neutral: {
    text: "text-blue-400",
    bg: "bg-blue-900/50",
    border: "border-blue-600",
    progress: "bg-blue-500",
  },
} as const

/**
 * Get battle result color classes
 * @param winner - 'attacker' or 'defender'
 */
export function getBattleResultColor(winner: "attacker" | "defender"): string {
  return winner === "attacker" ? "text-green-400" : "text-red-400"
}

/**
 * Movement mode colors
 */
export const MOVEMENT_COLORS = {
  active: {
    text: "text-green-400",
    bg: "bg-green-900/50",
    border: "border-green-600",
  },
  valid: {
    bg: "bg-blue-200/20",
    border: "border-blue-400",
  },
  invalid: {
    bg: "bg-red-200/20",
    border: "border-red-400",
  },
} as const

/**
 * Victory/Defeat colors
 */
export const GAME_END_COLORS = {
  victory: {
    primary: "text-amber-700 dark:text-amber-400",
    secondary: "text-amber-600 dark:text-amber-500",
    bg: "bg-amber-50/50 dark:bg-amber-900/10",
    border: "border-amber-200 dark:border-amber-900/30",
    gradient: "from-amber-50 to-yellow-50 dark:from-amber-900/20 dark:to-yellow-900/20",
  },
  defeat: {
    primary: "text-slate-700 dark:text-slate-300",
    secondary: "text-slate-500 dark:text-slate-400",
    bg: "bg-slate-50 dark:bg-slate-800/50",
    border: "border-slate-200 dark:border-slate-700",
    gradient: "from-slate-50 to-blue-50 dark:from-slate-800/50 dark:to-blue-900/20",
  },
} as const

/**
 * Type exports
 */
export type PlayerColor = keyof typeof PLAYER_COLORS
export type BattleRole = keyof typeof BATTLE_COLORS
