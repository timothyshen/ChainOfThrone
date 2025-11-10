import { memo, useMemo } from "react"
import { Users } from "lucide-react"
import { Army } from "@/lib/types/game"
import { getGridCellPosition } from "@/lib/constants/grid"

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
                transform: translate(-50%, -50%) scale(1);
                opacity: 1;
              }
              50% {
                transform: translate(-50%, -50%) scale(1.2);
                opacity: 0.9;
              }
              100% {
                left: ${endPosition.left};
                top: ${endPosition.top};
                transform: translate(-50%, -50%) scale(1);
                opacity: 1;
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
                  animation: `moveArmy-${army.id} 0.8s ease-in-out forwards`,
                }}
              >
                <Users className="w-4 h-4 md:w-5 md:h-5 text-white" />

                {/* Trail Effect */}
                <div className="absolute inset-0 rounded-full bg-gradient-to-r from-transparent via-white/20 to-transparent animate-pulse" />

                {/* Movement Particles */}
                <div className="absolute -inset-2">
                  <div
                    className="absolute w-1 h-1 bg-yellow-400 rounded-full animate-ping"
                    style={{ top: "10%", left: "20%", animationDelay: "0ms" }}
                  />
                  <div
                    className="absolute w-1 h-1 bg-yellow-400 rounded-full animate-ping"
                    style={{
                      top: "80%",
                      right: "15%",
                      animationDelay: "200ms",
                    }}
                  />
                  <div
                    className="absolute w-1 h-1 bg-yellow-400 rounded-full animate-ping"
                    style={{
                      bottom: "20%",
                      left: "70%",
                      animationDelay: "400ms",
                    }}
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
