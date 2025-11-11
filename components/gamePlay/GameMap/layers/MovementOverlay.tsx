import { memo } from "react"
import { Navigation, Swords } from "lucide-react"
import { Army, Territory } from "@/lib/types/game"

interface MovementOverlayProps {
  showMovementPaths: boolean
  movementMode: boolean
  flatTerritories: (Territory & { isSelected: boolean })[]
  validMovementCells: { x: number; y: number }[]
  selectedArmy: Army | null
  armies: Army[]
  onCellClick: (gridX: number, gridY: number) => void
}

/**
 * MovementOverlay Component
 *
 * Displays valid movement cells and battle destinations
 * Shows visual indicators for current position, moves, and battles
 */
export const MovementOverlay = memo(
  ({
    showMovementPaths,
    movementMode,
    flatTerritories,
    validMovementCells,
    selectedArmy,
    armies,
    onCellClick,
  }: MovementOverlayProps) => {
    if (!showMovementPaths || !movementMode) {
      return null
    }

    return (
      <div className="absolute inset-0 p-2 pointer-events-none z-10">
        <div className="w-full h-full grid grid-cols-3 grid-rows-3 gap-1">
          {flatTerritories.map((territory) => {
            const gridX = territory.x
            const gridY = territory.y
            const isValidMove = validMovementCells.some(
              (cell) => cell.x === gridX && cell.y === gridY
            )
            const isCurrentPosition =
              selectedArmy &&
              selectedArmy.x === gridX &&
              selectedArmy.y === gridY

            // Check for enemy armies that can be battled
            const hasEnemyArmy =
              isValidMove &&
              armies.some(
                (army) =>
                  army.x === gridX &&
                  army.y === gridY &&
                  army.owner !== selectedArmy?.owner
              )

            // Priority system - only show one indicator per cell
            let cellStyle = ""
            let cellIcon = null
            let isClickable = false

            if (isCurrentPosition) {
              // Current army position
              cellStyle = "bg-blue-500/30 border-2 border-blue-400 rounded-lg"
              cellIcon = (
                <div className="flex flex-col items-center">
                  <div className="w-6 h-6 md:w-8 md:h-8 rounded-full bg-blue-400 animate-ping" />
                  <span className="text-xs text-blue-400 font-bold mt-1">
                    CURRENT
                  </span>
                </div>
              )
            } else if (hasEnemyArmy) {
              // Battle destination
              cellStyle =
                "bg-purple-500/30 border-2 border-purple-400 rounded-lg hover:bg-purple-500/50"
              cellIcon = (
                <div className="flex flex-col items-center">
                  <Swords className="w-6 h-6 md:w-8 md:h-8 text-purple-400 animate-pulse" />
                  <span className="text-xs text-purple-400 font-bold mt-1">
                    BATTLE
                  </span>
                </div>
              )
              isClickable = true
            } else if (isValidMove) {
              // Valid movement cell
              cellStyle =
                "bg-green-500/30 border-2 border-green-400 rounded-lg hover:bg-green-500/50"
              cellIcon = (
                <div className="flex flex-col items-center">
                  <Navigation className="w-6 h-6 md:w-8 md:h-8 text-green-400 animate-pulse" />
                  <span className="text-xs text-green-400 font-bold mt-1">
                    MOVE
                  </span>
                </div>
              )
              isClickable = true
            }

            // Only render overlay if there's something to show
            if (!cellStyle) return null

            return (
              <div
                key={territory.id}
                className={`relative flex items-center p-4 justify-center transition-all duration-200
                  ${cellStyle} ${
                  isClickable
                    ? "pointer-events-auto cursor-pointer"
                    : "pointer-events-none"
                }`}
                style={{
                  gridColumn: gridY + 1, // CSS grid is 1-indexed
                  gridRow: gridX + 1,
                }}
                onClick={
                  isClickable ? () => onCellClick(gridX, gridY) : undefined
                }
              >
                {cellIcon}
              </div>
            )
          })}
        </div>
      </div>
    )
  }
)

MovementOverlay.displayName = "MovementOverlay"
