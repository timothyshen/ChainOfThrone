import { useCallback } from "react"
import { Army, Territory } from "@/lib/types/game"
import { useBattleContext, useMovementContext } from "@/lib/contexts/GameContext"

/**
 * useBattleActions Hook
 *
 * Handles battle initialization and execution
 * Manages battle preview and combat flow
 */
export function useBattleActions() {
  const { activeBattle, initializeBattle, startBattle } = useBattleContext()
  const { cancelMovement, getArmyDisplayPosition } = useMovementContext()

  /**
   * Initialize battle preview
   * Shows battle odds before committing to combat
   */
  const handleInitializeBattle = useCallback(
    (attacker: Army, target: Army | Territory) => {
      // Don't start a new battle if one is already active
      if (!activeBattle) {
        initializeBattle(attacker, target)
      }
    },
    [initializeBattle, activeBattle]
  )

  /**
   * Start battle
   * Clears movement mode and begins combat
   */
  const handleStartBattle = useCallback(
    (attacker: Army, target: Army | Territory) => {
      // Clear movement mode when starting battle
      cancelMovement()
      startBattle(attacker, target, getArmyDisplayPosition)
    },
    [startBattle, getArmyDisplayPosition, cancelMovement]
  )

  return {
    handleInitializeBattle,
    handleStartBattle,
  }
}
