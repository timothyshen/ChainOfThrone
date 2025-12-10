import React, { memo, useCallback, useMemo } from "react"
import { Crown, Flag, Sword, Users } from "lucide-react"
import { Territory, Army } from "@/lib/types/game"
import { TerritoryTooltip } from "../tooltips/TerritoryTooltip"

interface TerritoryGridProps {
  flatTerritories: (Territory & { isSelected: boolean })[]
  isMobile: boolean
  armies: Army[]
  currentPlayerAddress?: `0x${string}`
  onTerritoryClick: (e: React.MouseEvent, territory: Territory) => void
  onArmyClick: (territory: Territory, army: Army) => void
  isLoading?: boolean
}

const zeroAddress = "0x0000000000000000000000000000000000000000"

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
                className="relative border-2 border-border rounded-lg bg-surface-3/50 animate-pulse aspect-square"
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
      return player && player.toLowerCase() !== zeroAddress.toLowerCase()
    }, [])

    // Get castle-specific styling
    const getCastleStyles = useCallback((territory: Territory & { isSelected: boolean }) => {
      if (!territory.isCastle) return ""

      const isOwned = hasOwner(territory.player)
      const isPlayerOwned = territory.player?.toLowerCase() === currentPlayerAddress?.toLowerCase()
      const isEnemyOwned = isOwned && !isPlayerOwned

      // Base castle styling - golden border
      let styles = "ring-2 ring-amber-500/50 "

      if (!isOwned) {
        // Uncontrolled castle - pulse animation to attract attention
        styles += "animate-pulse shadow-lg shadow-amber-500/30 "
      } else if (isPlayerOwned) {
        // Player's castle - blue with gold
        styles += "shadow-lg shadow-blue-500/30 "
      } else if (isEnemyOwned) {
        // Enemy's castle - red with gold (target!)
        styles += "shadow-lg shadow-red-500/30 "
      }

      return styles
    }, [currentPlayerAddress, hasOwner])

    // Get border color for territory
    const getBorderStyles = useCallback((territory: Territory & { isSelected: boolean }) => {
      if (territory.isSelected) {
        return "border-yellow-400 shadow-lg shadow-yellow-400/50 scale-105"
      }

      if (territory.isCastle) {
        const isOwned = hasOwner(territory.player)
        const isPlayerOwned = territory.player?.toLowerCase() === currentPlayerAddress?.toLowerCase()

        if (!isOwned) {
          return "border-amber-500 border-2"
        } else if (isPlayerOwned) {
          return "border-amber-500 border-2"
        } else {
          return "border-amber-500 border-2"
        }
      }

      return "border-border"
    }, [currentPlayerAddress, hasOwner])

    return (
      <div className="absolute inset-0 p-2 rounded-lg">
        <div className="w-full h-full grid grid-cols-3 grid-rows-3 gap-1">
          {flatTerritories.map((territory) => {
            const armyGroups = getArmiesAtTerritory(territory.x, territory.y)
            const hasFriendly = armyGroups.friendly.length > 0
            const hasEnemy = armyGroups.enemy.length > 0
            const friendlyUnits = armyGroups.friendly.reduce((sum, army) => sum + Number(army.size), 0)
            const enemyUnits = armyGroups.enemy.reduce((sum, army) => sum + Number(army.size), 0)
            const isPlayerOwned = territory.player?.toLowerCase() === currentPlayerAddress?.toLowerCase()
            const isEnemyOwned = hasOwner(territory.player) && !isPlayerOwned

            // Wrap cell content - tooltip only on desktop
            const cellContent = (
            <div
              role="button"
              tabIndex={0}
              aria-label={`${territory.name}${territory.isCastle ? ' (Castle - Win Condition!)' : ''}${hasFriendly ? `, ${armyGroups.friendly.reduce((sum, army) => sum + Number(army.size), 0)} friendly units` : ''}${hasEnemy ? `, ${armyGroups.enemy.reduce((sum, army) => sum + Number(army.size), 0)} enemy units` : ''}`}
              aria-pressed={territory.isSelected}
              className={`relative border-2 rounded-lg cursor-pointer transition-all duration-200 hover:scale-[1.02] active:scale-95 aspect-square focus:outline-none focus:ring-2 focus:ring-yellow-400
                ${territory.isCastle ? 'bg-surface-3/70' : 'bg-surface-3/50'}
                ${getBorderStyles(territory)}
                ${getCastleStyles(territory)}`}
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
                  {territory.isCastle ? (
                    <div className="relative">
                      <Crown className="w-4 h-4 md:w-5 md:h-5 text-amber-400" />
                      {/* Glow effect for castles */}
                      <div className="absolute inset-0 blur-sm">
                        <Crown className="w-4 h-4 md:w-5 md:h-5 text-amber-400/50" />
                      </div>
                    </div>
                  ) : (
                    <Flag className="w-3 h-3 md:w-4 md:h-4 text-text-secondary" />
                  )}
                  <span className={`text-[10px] md:text-xs font-bold truncate ${territory.isCastle ? 'text-amber-200' : ''}`}>
                    {territory.name}
                  </span>
                  {territory.isCastle && (
                    <span className="text-[8px] md:text-[10px] text-amber-400/70 font-medium">
                      (Castle)
                    </span>
                  )}
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

              {/* Bottom Color Bar - Territory Owner (with castle accent) */}
              <div className="absolute bottom-0 left-0 right-0 flex">
                {territory.isCastle && (
                  <div className="w-1 h-1.5 bg-amber-400" />
                )}
                {hasOwner(territory.player) ? (
                  <div
                    className={`flex-1 h-1 ${getTerritoryColor(territory.player)}`}
                  />
                ) : (
                  territory.isCastle && (
                    <div className="flex-1 h-1 bg-surface-3/50" />
                  )
                )}
                {territory.isCastle && (
                  <div className="w-1 h-1.5 bg-amber-400" />
                )}
              </div>
            </div>
            )

            // On desktop, wrap with tooltip; on mobile, render directly
            if (isMobile) {
              return React.cloneElement(cellContent, { key: territory.id })
            }

            return (
              <TerritoryTooltip
                key={territory.id}
                territory={territory}
                friendlyUnits={friendlyUnits}
                enemyUnits={enemyUnits}
                isPlayerOwned={isPlayerOwned}
                isEnemyOwned={isEnemyOwned}
                hasArmy={hasFriendly || hasEnemy}
              >
                {React.cloneElement(cellContent, { key: territory.id })}
              </TerritoryTooltip>
            )
          })}
        </div>
      </div>
    )
  }
)

TerritoryGrid.displayName = "TerritoryGrid"
