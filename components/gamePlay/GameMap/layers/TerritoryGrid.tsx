import { memo, useCallback } from "react"
import { Crown, Flag, Sword, Users } from "lucide-react"
import { Territory, Army } from "@/lib/types/game"

interface TerritoryGridProps {
  flatTerritories: (Territory & { isSelected: boolean })[]
  isMobile: boolean
  armies: Army[]
  currentPlayerAddress?: `0x${string}`
  onTerritoryClick: (e: React.MouseEvent, territory: Territory) => void
  onArmyClick: (territory: Territory, army: Army) => void
  isLoading?: boolean
}

/**
 * TerritoryGrid Component
 *
 * Renders the 3x3 grid of territory cells
 * Each cell shows territory name, icon, and unit counts
 */
export const TerritoryGrid = memo(
  ({ flatTerritories, isMobile, armies, currentPlayerAddress, onTerritoryClick, onArmyClick, isLoading }: TerritoryGridProps) => {
    // Loading skeleton
    if (isLoading) {
      return (
        <div className="absolute inset-0 p-2 rounded-lg">
          <div className="w-full h-full grid grid-cols-3 grid-rows-3 gap-1">
            {Array.from({ length: 9 }).map((_, i) => (
              <div
                key={i}
                className="relative border-2 border-slate-600 rounded-lg bg-slate-700/50 animate-pulse min-h-[80px] md:min-h-[120px]"
              />
            ))}
          </div>
        </div>
      )
    }
    // Memoize icon function
    const getTerritoryIcon = useCallback((isCastle: boolean) => {
      return isCastle ? (
        <Crown className="w-3 h-3 md:w-4 md:h-4" />
      ) : (
        <Flag className="w-3 h-3 md:w-4 md:h-4" />
      )
    }, [])

    // Get armies at a specific territory, separated by ownership
    const getArmiesAtTerritory = useCallback((x: number, y: number) => {
      const armiesAtPos = armies.filter(army => army.x === x && army.y === y)
      return {
        friendly: armiesAtPos.filter(army => army.owner === currentPlayerAddress),
        enemy: armiesAtPos.filter(army => army.owner !== currentPlayerAddress),
      }
    }, [armies, currentPlayerAddress])

    // Get territory owner color
    const getTerritoryColor = useCallback((player: `0x${string}`) => {
      if (!currentPlayerAddress) return "bg-gray-500"
      return player === currentPlayerAddress ? "bg-blue-500" : "bg-red-500"
    }, [currentPlayerAddress])

    // Check if territory has an owner
    const hasOwner = useCallback((player: `0x${string}`) => {
      const zeroAddress = "0x0000000000000000000000000000000000000000"
      return player && player.toLowerCase() !== zeroAddress.toLowerCase()
    }, [])

    return (
      <div className="absolute inset-0 p-2 rounded-lg">
        <div className="w-full h-full grid grid-cols-3 grid-rows-3 gap-1">
          {flatTerritories.map((territory) => {
            const armyGroups = getArmiesAtTerritory(territory.x, territory.y)
            const hasFriendly = armyGroups.friendly.length > 0
            const hasEnemy = armyGroups.enemy.length > 0

            return (
            <div
              key={territory.id}
              role="button"
              tabIndex={0}
              aria-label={`${territory.name}${territory.isCastle ? ' (Castle)' : ''}${hasFriendly ? `, ${armyGroups.friendly.reduce((sum, army) => sum + Number(army.size), 0)} friendly units` : ''}${hasEnemy ? `, ${armyGroups.enemy.reduce((sum, army) => sum + Number(army.size), 0)} enemy units` : ''}`}
              aria-pressed={territory.isSelected}
              className={`relative border-2 rounded-lg cursor-pointer transition-all duration-200 hover:scale-105 active:scale-95 bg-slate-700/50 min-h-[80px] md:min-h-[120px] min-w-[60px] md:min-w-0 focus:outline-none focus:ring-2 focus:ring-yellow-400
                ${territory.isSelected
                  ? 'border-yellow-400 shadow-lg shadow-yellow-400/50 scale-105'
                  : 'border-slate-600'
                }`}
              onClick={(e) => onTerritoryClick(e, territory)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault()
                  onTerritoryClick(e as unknown as React.MouseEvent, territory)
                }
              }}
            >
              {/* Territory Content */}
              <div className="p-2 md:p-3 h-full flex flex-col justify-between">
                {/* Top: Territory Name & Icon */}
                <div className="flex items-center gap-1">
                  {getTerritoryIcon(territory.isCastle)}
                  <span className="text-[10px] md:text-xs font-bold truncate">
                    {territory.name}
                  </span>
                </div>

                {/* Middle: Army Information */}
                {(hasFriendly || hasEnemy) && (
                  <div className="flex flex-row justify-center items-center gap-2 text-xs md:text-sm pointer-events-auto">
                    {/* Friendly Armies */}
                    {hasFriendly && (
                      <div
                        className="flex items-center gap-1 text-green-400 cursor-pointer hover:scale-110 transition-transform"
                        onClick={(e) => {
                          e.stopPropagation()
                          // Click on first friendly army
                          if (armyGroups.friendly[0]) {
                            onArmyClick(territory, armyGroups.friendly[0])
                          }
                        }}
                      >
                        <Users className="w-3 h-3 md:w-4 md:h-4" />
                        <span className="font-bold">
                          {armyGroups.friendly.reduce((sum, army) => sum + Number(army.size), 0)}
                        </span>
                      </div>
                    )}

                    {/* Enemy Armies */}
                    {hasEnemy && (
                      <div className="flex items-center gap-1 text-red-400">
                        <Users className="w-3 h-3 md:w-4 md:h-4" strokeWidth={1.5} />
                        <span className="font-bold">
                          {armyGroups.enemy.reduce((sum, army) => sum + Number(army.size), 0)}
                        </span>
                      </div>
                    )}
                  </div>
                )}

                {/* Bottom: Territory Units */}
                <div className="flex items-center gap-1 text-xs">
                  {territory.units.length > 0 && (
                    <div className="flex items-center gap-1">
                      <Sword className="w-3 h-3" />
                      <span>
                        {territory.units.map(u => Number(u)).join('/')}
                      </span>
                    </div>
                  )}
                </div>
              </div>

              {/* Bottom Color Bar - Territory Owner (only if territory has owner) */}
              {hasOwner(territory.player) && (
                <div
                  className={`absolute bottom-0 left-0 right-0 h-1 ${getTerritoryColor(territory.player)}`}
                />
              )}
            </div>
            )
          })}
        </div>
      </div>
    )
  }
)

TerritoryGrid.displayName = "TerritoryGrid"
