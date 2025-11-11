import { useMemo, useCallback } from "react"
import { Users } from "lucide-react"
import { Army, Territory } from "@/lib/types/game"

interface UseArmyLayerProps {
  armies: Army[]
  selectedArmy: Army | null
  animatingArmies: Set<string>
  getArmyDisplayPosition: (army: Army) => { gridX: number; gridY: number }
  onArmyClick: (territory: Territory, army: Army) => void
}

/**
 * useArmyLayer Hook
 *
 * Manages army rendering logic and provides render function
 * Creates position lookup map for efficient rendering
 */
export function useArmyLayer({
  armies,
  selectedArmy,
  animatingArmies,
  getArmyDisplayPosition,
  onArmyClick,
}: UseArmyLayerProps) {
  // Create position lookup map
  const armiesByPosition = useMemo(() => {
    const map = new Map<string, Army[]>()

    armies.forEach((army) => {
      const displayPos = getArmyDisplayPosition(army)
      const key = `${displayPos.gridX}-${displayPos.gridY}`

      if (!map.has(key)) {
        map.set(key, [])
      }
      map.get(key)!.push(army)
    })

    return map
  }, [armies, getArmyDisplayPosition])

  // Render function for armies at a specific position
  const renderArmiesAt = useCallback(
    (x: number, y: number): React.ReactNode => {
      const positionKey = `${x}-${y}`
      const armiesAtPosition = armiesByPosition.get(positionKey)

      if (!armiesAtPosition || armiesAtPosition.length === 0) {
        return null
      }

      return armiesAtPosition.map((army) => {
        const isAnimating = animatingArmies.has(army.id)
        const isSelected = selectedArmy?.id === army.id

        // Create territory object for click handler
        const territory: Territory = {
          id: `${x}-${y}`,
          name: "",
          x,
          y,
          player: army.owner as `0x${string}`,
          isCastle: false,
          units: [],
        }

        return (
          <div
            key={army.id}
            className={`absolute top-1 right-1 w-6 h-6 md:w-8 md:h-8 rounded-full border-2 cursor-pointer flex items-center justify-center transition-all duration-800 ease-in-out z-20
              ${
                isSelected
                  ? "border-yellow-400 shadow-lg shadow-yellow-400/50"
                  : "border-white"
              } ${
              army.isMoving || isAnimating ? "animate-pulse" : ""
            } ${
              isAnimating ? "scale-110 shadow-lg" : "hover:scale-110"
            }`}
            style={{
              backgroundColor: "#9B9B9B",
              transform: isAnimating ? "translateZ(0)" : undefined,
            }}
            onClick={(e) => {
              e.stopPropagation()
              if (!isAnimating) {
                onArmyClick(territory, army)
              }
            }}
          >
            <Users className="w-3 h-3 md:w-4 md:h-4 text-white" />
            <div className="absolute -bottom-1 left-1/2 transform -translate-x-1/2 text-[10px] bg-slate-800/90 px-1 rounded whitespace-nowrap">
              {army.size.toString()}
            </div>

            {/* Movement Trail Effect */}
            {isAnimating && (
              <>
                <div className="absolute inset-0 rounded-full bg-white/20 animate-ping" />
                <div className="absolute inset-0 rounded-full border-2 border-white/40 animate-pulse" />
              </>
            )}
          </div>
        )
      })
    },
    [armiesByPosition, animatingArmies, selectedArmy, onArmyClick]
  )

  return { renderArmiesAt }
}
