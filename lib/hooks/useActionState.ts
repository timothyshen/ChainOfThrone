import { useMemo } from "react"
import { Army } from "@/lib/types/game"
import { BattleState, BattleTarget } from "@/lib/types/advancedGame"
import type { ActionState } from "@/lib/types/gameOperationPanel"

/**
 * useActionState Hook
 *
 * Determines the current action state based on game context
 * Returns the appropriate state for rendering the correct UI panel
 */
export function useActionState(
  selectedArmy: Army | null,
  showBattlePreview: boolean,
  battleTarget: BattleTarget | null,
  moveSubmitted: boolean,
  activeBattle: BattleState | null
): ActionState {
  return useMemo(() => {
    // Battle preview takes priority
    if (showBattlePreview && battleTarget) {
      return 'battlePreview'
    }

    // Movement input when user has selected destination
    if (moveSubmitted) {
      return 'movementInput'
    }

    // Active battle for this army
    if (activeBattle && selectedArmy && activeBattle.attackerArmy.id === selectedArmy.id) {
      return 'battleProgress'
    }

    // Default state: no specific action
    return 'none'
  }, [showBattlePreview, battleTarget, moveSubmitted, activeBattle, selectedArmy])
}

/**
 * Get action title for display
 */
export function getActionTitle(actionState: ActionState): string {
  switch (actionState) {
    case 'battlePreview':
      return 'Battle Preview'
    case 'movementInput':
      return 'Move Army'
    case 'battleProgress':
      return 'Battle in Progress'
    case 'movementMode':
      return 'Movement Mode'
    default:
      return 'Army Actions'
  }
}
