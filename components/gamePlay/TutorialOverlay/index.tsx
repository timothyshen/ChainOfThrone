"use client"

import { memo, useEffect, useState } from "react"
import { AnimatePresence, motion } from "framer-motion"
import { useTutorialState } from "@/lib/hooks/useTutorialState"
import { TutorialStepContent } from "./TutorialStep"

interface TutorialOverlayProps {
  children?: React.ReactNode
}

/**
 * TutorialOverlay Component
 *
 * Full-screen overlay that guides new players through the game
 * Shows spotlight effect on targeted elements
 */
export const TutorialOverlay = memo(({ children }: TutorialOverlayProps) => {
  const {
    isActive,
    currentStep,
    currentStepData,
    totalSteps,
    nextStep,
    prevStep,
    skipTutorial,
  } = useTutorialState()

  const [targetRect, setTargetRect] = useState<DOMRect | null>(null)

  // Find and highlight target element
  useEffect(() => {
    if (!isActive || !currentStepData?.target) {
      setTargetRect(null)
      return
    }

    const findTarget = () => {
      const target = document.querySelector(currentStepData.target!)
      if (target) {
        setTargetRect(target.getBoundingClientRect())
      } else {
        setTargetRect(null)
      }
    }

    // Initial find
    findTarget()

    // Re-find on resize/scroll
    window.addEventListener("resize", findTarget)
    window.addEventListener("scroll", findTarget, true)

    return () => {
      window.removeEventListener("resize", findTarget)
      window.removeEventListener("scroll", findTarget, true)
    }
  }, [isActive, currentStepData])

  if (!isActive || !currentStepData) {
    return null
  }

  const hasTarget = targetRect && currentStepData.target

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-[100]"
      >
        {/* Backdrop with spotlight cutout */}
        <div className="absolute inset-0">
          {hasTarget ? (
            <svg
              className="absolute inset-0 w-full h-full"
              preserveAspectRatio="none"
            >
              <defs>
                <mask id="spotlight-mask">
                  <rect width="100%" height="100%" fill="white" />
                  <rect
                    x={targetRect.left - 8}
                    y={targetRect.top - 8}
                    width={targetRect.width + 16}
                    height={targetRect.height + 16}
                    rx="8"
                    fill="black"
                  />
                </mask>
              </defs>
              <rect
                width="100%"
                height="100%"
                fill="rgba(0, 0, 0, 0.75)"
                mask="url(#spotlight-mask)"
              />
            </svg>
          ) : (
            <div className="absolute inset-0 bg-black/75" />
          )}
        </div>

        {/* Spotlight ring effect */}
        {hasTarget && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="absolute pointer-events-none"
            style={{
              left: targetRect.left - 8,
              top: targetRect.top - 8,
              width: targetRect.width + 16,
              height: targetRect.height + 16,
            }}
          >
            <div className="w-full h-full rounded-lg ring-4 ring-game-castle ring-offset-2 ring-offset-transparent animate-pulse" />
          </motion.div>
        )}

        {/* Tutorial Card */}
        <div
          className={`absolute inset-0 flex items-center justify-center pointer-events-none ${
            hasTarget && currentStepData.position !== "center"
              ? getPositionClass(currentStepData.position, targetRect)
              : ""
          }`}
        >
          <div className="pointer-events-auto">
            <TutorialStepContent
              step={currentStepData}
              currentIndex={currentStep}
              totalSteps={totalSteps}
              onNext={nextStep}
              onPrev={prevStep}
              onSkip={skipTutorial}
            />
          </div>
        </div>
      </motion.div>
    </AnimatePresence>
  )
})

TutorialOverlay.displayName = "TutorialOverlay"

/**
 * Get CSS class for positioning the tutorial card relative to target
 */
function getPositionClass(
  position: "top" | "bottom" | "left" | "right" | "center" | undefined,
  targetRect: DOMRect
): string {
  if (!position || position === "center") return ""

  const viewportHeight = window.innerHeight
  const targetCenter = targetRect.top + targetRect.height / 2

  // Adjust based on where the target is on screen
  if (targetCenter < viewportHeight / 3) {
    // Target is in top third - show card below
    return "items-end pb-20"
  } else if (targetCenter > (viewportHeight * 2) / 3) {
    // Target is in bottom third - show card above
    return "items-start pt-20"
  }

  return ""
}

export default TutorialOverlay
