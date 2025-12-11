"use client"

import { memo } from "react"
import { motion } from "framer-motion"
import { Crown, ChevronLeft, ChevronRight, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { TutorialStep as TutorialStepType } from "@/lib/hooks/useTutorialState"

interface TutorialStepProps {
  step: TutorialStepType
  currentIndex: number
  totalSteps: number
  onNext: () => void
  onPrev: () => void
  onSkip: () => void
}

/**
 * TutorialStep Component
 *
 * Renders a single tutorial step with navigation controls
 */
export const TutorialStepContent = memo(({
  step,
  currentIndex,
  totalSteps,
  onNext,
  onPrev,
  onSkip,
}: TutorialStepProps) => {
  const isFirstStep = currentIndex === 0
  const isLastStep = currentIndex === totalSteps - 1

  return (
    <motion.div
      key={step.id}
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.95 }}
      transition={{ duration: 0.2 }}
      className="bg-surface-1 border border-border rounded-xl shadow-2xl max-w-sm w-full mx-4 overflow-hidden"
    >
      {/* Header */}
      <div className="bg-gradient-to-r from-game-castle/20 to-game-player/20 px-4 py-3 border-b border-border">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Crown className="h-5 w-5 text-game-castle" />
            <span className="text-sm font-medium text-text-secondary">
              Tutorial ({currentIndex + 1}/{totalSteps})
            </span>
          </div>
          <button
            onClick={onSkip}
            className="p-1 rounded-full hover:bg-surface-3 transition-colors"
            aria-label="Skip tutorial"
          >
            <X className="h-4 w-4 text-text-secondary" />
          </button>
        </div>
      </div>

      {/* Content */}
      <div className="p-5">
        <h3 className="text-lg font-bold text-foreground mb-2">
          {step.title}
        </h3>
        <p className="text-sm text-text-secondary leading-relaxed">
          {step.description}
        </p>
      </div>

      {/* Progress Dots */}
      <div className="flex justify-center gap-1.5 pb-3">
        {Array.from({ length: totalSteps }).map((_, i) => (
          <div
            key={i}
            className={`h-1.5 rounded-full transition-all duration-300 ${
              i === currentIndex
                ? "w-4 bg-game-castle"
                : i < currentIndex
                ? "w-1.5 bg-game-castle/50"
                : "w-1.5 bg-surface-3"
            }`}
          />
        ))}
      </div>

      {/* Navigation */}
      <div className="flex items-center justify-between px-4 py-3 border-t border-border bg-surface-2/50">
        <Button
          variant="ghost"
          size="sm"
          onClick={onPrev}
          disabled={isFirstStep}
          className="gap-1"
        >
          <ChevronLeft className="h-4 w-4" />
          Back
        </Button>

        <Button
          variant="ghost"
          size="sm"
          onClick={onSkip}
          className="text-text-secondary"
        >
          Skip
        </Button>

        <Button
          size="sm"
          onClick={onNext}
          className="gap-1 bg-game-castle hover:bg-game-castle/90 text-white"
        >
          {isLastStep ? "Start Playing" : "Next"}
          {!isLastStep && <ChevronRight className="h-4 w-4" />}
        </Button>
      </div>
    </motion.div>
  )
})

TutorialStepContent.displayName = "TutorialStepContent"
