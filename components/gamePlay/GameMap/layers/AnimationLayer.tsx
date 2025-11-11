import { memo, useMemo } from "react"
import { Users } from "lucide-react"
import { Army } from "@/lib/types/game"
import { getGridCellPosition } from "@/lib/constants/grid"
import { ANIMATION_DURATIONS } from "@/lib/constants/animations"

interface AnimationLayerProps {
  armies: Army[]
  animatingArmies: Set<string>
  armyPositions: Record<string, { x: number; y: number; isAnimating?: boolean }>
}

/**
 * AnimationLayer Component
 *
 * Handles floating animated armies during movement
 * Generates dynamic CSS animations for smooth army transitions
 */
export const AnimationLayer = memo(
  ({ armies, animatingArmies, armyPositions }: AnimationLayerProps) => {
    // Generate CSS animation styles
    const animationStyles = useMemo(() => {
      return armies
        .filter((army) => animatingArmies.has(army.id))
        .map((army) => {
          const startPos = { x: army.x, y: army.y }
          const endPos = armyPositions[army.id]

          if (!endPos) return ""

          const startPosition = getGridCellPosition(startPos.x, startPos.y)
          const endPosition = getGridCellPosition(endPos.x, endPos.y)

          return `
            @keyframes moveArmy-${army.id} {
              0% {
                left: ${startPosition.left};
                top: ${startPosition.top};
                transform: translate(-50%, -50%) scale(1) rotate(0deg);
                opacity: 1;
                filter: drop-shadow(0 0 8px rgba(251, 191, 36, 0.6));
              }
              15% {
                transform: translate(-50%, -50%) scale(1.15) rotate(-3deg);
                opacity: 1;
              }
              50% {
                transform: translate(-50%, -50%) scale(1.3) rotate(2deg);
                opacity: 0.95;
                filter: drop-shadow(0 0 16px rgba(251, 191, 36, 0.8));
              }
              85% {
                transform: translate(-50%, -50%) scale(1.15) rotate(-2deg);
                opacity: 1;
              }
              100% {
                left: ${endPosition.left};
                top: ${endPosition.top};
                transform: translate(-50%, -50%) scale(1) rotate(0deg);
                opacity: 1;
                filter: drop-shadow(0 0 8px rgba(251, 191, 36, 0.6));
              }
            }
          `
        })
        .join("\n")
    }, [armies, animatingArmies, armyPositions])

    return (
      <>
        {/* Floating Animated Armies */}
        {armies
          .filter((army) => animatingArmies.has(army.id))
          .map((army) => {
            const startPos = { x: army.x, y: army.y }
            const endPos = armyPositions[army.id]

            if (!endPos) return null

            const startPosition = getGridCellPosition(startPos.x, startPos.y)

            return (
              <div
                key={`floating-${army.id}`}
                className="absolute w-8 h-8 md:w-10 md:h-10 rounded-full border-2 border-yellow-400 flex items-center justify-center shadow-lg shadow-yellow-400/50 z-10"
                style={{
                  backgroundColor: "#9B9B9B",
                  left: startPosition.left,
                  top: startPosition.top,
                  transform: "translate(-50%, -50%)",
                  animation: `moveArmy-${army.id} ${ANIMATION_DURATIONS.ARMY_MOVE}ms cubic-bezier(0.4, 0.0, 0.2, 1) forwards`,
                }}
              >
                <Users className="w-4 h-4 md:w-5 md:h-5 text-white" />

                {/* Trail Effect - Enhanced with motion blur */}
                <div className="absolute inset-0 rounded-full bg-gradient-to-r from-transparent via-white/30 to-transparent animate-pulse" />
                <div className="absolute inset-0 rounded-full bg-gradient-to-b from-yellow-400/20 via-transparent to-yellow-400/20" />

                {/* Movement Particles - More dramatic */}
                <div className="absolute -inset-4">
                  <div
                    className="absolute w-1.5 h-1.5 bg-yellow-400 rounded-full animate-ping"
                    style={{ top: "10%", left: "20%", animationDelay: "0ms", animationDuration: "1.5s" }}
                  />
                  <div
                    className="absolute w-1 h-1 bg-yellow-300 rounded-full animate-ping"
                    style={{ top: "30%", left: "80%", animationDelay: "150ms", animationDuration: "1.8s" }}
                  />
                  <div
                    className="absolute w-1.5 h-1.5 bg-yellow-400 rounded-full animate-ping"
                    style={{ top: "80%", right: "15%", animationDelay: "300ms", animationDuration: "1.5s" }}
                  />
                  <div
                    className="absolute w-1 h-1 bg-amber-400 rounded-full animate-ping"
                    style={{ top: "60%", left: "10%", animationDelay: "450ms", animationDuration: "1.6s" }}
                  />
                  <div
                    className="absolute w-1.5 h-1.5 bg-yellow-400 rounded-full animate-ping"
                    style={{ bottom: "20%", left: "70%", animationDelay: "600ms", animationDuration: "1.5s" }}
                  />
                  <div
                    className="absolute w-1 h-1 bg-yellow-300 rounded-full animate-ping"
                    style={{ bottom: "40%", right: "25%", animationDelay: "750ms", animationDuration: "1.7s" }}
                  />
                </div>
              </div>
            )
          })}

        {/* Dynamic CSS for movement animations */}
        <style jsx>{`
          ${animationStyles}
        `}</style>
      </>
    )
  }
)

AnimationLayer.displayName = "AnimationLayer"
