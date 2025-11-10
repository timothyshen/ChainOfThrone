/**
 * Game Configuration Constants
 *
 * Core game rules, stakes, and configuration values.
 * Should match contract constants in contracts/src/Game.sol
 */

/**
 * Player configuration
 */
export const GAME_CONFIG = {
  /** Maximum number of players per game */
  MAX_PLAYERS: 2,

  /** Initial units per player at spawn */
  INITIAL_UNITS: 10,

  /** Minimum units required to make a move */
  MIN_MOVE_UNITS: 1,

  /** Number of castles required to win */
  CASTLES_TO_WIN: 3,
} as const

/**
 * Economic configuration
 */
export const ECONOMIC_CONFIG = {
  /** Stake amount in ETH (string for display) */
  STAKE_AMOUNT: "1",

  /** Stake amount in wei (BigInt for contracts) */
  STAKE_AMOUNT_WEI: BigInt("1000000000000000000"),

  /** Winner receives 90% of total stakes */
  WINNER_PERCENTAGE: 90,

  /** Protocol fee is 10% of total stakes */
  PROTOCOL_PERCENTAGE: 10,
} as const

/**
 * Game status enum
 * Matches GameStatus enum in Game.sol
 */
export const GAME_STATUS = {
  NOT_STARTED: 0,
  ONGOING: 1,
  COMPLETED: 2,
} as const

/**
 * Game status labels for UI display
 */
export const GAME_STATUS_LABELS = {
  [GAME_STATUS.NOT_STARTED]: "Waiting for Players",
  [GAME_STATUS.ONGOING]: "In Progress",
  [GAME_STATUS.COMPLETED]: "Completed",
} as const

/**
 * Battle mechanics
 */
export const BATTLE_CONFIG = {
  /** Combat resolution delay in milliseconds */
  COMBAT_DELAY: 2000,

  /** Minimum units to initiate battle */
  MIN_BATTLE_UNITS: 1,

  /** Battle animation phases */
  PHASES: {
    PREVIEW: "preview",
    COMBAT: "combat",
    RESULTS: "results",
  } as const,
} as const

/**
 * Movement rules
 */
export const MOVEMENT_CONFIG = {
  /** Maximum distance for adjacent movement */
  MAX_DISTANCE: 1,

  /** Allowed movement directions (8-directional) */
  DIRECTIONS: [
    { x: -1, y: -1 }, // Top-left
    { x: -1, y: 0 },  // Top
    { x: -1, y: 1 },  // Top-right
    { x: 0, y: -1 },  // Left
    { x: 0, y: 1 },   // Right
    { x: 1, y: -1 },  // Bottom-left
    { x: 1, y: 0 },   // Bottom
    { x: 1, y: 1 },   // Bottom-right
  ],
} as const

/**
 * Round configuration
 */
export const ROUND_CONFIG = {
  /** Time limit per round in seconds (if implemented) */
  TIME_LIMIT: 300, // 5 minutes

  /** Maximum number of rounds before draw (if implemented) */
  MAX_ROUNDS: 100,
} as const

/**
 * UI display constants
 */
export const UI_CONFIG = {
  /** Number of recent games to display */
  RECENT_GAMES_LIMIT: 10,

  /** Pagination size for game lists */
  GAMES_PER_PAGE: 20,

  /** Leaderboard entries to display */
  LEADERBOARD_SIZE: 10,

  /** Minimum screen width for mobile (px) */
  MOBILE_BREAKPOINT: 768,
} as const

/**
 * Validation rules
 */
export const VALIDATION_RULES = {
  /** Maximum address length for display */
  ADDRESS_DISPLAY_LENGTH: 10,

  /** Minimum units to display in army size */
  MIN_DISPLAY_UNITS: 1,

  /** Maximum units to display without formatting */
  MAX_UNITS_NO_FORMAT: 999,
} as const

/**
 * Type exports
 */
export type GameStatus = typeof GAME_STATUS[keyof typeof GAME_STATUS]
export type BattlePhase = typeof BATTLE_CONFIG.PHASES[keyof typeof BATTLE_CONFIG.PHASES]
export type MovementDirection = typeof MOVEMENT_CONFIG.DIRECTIONS[number]
