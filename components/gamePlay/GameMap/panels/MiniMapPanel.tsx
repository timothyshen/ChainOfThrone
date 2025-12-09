"use client"

import { memo, useMemo, useState } from "react"
import { Crown, Users, ChevronDown, ChevronUp, Map } from "lucide-react"
import { useGameStateContext } from "@/lib/contexts/GameContext"
import { useAccount } from "wagmi"

const zeroAddress = "0x0000000000000000000000000000000000000000"
const CASTLES_TO_WIN = 3

interface MiniMapPanelProps {
  isCollapsible?: boolean
  defaultExpanded?: boolean
}

/**
 * MiniMapPanel Component
 *
 * Provides a quick strategic overview:
 * - Castle status with progress bars
 * - Army strength comparison
 * - Mini map showing territory control
 */
export const MiniMapPanel = memo(({
  isCollapsible = true,
  defaultExpanded = true,
}: MiniMapPanelProps) => {
  const [isExpanded, setIsExpanded] = useState(defaultExpanded)
  const { territories, armies } = useGameStateContext()
  const { address } = useAccount()

  // Calculate statistics
  const stats = useMemo(() => {
    const flatTerritories = territories.flat()

    let playerCastles = 0
    let enemyCastles = 0
    let neutralCastles = 0
    let playerTerritories = 0
    let enemyTerritories = 0
    let playerUnits = 0
    let enemyUnits = 0

    // Count territories and castles
    flatTerritories.forEach((territory) => {
      const isPlayerOwned = territory.player?.toLowerCase() === address?.toLowerCase()
      const hasOwner = territory.player && territory.player.toLowerCase() !== zeroAddress.toLowerCase()
      const isEnemyOwned = hasOwner && !isPlayerOwned

      if (territory.isCastle) {
        if (isPlayerOwned) playerCastles++
        else if (isEnemyOwned) enemyCastles++
        else neutralCastles++
      }

      if (isPlayerOwned) playerTerritories++
      else if (isEnemyOwned) enemyTerritories++
    })

    // Count units
    armies.forEach((army) => {
      if (army.owner.toLowerCase() === address?.toLowerCase()) {
        playerUnits += army.size
      } else {
        enemyUnits += army.size
      }
    })

    return {
      playerCastles,
      enemyCastles,
      neutralCastles,
      playerTerritories,
      enemyTerritories,
      playerUnits,
      enemyUnits,
      totalCastles: playerCastles + enemyCastles + neutralCastles,
    }
  }, [territories, armies, address])

  // Generate mini map grid
  const miniMapGrid = useMemo(() => {
    return territories.map((row, rowIndex) =>
      row.map((territory, colIndex) => {
        const isPlayerOwned = territory.player?.toLowerCase() === address?.toLowerCase()
        const hasOwner = territory.player && territory.player.toLowerCase() !== zeroAddress.toLowerCase()
        const isEnemyOwned = hasOwner && !isPlayerOwned

        // Check for armies
        const hasPlayerArmy = armies.some(
          army => army.x === rowIndex && army.y === colIndex && army.owner.toLowerCase() === address?.toLowerCase()
        )
        const hasEnemyArmy = armies.some(
          army => army.x === rowIndex && army.y === colIndex && army.owner.toLowerCase() !== address?.toLowerCase()
        )

        return {
          id: territory.id,
          isCastle: territory.isCastle,
          isPlayerOwned,
          isEnemyOwned,
          isNeutral: !hasOwner,
          hasPlayerArmy,
          hasEnemyArmy,
        }
      })
    )
  }, [territories, armies, address])

  const header = (
    <div
      className={`flex items-center justify-between p-2 ${isCollapsible ? 'cursor-pointer hover:bg-slate-700/50' : ''}`}
      onClick={() => isCollapsible && setIsExpanded(!isExpanded)}
    >
      <div className="flex items-center gap-2">
        <Map className="w-4 h-4 text-slate-400" />
        <span className="text-sm font-medium">Overview</span>
      </div>
      {isCollapsible && (
        isExpanded ? (
          <ChevronUp className="w-4 h-4 text-slate-400" />
        ) : (
          <ChevronDown className="w-4 h-4 text-slate-400" />
        )
      )}
    </div>
  )

  if (!isExpanded && isCollapsible) {
    return (
      <div className="bg-slate-800/90 backdrop-blur-sm border border-slate-700 rounded-lg overflow-hidden">
        {header}
      </div>
    )
  }

  return (
    <div className="bg-slate-800/90 backdrop-blur-sm border border-slate-700 rounded-lg overflow-hidden">
      {header}

      <div className="p-3 pt-0 space-y-3">
        {/* Castle Status */}
        <div className="space-y-2">
          <div className="flex items-center gap-1 text-xs text-amber-400 font-medium">
            <Crown className="w-3 h-3" />
            CASTLE STATUS
          </div>

          {/* Player Castles */}
          <div className="space-y-1">
            <div className="flex items-center justify-between text-xs">
              <span className="text-blue-400">You</span>
              <span className="font-bold text-blue-400">{stats.playerCastles}/{CASTLES_TO_WIN}</span>
            </div>
            <div className="h-1.5 bg-slate-700 rounded-full overflow-hidden">
              <div
                className="h-full bg-blue-500 transition-all duration-300"
                style={{ width: `${(stats.playerCastles / CASTLES_TO_WIN) * 100}%` }}
              />
            </div>
          </div>

          {/* Enemy Castles */}
          <div className="space-y-1">
            <div className="flex items-center justify-between text-xs">
              <span className="text-red-400">Enemy</span>
              <span className="font-bold text-red-400">{stats.enemyCastles}/{CASTLES_TO_WIN}</span>
            </div>
            <div className="h-1.5 bg-slate-700 rounded-full overflow-hidden">
              <div
                className="h-full bg-red-500 transition-all duration-300"
                style={{ width: `${(stats.enemyCastles / CASTLES_TO_WIN) * 100}%` }}
              />
            </div>
          </div>

          {stats.neutralCastles > 0 && (
            <div className="text-[10px] text-slate-500 text-center">
              {stats.neutralCastles} unclaimed castle{stats.neutralCastles > 1 ? 's' : ''}
            </div>
          )}
        </div>

        {/* Army Strength */}
        <div className="space-y-2">
          <div className="flex items-center gap-1 text-xs text-slate-400 font-medium">
            <Users className="w-3 h-3" />
            ARMY STRENGTH
          </div>

          <div className="flex items-center justify-between text-xs">
            <div className="flex items-center gap-1">
              <div className="w-2 h-2 rounded-full bg-blue-500" />
              <span className="text-blue-400">You: {stats.playerUnits}</span>
            </div>
            <div className="flex items-center gap-1">
              <span className="text-red-400">Enemy: {stats.enemyUnits}</span>
              <div className="w-2 h-2 rounded-full bg-red-500" />
            </div>
          </div>

          {/* Strength bar */}
          <div className="h-2 bg-slate-700 rounded-full overflow-hidden flex">
            <div
              className="h-full bg-blue-500 transition-all duration-300"
              style={{
                width: `${stats.playerUnits + stats.enemyUnits > 0
                  ? (stats.playerUnits / (stats.playerUnits + stats.enemyUnits)) * 100
                  : 50}%`
              }}
            />
            <div
              className="h-full bg-red-500 transition-all duration-300"
              style={{
                width: `${stats.playerUnits + stats.enemyUnits > 0
                  ? (stats.enemyUnits / (stats.playerUnits + stats.enemyUnits)) * 100
                  : 50}%`
              }}
            />
          </div>
        </div>

        {/* Mini Map Grid */}
        <div className="space-y-2">
          <div className="flex items-center gap-1 text-xs text-slate-400 font-medium">
            <Map className="w-3 h-3" />
            MAP OVERVIEW
          </div>

          <div className="grid grid-cols-3 gap-1 p-2 bg-slate-900/50 rounded-lg">
            {miniMapGrid.flat().map((cell) => (
              <div
                key={cell.id}
                className={`
                  aspect-square rounded-sm flex items-center justify-center text-[8px] font-bold
                  ${cell.isPlayerOwned
                    ? 'bg-blue-500/60 border border-blue-400'
                    : cell.isEnemyOwned
                    ? 'bg-red-500/60 border border-red-400'
                    : 'bg-slate-600/60 border border-slate-500'
                  }
                  ${cell.isCastle ? 'ring-1 ring-amber-400' : ''}
                `}
              >
                {cell.isCastle && (
                  <Crown className={`w-2.5 h-2.5 ${
                    cell.isPlayerOwned ? 'text-blue-200' :
                    cell.isEnemyOwned ? 'text-red-200' :
                    'text-amber-400'
                  }`} />
                )}
                {!cell.isCastle && (cell.hasPlayerArmy || cell.hasEnemyArmy) && (
                  <div className={`w-1.5 h-1.5 rounded-full ${
                    cell.hasPlayerArmy ? 'bg-green-400' : 'bg-red-400'
                  }`} />
                )}
              </div>
            ))}
          </div>

          {/* Legend */}
          <div className="flex items-center justify-center gap-3 text-[9px] text-slate-500">
            <div className="flex items-center gap-1">
              <div className="w-2 h-2 bg-blue-500/60 border border-blue-400 rounded-sm" />
              <span>You</span>
            </div>
            <div className="flex items-center gap-1">
              <div className="w-2 h-2 bg-red-500/60 border border-red-400 rounded-sm" />
              <span>Enemy</span>
            </div>
            <div className="flex items-center gap-1">
              <div className="w-2 h-2 bg-slate-600/60 border border-slate-500 rounded-sm ring-1 ring-amber-400" />
              <span>Castle</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
})

MiniMapPanel.displayName = "MiniMapPanel"
