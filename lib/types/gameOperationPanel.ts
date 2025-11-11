import { Army, Territory } from "@/lib/types/game"
import { BattleState, BattleTarget } from "@/lib/types/advancedGame"

/**
 * Action state types for GameOperationPanel
 */
export type ActionState = 'battlePreview' | 'movementInput' | 'battleProgress' | 'movementMode' | 'none'

/**
 * Props for BattlePreview component
 */
export interface BattlePreviewProps {
  selectedArmy: Army
  battleTarget: BattleTarget
  getTerritoryColor: (owner: string) => string
  calculateBattleOdds: (attacker: Army, defender: Army | Territory) => {
    attackerOdds: number
    defenderOdds: number
  }
  onCancel: () => void
  onStartBattle: () => void
  isMobile?: boolean
}

/**
 * Props for MovementInput component
 */
export interface MovementInputProps {
  selectedArmy: Army
  targetTerritory: Territory | null
  moveStrength: number
  animatingArmies: Set<string>
  onMoveStrengthChange: (value: number) => void
  onMoveArmy: () => void
  isMobile?: boolean
}

/**
 * Props for BattleProgress component
 */
export interface BattleProgressProps {
  activeBattle: BattleState | null
  isMobile?: boolean
}

/**
 * Props for MovementMode component
 */
export interface MovementModeProps {
  onCancel: () => void
  isMobile?: boolean
}

/**
 * Props for ArmyDetails component
 */
export interface ArmyDetailsProps {
  selectedArmy: Army
  animatingArmies: Set<string>
  getTerritoryColor: (owner: string) => string
  isMobile?: boolean
}

/**
 * Props for main GameOperationPanel component
 */
export interface GameOperationPanelProps {
  gameAddress: `0x${string}` | undefined
  isMobile?: boolean
  mobileBottomPanelOpen: boolean
  setMobileBottomPanelOpen?: (open: boolean) => void
}
