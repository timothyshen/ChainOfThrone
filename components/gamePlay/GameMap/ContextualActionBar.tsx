"use client"

import { memo, useMemo } from "react"
import { Crown, Users, Navigation, Sword, Target, Shield, Flag } from "lucide-react"
import { useGameStateContext, useSelectionContext, useMovementContext } from "@/lib/contexts/GameContext"
import { useAccount } from "wagmi"

const zeroAddress = "0x0000000000000000000000000000000000000000"
const CASTLES_TO_WIN = 3

interface ContextualActionBarProps {
  isMobile?: boolean
}

/**
 * ContextualActionBar Component
 *
 * Provides contextual guidance based on current game state:
 * - Nothing selected: Guide to select army
 * - Army selected: Show movement options
 * - Enemy territory info: Show attack hints
 */
export const ContextualActionBar = memo(({ isMobile = false }: ContextualActionBarProps) => {
  const { territories, armies } = useGameStateContext()
  const { selectedArmy, selectedTerritory } = useSelectionContext()
  const { movementMode, validMovementCells } = useMovementContext()
  const { address } = useAccount()

  // Calculate castle stats for context
  const castleStats = useMemo(() => {
    const flatTerritories = territories.flat()
    const castles = flatTerritories.filter((t) => t.isCastle)

    let player = 0
    let enemy = 0
    let neutral = 0

    castles.forEach((castle) => {
      if (!castle.player || castle.player.toLowerCase() === zeroAddress.toLowerCase()) {
        neutral++
      } else if (castle.player.toLowerCase() === address?.toLowerCase()) {
        player++
      } else {
        enemy++
      }
    })

    return { player, enemy, neutral }
  }, [territories, address])

  // Get player's armies
  const playerArmies = useMemo(() => {
    return armies.filter(army => army.owner.toLowerCase() === address?.toLowerCase())
  }, [armies, address])

  // Determine what action hint to show
  const actionHint = useMemo(() => {
    // If army is selected and in movement mode
    if (selectedArmy && movementMode) {
      const attackTargets = validMovementCells.filter(cell => {
        return armies.some(army =>
          army.x === cell.x &&
          army.y === cell.y &&
          army.owner.toLowerCase() !== address?.toLowerCase()
        )
      })

      const moveTargets = validMovementCells.filter(cell => {
        return !armies.some(army =>
          army.x === cell.x &&
          army.y === cell.y &&
          army.owner.toLowerCase() !== address?.toLowerCase()
        )
      })

      return {
        type: "armySelected" as const,
        armySize: selectedArmy.size,
        moveOptions: moveTargets.length,
        attackOptions: attackTargets.length,
      }
    }

    // If a territory is selected (not own army)
    if (selectedTerritory && !selectedArmy) {
      const isPlayerOwned = selectedTerritory.player?.toLowerCase() === address?.toLowerCase()
      const isEnemyOwned = selectedTerritory.player &&
        selectedTerritory.player.toLowerCase() !== zeroAddress.toLowerCase() &&
        !isPlayerOwned

      const enemyUnits = armies
        .filter(army =>
          army.x === selectedTerritory.x &&
          army.y === selectedTerritory.y &&
          army.owner.toLowerCase() !== address?.toLowerCase()
        )
        .reduce((sum, army) => sum + army.size, 0)

      return {
        type: "territoryInfo" as const,
        name: selectedTerritory.name,
        isCastle: selectedTerritory.isCastle,
        isPlayerOwned,
        isEnemyOwned,
        enemyUnits,
      }
    }

    // Default: nothing selected
    return {
      type: "noSelection" as const,
      hasArmies: playerArmies.length > 0,
      totalUnits: playerArmies.reduce((sum, army) => sum + army.size, 0),
      castlesNeeded: CASTLES_TO_WIN - castleStats.player,
    }
  }, [selectedArmy, selectedTerritory, movementMode, validMovementCells, armies, address, playerArmies, castleStats])

  // Render content based on action hint
  const renderContent = () => {
    switch (actionHint.type) {
      case "armySelected":
        return (
          <div className="flex items-center justify-between w-full">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-full bg-game-player flex items-center justify-center animate-pulse">
                <Users className="w-4 h-4 text-white" />
              </div>
              <div>
                <p className="text-sm font-medium text-foreground">
                  {actionHint.armySize} units ready to move
                </p>
                <p className="text-xs text-text-secondary">
                  Tap <span className="text-emerald-500 font-medium">green</span> to move
                  {actionHint.attackOptions > 0 && (
                    <>, <span className="text-game-enemy font-medium">red</span> to attack</>
                  )}
                </p>
              </div>
            </div>
            <div className="flex gap-3">
              {actionHint.moveOptions > 0 && (
                <div className="flex items-center gap-1 text-emerald-600 text-xs bg-emerald-50 px-2 py-1 rounded">
                  <Navigation className="w-3 h-3" />
                  <span>{actionHint.moveOptions} moves</span>
                </div>
              )}
              {actionHint.attackOptions > 0 && (
                <div className="flex items-center gap-1 text-game-enemy text-xs bg-red-50 px-2 py-1 rounded">
                  <Sword className="w-3 h-3" />
                  <span>{actionHint.attackOptions} attacks</span>
                </div>
              )}
            </div>
          </div>
        )

      case "territoryInfo":
        return (
          <div className="flex items-center justify-between w-full">
            <div className="flex items-center gap-2">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                actionHint.isCastle ? "bg-game-castle" :
                actionHint.isEnemyOwned ? "bg-game-enemy" :
                actionHint.isPlayerOwned ? "bg-game-player" :
                "bg-game-neutral"
              }`}>
                {actionHint.isCastle ? (
                  <Crown className="w-4 h-4 text-white" />
                ) : (
                  <Flag className="w-4 h-4 text-white" />
                )}
              </div>
              <div>
                <p className="text-sm font-medium text-foreground flex items-center gap-1">
                  {actionHint.name}
                  {actionHint.isCastle && (
                    <span className="text-[10px] text-game-castle">(Castle)</span>
                  )}
                </p>
                <p className="text-xs text-text-secondary">
                  {actionHint.isPlayerOwned ? "Your territory" :
                   actionHint.isEnemyOwned ? `Enemy territory (${actionHint.enemyUnits} units)` :
                   "Neutral territory"}
                </p>
              </div>
            </div>
            {actionHint.isEnemyOwned && actionHint.isCastle && (
              <div className="flex items-center gap-1 text-game-castle text-xs bg-game-castle-light px-2 py-1 rounded">
                <Target className="w-3 h-3" />
                <span>Capture to win!</span>
              </div>
            )}
          </div>
        )

      case "noSelection":
      default:
        return (
          <div className="flex items-center justify-between w-full">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-full bg-game-player/20 flex items-center justify-center border-2 border-dashed border-game-player">
                <Users className="w-4 h-4 text-game-player" />
              </div>
              <div>
                <p className="text-sm font-medium text-foreground">
                  {actionHint.hasArmies ? (
                    <>Your turn - tap your <span className="text-game-player">blue army</span></>
                  ) : (
                    <>Waiting for units...</>
                  )}
                </p>
                <p className="text-xs text-text-secondary">
                  {actionHint.hasArmies
                    ? `You have ${actionHint.totalUnits} units ready to command`
                    : "No armies available to move"}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-1 text-game-castle text-xs bg-game-castle/10 border border-game-castle/30 px-2 py-1 rounded">
              <Crown className="w-3 h-3" />
              <span className="font-medium">
                {actionHint.castlesNeeded > 0
                  ? `Need ${actionHint.castlesNeeded} more`
                  : "Victory!"}
              </span>
            </div>
          </div>
        )
    }
  }

  return (
    <div
      className="bg-surface-1 border-t border-border shadow-soft px-4 py-3"
      style={{ paddingBottom: "max(12px, env(safe-area-inset-bottom, 0px))" }}
    >
      {renderContent()}
    </div>
  )
})

ContextualActionBar.displayName = "ContextualActionBar"
