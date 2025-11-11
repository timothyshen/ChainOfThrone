/**
 * Theme Constants
 * Centralized design system for consistent UI
 */

/**
 * Player Colors
 * Consistent color scheme for Player 1 and Player 2
 */
export const PLAYER_COLORS = {
  player1: {
    bg: 'bg-blue-600',
    bgHover: 'bg-blue-700',
    text: 'text-blue-400',
    textBright: 'text-blue-300',
    border: 'border-blue-500',
    ring: 'ring-blue-400',
  },
  player2: {
    bg: 'bg-red-600',
    bgHover: 'bg-red-700',
    text: 'text-red-400',
    textBright: 'text-red-300',
    border: 'border-red-500',
    ring: 'ring-red-400',
  },
} as const

/**
 * Card Padding
 * Standardized padding for different card sizes
 */
export const CARD_PADDING = {
  sm: 'p-4',
  md: 'p-6',
  lg: 'p-8',
  xl: 'p-10',
} as const

/**
 * Card Content Padding
 * For CardContent components
 */
export const CARD_CONTENT_PADDING = {
  sm: 'p-3',
  md: 'p-4',
  lg: 'p-6',
  xl: 'p-8',
} as const

/**
 * Badge Variants
 * Consistent badge styling across the app
 */
export const BADGE_STYLES = {
  // Status badges
  success: 'bg-green-500 hover:bg-green-600 text-white',
  warning: 'bg-yellow-500 hover:bg-yellow-600 text-black',
  error: 'bg-red-500 hover:bg-red-600 text-white',
  info: 'bg-blue-500 hover:bg-blue-600 text-white',

  // Player badges
  player1: 'bg-blue-500 hover:bg-blue-600 text-white',
  player2: 'bg-red-500 hover:bg-red-600 text-white',

  // Outline variants
  successOutline: 'border-green-400 text-green-400 bg-transparent',
  warningOutline: 'border-yellow-400 text-yellow-400 bg-transparent',
  errorOutline: 'border-red-400 text-red-400 bg-transparent',
  infoOutline: 'border-blue-400 text-blue-400 bg-transparent',

  // Game status
  ongoing: 'bg-green-500 text-white',
  finished: 'bg-blue-500 text-white',
  notStarted: 'bg-slate-500 text-white',
} as const

/**
 * Typography Scale
 * Consistent heading and text sizes with responsive breakpoints
 */
export const TYPOGRAPHY = {
  // Headings
  h1: 'text-3xl sm:text-4xl md:text-5xl font-bold',
  h2: 'text-2xl sm:text-3xl md:text-4xl font-bold',
  h3: 'text-xl sm:text-2xl md:text-3xl font-semibold',
  h4: 'text-lg sm:text-xl md:text-2xl font-semibold',
  h5: 'text-base sm:text-lg md:text-xl font-semibold',

  // Body text
  body: 'text-base sm:text-lg',
  bodySmall: 'text-sm sm:text-base',

  // UI elements
  label: 'text-sm font-medium',
  caption: 'text-xs sm:text-sm',
  tiny: 'text-xs',
} as const

/**
 * Spacing Scale
 * Consistent spacing for layouts
 */
export const SPACING = {
  xs: 'gap-2',
  sm: 'gap-4',
  md: 'gap-6',
  lg: 'gap-8',
  xl: 'gap-12',
} as const

/**
 * Border Radius
 * Consistent border radius values
 */
export const RADIUS = {
  sm: 'rounded-sm',
  md: 'rounded-md',
  lg: 'rounded-lg',
  xl: 'rounded-xl',
  full: 'rounded-full',
} as const

/**
 * Transitions
 * Consistent transition timings
 */
export const TRANSITIONS = {
  fast: 'transition-all duration-150 ease-in-out',
  normal: 'transition-all duration-200 ease-in-out',
  slow: 'transition-all duration-300 ease-in-out',
  slower: 'transition-all duration-500 ease-in-out',
} as const

/**
 * Shadow Variants
 * Consistent shadow styles
 */
export const SHADOWS = {
  sm: 'shadow-sm',
  md: 'shadow-md',
  lg: 'shadow-lg',
  xl: 'shadow-xl',
  inner: 'shadow-inner',
} as const

/**
 * Z-Index Scale
 * Consistent layering
 */
export const Z_INDEX = {
  base: 'z-0',
  dropdown: 'z-10',
  sticky: 'z-20',
  modal: 'z-40',
  popover: 'z-50',
  toast: 'z-100',
} as const

/**
 * Animation Durations
 * Consistent animation timings (in milliseconds)
 */
export const ANIMATION_DURATION = {
  fast: 150,
  normal: 200,
  slow: 300,
  slower: 500,
} as const

/**
 * Breakpoints
 * Reference for responsive design (matches Tailwind defaults)
 */
export const BREAKPOINTS = {
  sm: 640,
  md: 768,
  lg: 1024,
  xl: 1280,
  '2xl': 1536,
} as const

/**
 * Helper function to get player color classes
 */
export function getPlayerColor(playerId: number | string) {
  const id = typeof playerId === 'string' ? parseInt(playerId) : playerId
  return id === 0 || id === 1 ? PLAYER_COLORS.player1 : PLAYER_COLORS.player2
}

/**
 * Helper function to get badge style
 */
export function getBadgeStyle(variant: keyof typeof BADGE_STYLES) {
  return BADGE_STYLES[variant] || BADGE_STYLES.info
}

/**
 * Helper function to get game status badge
 */
export function getGameStatusBadge(status: 'Not Started' | 'Ongoing' | 'Finished') {
  switch (status) {
    case 'Ongoing':
      return BADGE_STYLES.ongoing
    case 'Finished':
      return BADGE_STYLES.finished
    case 'Not Started':
      return BADGE_STYLES.notStarted
    default:
      return BADGE_STYLES.notStarted
  }
}
