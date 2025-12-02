/**
 * Animation Constants
 *
 * Centralized animation timing and easing configurations.
 * Used across GameMap, GameCompleteModal, BattleEffectOverlay, and other animated components.
 */

/**
 * Animation durations in milliseconds
 */
export const ANIMATION_DURATIONS = {
  /** Army movement animation - slower for better visibility */
  ARMY_MOVE: 1500,

  /** Battle progress animation - more dramatic timing */
  BATTLE_PROGRESS: 5000,

  /** Battle effect durations */
  BATTLE_CLASH: 1200,
  BATTLE_EXPLOSION: 1800,
  BATTLE_VICTORY: 3000,
  BATTLE_COMPLETE: 2000,

  /** Territory conquest animation */
  TERRITORY_CONQUEST: 2000,

  /** Modal fade in/out */
  MODAL_FADE: 300,

  /** Icon spring animation */
  ICON_SPRING: 500,

  /** Toast notification */
  TOAST: 200,

  /** Drawer slide */
  DRAWER_SLIDE: 300,

  /** Button hover */
  BUTTON_HOVER: 150,
} as const

/**
 * Framer Motion easing configurations
 */
export const ANIMATION_EASINGS = {
  /** Spring animation for bouncy effects */
  SPRING: {
    type: "spring" as const,
    stiffness: 300,
    damping: 15,
  },

  /** Smooth easing for fades */
  SMOOTH: {
    duration: 0.3,
  },

  /** Quick snap for UI responses */
  SNAP: {
    type: "spring" as const,
    stiffness: 500,
    damping: 30,
  },

  /** Slow and smooth for large animations */
  SLOW: {
    duration: 0.5,
    ease: "easeInOut" as const,
  },
} as const

/**
 * Animation delays in milliseconds
 */
export const ANIMATION_DELAYS = {
  /** Stagger delay for list items */
  STAGGER: 100,

  /** Initial mount delay */
  MOUNT: 200,

  /** Sequential animation delay */
  SEQUENCE: 300,
} as const

/**
 * Framer Motion variants for common animations
 */
export const ANIMATION_VARIANTS = {
  /** Fade in/out */
  fade: {
    initial: { opacity: 0 },
    animate: { opacity: 1 },
    exit: { opacity: 0 },
  },

  /** Slide up */
  slideUp: {
    initial: { opacity: 0, y: 20 },
    animate: { opacity: 1, y: 0 },
    exit: { opacity: 0, y: -20 },
  },

  /** Slide down */
  slideDown: {
    initial: { opacity: 0, y: -20 },
    animate: { opacity: 1, y: 0 },
    exit: { opacity: 0, y: 20 },
  },

  /** Scale in */
  scaleIn: {
    initial: { opacity: 0, scale: 0.8 },
    animate: { opacity: 1, scale: 1 },
    exit: { opacity: 0, scale: 0.8 },
  },

  /** Scale out */
  scaleOut: {
    initial: { opacity: 1, scale: 1 },
    animate: { opacity: 0, scale: 0.8 },
    exit: { opacity: 0, scale: 0.8 },
  },
} as const

/**
 * CSS transition classes for Tailwind
 */
export const TRANSITION_CLASSES = {
  /** Default transition */
  default: "transition-all duration-300",

  /** Fast transition */
  fast: "transition-all duration-150",

  /** Slow transition */
  slow: "transition-all duration-500",

  /** Color transition only */
  colors: "transition-colors duration-200",

  /** Transform transition only */
  transform: "transition-transform duration-300",
} as const

/**
 * Type exports
 */
export type AnimationDuration = keyof typeof ANIMATION_DURATIONS
export type AnimationEasing = keyof typeof ANIMATION_EASINGS
export type AnimationVariant = keyof typeof ANIMATION_VARIANTS
