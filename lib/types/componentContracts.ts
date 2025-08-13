import { Territory, Army } from '@/lib/types/game'
import { GameStatusEnum, PlayerState } from '@/lib/types/gameStatus'
import { BattleState, BattleEffect, BattleTarget, ArmyPosition } from '@/lib/types/advancedGame'

// Base component props interfaces
export interface BaseGameComponentProps {
  gameAddress: `0x${string}` | undefined
}

export interface BaseMobileComponentProps {
  isMobile: boolean
  mobileBottomPanelOpen: boolean
  setMobileBottomPanelOpen: (open: boolean) => void
}

// Context value interfaces
export interface GameStateContextContract {
  // Core game data
  gameStatus: GameStatusEnum
  totalPlayer: number
  maxPlayer: number
  playerAddresses: PlayerState[]
  playerId: string | null
  territories: Territory[][]
  armies: Army[]
  isGridLoading: boolean
  isStatusLoading: boolean
  
  // Data actions
  getGrids: () => Promise<void>
  getPlayerId: () => Promise<void>
  fetchGameData: () => Promise<void>
  refreshAllData: () => Promise<void>
}

export interface SelectionContextContract {
  selectedTerritory: Territory | null
  selectedArmy: Army | null
  setSelectedTerritory: (territory: Territory | null) => void
  setSelectedArmy: (army: Army | null) => void
  clearSelection: () => void
  selectTerritory: (territory: Territory) => void
  selectArmy: (army: Army) => void
}

export interface MovementContextContract {
  movementMode: boolean
  showMovementPaths: boolean
  validMovementCells: { x: number; y: number }[]
  moveStrength: number
  moveSubmitted: boolean
  animatingArmies: Set<string>
  armyPositions: Record<string, ArmyPosition>
  
  setMovementMode: (mode: boolean) => void
  setShowMovementPaths: (show: boolean) => void
  setValidMovementCells: (cells: { x: number; y: number }[]) => void
  setMoveStrength: (strength: number) => void
  setMoveSubmitted: (submitted: boolean) => void
  setAnimatingArmies: (armies: Set<string> | ((prev: Set<string>) => Set<string>)) => void
  setArmyPositions: (positions: Record<string, ArmyPosition> | ((prev: Record<string, ArmyPosition>) => Record<string, ArmyPosition>)) => void
  
  getAdjacentTerritories: (territory: Territory, territories: Territory[][]) => Territory[]
  getValidMovementCells: (army: Army, territories: Territory[][]) => { x: number; y: number }[]
  getArmyDisplayPosition: (army: Army) => { gridX: number; gridY: number }
  cancelMovement: () => void
  initializeMovement: (army: Army, territories: Territory[][]) => void
}

export interface BattleContextContract {
  activeBattle: BattleState | null
  battleEffects: BattleEffect[]
  showBattlePreview: boolean
  battleTarget: BattleTarget | null
  
  setActiveBattle: (battle: BattleState | null | ((prev: BattleState | null) => BattleState | null)) => void
  setBattleEffects: (effects: BattleEffect[] | ((prev: BattleEffect[]) => BattleEffect[])) => void
  setShowBattlePreview: (show: boolean) => void
  setBattleTarget: (target: BattleTarget | null) => void
  
  calculateBattleOdds: (attacker: Army, defender: Army | Territory) => { attackerOdds: number; defenderOdds: number }
  initializeBattle: (attacker: Army, target: Army | Territory) => void
  startBattle: (attacker: Army, target: Army | Territory, getArmyDisplayPosition: (army: Army) => { gridX: number; gridY: number }) => void
  completeBattle: (battle: BattleState, winner: "attacker" | "defender") => void
  addBattleEffect: (battle: BattleState, type: "clash" | "explosion" | "victory", getArmyDisplayPosition: (army: Army) => { gridX: number; gridY: number }) => void
  animateBattle: (battle: BattleState, getArmyDisplayPosition: (army: Army) => { gridX: number; gridY: number }) => void
}

// Component-specific interfaces
export interface GameOperationPanelContract extends BaseGameComponentProps, Partial<BaseMobileComponentProps> {
  // This component now gets its data from context
  // No additional props needed beyond base interfaces
}

export interface ImprovedGameMapContract extends BaseGameComponentProps, BaseMobileComponentProps {
  // This component now gets its data from context
  // No additional props needed beyond base interfaces
}

export interface GamePlayPageContract {
  gameAddressParam: `0x${string}`
}

// Action handler interfaces
export interface GameActionsContract {
  // Territory interactions
  handleTerritoryClick: (territory: Territory) => void
  
  // Army interactions  
  handleArmyClick: (territory: Territory, army: Army) => void
  
  // Movement actions
  handleMoveToCell: (targetTerritory: Territory) => Promise<void>
  handleAction: (targetTerritory: Territory, moveStrength: number) => Promise<void>
  
  // Battle actions
  handleInitializeBattle: (attacker: Army, target: Army | Territory) => void
  handleStartBattle: (attacker: Army, target: Army | Territory) => void
  
  // UI helpers
  getTerritoryColor: (owner: string) => string
}

// Hook return types
export interface UseGameStateReturn extends GameStateContextContract {}
export interface UseSelectionReturn extends SelectionContextContract {}
export interface UseMovementReturn extends MovementContextContract {}
export interface UseBattleReturn extends BattleContextContract {}
export interface UseGameActionsReturn extends GameActionsContract {}

// Event handler types
export type TerritoryClickHandler = (territory: Territory) => void
export type ArmyClickHandler = (territory: Territory, army: Army) => void
export type MoveToCellHandler = (targetTerritory: Territory) => Promise<void>
export type ActionHandler = (targetTerritory: Territory, moveStrength: number) => Promise<void>
export type BattleInitializeHandler = (attacker: Army, target: Army | Territory) => void
export type BattleStartHandler = (attacker: Army, target: Army | Territory) => void

// Component state interfaces
export interface UIState {
  isMobile: boolean
  mobileBottomPanelOpen: boolean
}

export interface LoadingState {
  isGridLoading: boolean
  isStatusLoading: boolean
}

// Provider interfaces
export interface GameContextProviderContract {
  children: React.ReactNode
  gameAddress: `0x${string}` | undefined
}

// Validation interfaces
export interface ComponentPropsValidation {
  validateGameAddress: (address: `0x${string}` | undefined) => boolean
  validateTerritory: (territory: Territory) => boolean
  validateArmy: (army: Army) => boolean
  validateBattleState: (battle: BattleState) => boolean
}