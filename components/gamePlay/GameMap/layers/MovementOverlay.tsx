import { memo } from "react"
import { Navigation, Swords, Crown } from "lucide-react"
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
 * Enhanced display of valid movement cells and battle destinations:
 * - Pulsing glow for current position
 * - Green highlight for valid moves
 * - Red/purple highlight for attack destinations
 * - Castle indicators for strategic targets
 * - Dimming of non-interactive cells
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

            // Check if this is a castle (strategic target)
            const isCastle = territory.isCastle

            // Priority system - only show one indicator per cell
            let cellStyle = ""
            let cellIcon = null
            let isClickable = false
            let glowColor = ""

            if (isCurrentPosition) {
              // Current army position - bright pulsing indicator
              cellStyle = "bg-blue-500/40 border-2 border-blue-400 rounded-lg"
              glowColor = "shadow-[0_0_20px_rgba(59,130,246,0.6)]"
              cellIcon = (
                <div className="flex flex-col items-center">
                  <div className="relative">
                    <div className="w-8 h-8 md:w-10 md:h-10 rounded-full bg-blue-500/50 animate-ping absolute inset-0" />
                    <div className="w-8 h-8 md:w-10 md:h-10 rounded-full bg-blue-400 flex items-center justify-center relative">
                      <span className="text-white font-bold text-sm">
                        {selectedArmy?.size}
                      </span>
                    </div>
                  </div>
                  <span className="text-xs text-blue-300 font-bold mt-2 bg-blue-900/70 px-2 py-0.5 rounded">
                    YOUR ARMY
                  </span>
                </div>
              )
            } else if (hasEnemyArmy) {
              // Battle destination - red/purple with attack icon
              cellStyle =
                "bg-red-500/30 border-2 border-red-400 rounded-lg hover:bg-red-500/50 hover:scale-[1.02] transition-all"
              glowColor = "shadow-[0_0_15px_rgba(239,68,68,0.4)]"
              cellIcon = (
                <div className="flex flex-col items-center">
                  <div className="relative">
                    <Swords className="w-8 h-8 md:w-10 md:h-10 text-red-400 animate-pulse" />
                    {isCastle && (
                      <Crown className="w-4 h-4 text-amber-400 absolute -top-1 -right-1" />
                    )}
                  </div>
                  <span className="text-xs text-red-300 font-bold mt-2 bg-red-900/70 px-2 py-0.5 rounded flex items-center gap-1">
                    <Swords className="w-3 h-3" />
                    ATTACK
                  </span>
                </div>
              )
              isClickable = true
            } else if (isValidMove) {
              // Valid movement cell - green with navigation icon
              const baseBg = isCastle ? "bg-amber-500/30" : "bg-green-500/30"
              const baseBorder = isCastle ? "border-amber-400" : "border-green-400"
              const hoverBg = isCastle ? "hover:bg-amber-500/50" : "hover:bg-green-500/50"

              cellStyle = `${baseBg} border-2 ${baseBorder} rounded-lg ${hoverBg} hover:scale-[1.02] transition-all`
              glowColor = isCastle
                ? "shadow-[0_0_15px_rgba(251,191,36,0.4)]"
                : "shadow-[0_0_15px_rgba(34,197,94,0.3)]"

              cellIcon = (
                <div className="flex flex-col items-center">
                  <div className="relative">
                    {isCastle ? (
                      <Crown className="w-8 h-8 md:w-10 md:h-10 text-amber-400 animate-pulse" />
                    ) : (
                      <Navigation className="w-8 h-8 md:w-10 md:h-10 text-green-400 animate-pulse" />
                    )}
                  </div>
                  <span className={`text-xs font-bold mt-2 px-2 py-0.5 rounded flex items-center gap-1 ${
                    isCastle
                      ? "text-amber-300 bg-amber-900/70"
                      : "text-green-300 bg-green-900/70"
                  }`}>
                    {isCastle ? (
                      <>
                        <Crown className="w-3 h-3" />
                        CAPTURE
                      </>
                    ) : (
                      <>
                        <Navigation className="w-3 h-3" />
                        MOVE
                      </>
                    )}
                  </span>
                </div>
              )
              isClickable = true
            } else {
              // Non-interactive cell - dim overlay
              return (
                <div
                  key={territory.id}
                  className="relative bg-stone-800/40 rounded-lg"
                  style={{
                    gridColumn: gridY + 1,
                    gridRow: gridX + 1,
                  }}
                />
              )
            }

            return (
              <div
                key={territory.id}
                className={`relative flex items-center p-4 justify-center transition-all duration-200
                  ${cellStyle} ${glowColor} ${
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
