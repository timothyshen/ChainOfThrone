import { useMemo } from "react"
import { useTerritoryActions } from "./useTerritoryActions"
import { useMovementActions } from "./useMovementActions"
import { useBattleActions } from "./useBattleActions"
import { getTerritoryColor } from "./utils"

/**
 * Main Game Actions Hook
 *
 * Combines all game action hooks into a single interface
 * Provides backward compatibility while keeping code organized
 *
 * @param gameAddress - The game contract address
 * @param isMobile - Mobile mode flag
 * @param setMobileBottomPanelOpen - Mobile panel state setter
 */
export function useGameActions(
  gameAddress: `0x${string}` | undefined,
  isMobile?: boolean,
  setMobileBottomPanelOpen?: (open: boolean) => void
) {
  // Territory actions (selection, validation)
  const { handleTerritoryClick, handleArmyClick } = useTerritoryActions()

  // Movement actions (move execution, animations)
  const { handleMoveToCell, handleAction } = useMovementActions(gameAddress)

  // Battle actions (combat flow)
  const { handleInitializeBattle, handleStartBattle } = useBattleActions()

  // Return combined interface
  return useMemo(
    () => ({
      // Territory interactions
      handleTerritoryClick,
      handleArmyClick,

      // Movement actions
      handleMoveToCell,
      handleAction,

      // Battle actions
      handleInitializeBattle,
      handleStartBattle,

      // UI helpers
      getTerritoryColor,
    }),
    [
      handleTerritoryClick,
      handleArmyClick,
      handleMoveToCell,
      handleAction,
      handleInitializeBattle,
      handleStartBattle,
    ]
  )
}

// Export individual hooks for granular usage
export { useTerritoryActions } from "./useTerritoryActions"
export { useMovementActions } from "./useMovementActions"
export { useBattleActions } from "./useBattleActions"
export { getTerritoryColor } from "./utils"
