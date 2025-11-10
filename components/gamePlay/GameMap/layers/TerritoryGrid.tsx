import { memo, useCallback } from "react"
import { Crown, Flag, Sword } from "lucide-react"
import { Territory } from "@/lib/types/game"

interface TerritoryGridProps {
  flatTerritories: (Territory & { isSelected: boolean })[]
  isMobile: boolean
  onTerritoryClick: (e: React.MouseEvent, territory: Territory) => void
  children?: (territory: Territory) => React.ReactNode
}

/**
 * TerritoryGrid Component
 *
 * Renders the 3x3 grid of territory cells
 * Each cell shows territory name, icon, and unit counts
 */
export const TerritoryGrid = memo(
  ({ flatTerritories, isMobile, onTerritoryClick, children }: TerritoryGridProps) => {
    // Memoize icon function
    const getTerritoryIcon = useCallback((isCastle: boolean) => {
      return isCastle ? (
        <Crown className="w-3 h-3 md:w-4 md:h-4" />
      ) : (
        <Flag className="w-3 h-3 md:w-4 md:h-4" />
      )
    }, [])

    return (
      <div className="absolute inset-0 p-2 rounded-lg">
        <div className="w-full h-full grid grid-cols-3 grid-rows-3 gap-1">
          {flatTerritories.map((territory) => (
            <div
              key={territory.id}
              className="relative border-2 rounded-lg cursor-pointer transition-all duration-200 hover:scale-105 active:scale-95 bg-slate-700/50 border-slate-600"
              style={{
                minHeight: isMobile ? "80px" : "120px",
              }}
              onClick={(e) => onTerritoryClick(e, territory)}
            >
              <div className="p-2 md:p-3 h-full flex flex-col justify-between">
                {/* Territory Header */}
                <div className="flex items-center gap-1">
                  {getTerritoryIcon(territory.isCastle)}
                  <span className="text-xs md:text-sm font-bold truncate">
                    {territory.name}
                  </span>
                </div>

                {/* Territory Units */}
                <div className="text-xs flex flex-row justify-between gap-1">
                  {territory.units.map((unit, index) => (
                    <div key={index} className="flex items-center gap-1">
                      <Sword className="w-3 h-3" />
                      <span>{Number(unit)}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Render children (armies) */}
              {children && children(territory)}
            </div>
          ))}
        </div>
      </div>
    )
  }
)

TerritoryGrid.displayName = "TerritoryGrid"
