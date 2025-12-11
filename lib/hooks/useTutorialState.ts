"use client"

import { useState, useEffect, useCallback } from "react"

const TUTORIAL_STORAGE_KEY = "chain-of-thrones-tutorial-completed"

export interface TutorialStep {
  id: string
  title: string
  description: string
  target?: string // CSS selector or element ID to highlight
  position?: "top" | "bottom" | "left" | "right" | "center"
}

export const TUTORIAL_STEPS: TutorialStep[] = [
  {
    id: "welcome",
    title: "Welcome to Chain of Thrones!",
    description: "Let's learn how to play this strategic battle game. You'll stake MONAD and compete for control of castles.",
    position: "center",
  },
  {
    id: "battlefield",
    title: "The Battlefield",
    description: "This 3x3 grid is your battlefield. Each cell can be controlled by you, your enemy, or remain neutral.",
    target: "[data-tutorial='game-map']",
    position: "bottom",
  },
  {
    id: "castles",
    title: "Castles are Key",
    description: "The amber/gold cells are castles. There are 5 castles on the map - at each corner and the center.",
    target: "[data-tutorial='castle-cell']",
    position: "bottom",
  },
  {
    id: "win-condition",
    title: "How to Win",
    description: "Control 3 of the 5 castles to win the game and claim the prize pool!",
    position: "center",
  },
  {
    id: "your-army",
    title: "Your Army",
    description: "Your army is shown in blue. Tap on your army to select it and see where you can move.",
    target: "[data-tutorial='player-army']",
    position: "bottom",
  },
  {
    id: "movement",
    title: "Moving Your Units",
    description: "After selecting your army, green cells show valid moves. Red cells indicate enemies you can attack!",
    position: "center",
  },
  {
    id: "combat",
    title: "Combat Tips",
    description: "Larger armies win battles. But castles give a 2.5x defense bonus - attack wisely!",
    position: "center",
  },
  {
    id: "ready",
    title: "You're Ready!",
    description: "Good luck, commander! Capture those castles and claim victory!",
    position: "center",
  },
]

export interface UseTutorialStateReturn {
  isActive: boolean
  currentStep: number
  currentStepData: TutorialStep | null
  totalSteps: number
  hasCompletedTutorial: boolean
  startTutorial: () => void
  nextStep: () => void
  prevStep: () => void
  skipTutorial: () => void
  completeTutorial: () => void
  resetTutorial: () => void
}

/**
 * useTutorialState Hook
 *
 * Manages tutorial progress with localStorage persistence
 */
export function useTutorialState(): UseTutorialStateReturn {
  const [isActive, setIsActive] = useState(false)
  const [currentStep, setCurrentStep] = useState(0)
  const [hasCompletedTutorial, setHasCompletedTutorial] = useState(true) // Default true to avoid flash

  // Check localStorage on mount
  useEffect(() => {
    const completed = localStorage.getItem(TUTORIAL_STORAGE_KEY)
    const hasCompleted = completed === "true"
    setHasCompletedTutorial(hasCompleted)

    // Auto-start tutorial for first-time users
    if (!hasCompleted) {
      // Small delay to let the game render first
      const timer = setTimeout(() => {
        setIsActive(true)
      }, 1000)
      return () => clearTimeout(timer)
    }
  }, [])

  const currentStepData = isActive && currentStep < TUTORIAL_STEPS.length
    ? TUTORIAL_STEPS[currentStep] ?? null
    : null

  const startTutorial = useCallback(() => {
    setCurrentStep(0)
    setIsActive(true)
  }, [])

  const completeTutorial = useCallback(() => {
    setIsActive(false)
    setHasCompletedTutorial(true)
    localStorage.setItem(TUTORIAL_STORAGE_KEY, "true")
  }, [])

  const nextStep = useCallback(() => {
    if (currentStep < TUTORIAL_STEPS.length - 1) {
      setCurrentStep(prev => prev + 1)
    } else {
      // Tutorial complete
      completeTutorial()
    }
  }, [currentStep, completeTutorial])

  const prevStep = useCallback(() => {
    if (currentStep > 0) {
      setCurrentStep(prev => prev - 1)
    }
  }, [currentStep])

  const skipTutorial = useCallback(() => {
    setIsActive(false)
    setHasCompletedTutorial(true)
    localStorage.setItem(TUTORIAL_STORAGE_KEY, "true")
  }, [])

  const resetTutorial = useCallback(() => {
    localStorage.removeItem(TUTORIAL_STORAGE_KEY)
    setHasCompletedTutorial(false)
    setCurrentStep(0)
    setIsActive(true)
  }, [])

  return {
    isActive,
    currentStep,
    currentStepData,
    totalSteps: TUTORIAL_STEPS.length,
    hasCompletedTutorial,
    startTutorial,
    nextStep,
    prevStep,
    skipTutorial,
    completeTutorial,
    resetTutorial,
  }
}
