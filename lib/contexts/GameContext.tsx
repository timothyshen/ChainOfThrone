'use client'

import React, { createContext, useContext, ReactNode } from 'react'
import { Territory, Army } from '@/lib/types/game'
import { GameStatusEnum, PlayerState } from '@/lib/types/gameStatus'
import { BattleState, BattleEffect, BattleTarget, ArmyPosition } from '@/lib/types/advancedGame'
import { useGameState } from '@/lib/hooks/useGameState'
import { useSelection } from '@/lib/hooks/useSelection'
import { useMovement } from '@/lib/hooks/useMovement'
import { useBattle } from '@/lib/hooks/useBattle'

// Game State Context
interface GameStateContextValue {
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

// Selection Context
interface SelectionContextValue {
  selectedTerritory: Territory | null
  selectedArmy: Army | null
  setSelectedTerritory: (territory: Territory | null) => void
  setSelectedArmy: (army: Army | null) => void
  clearSelection: () => void
  selectTerritory: (territory: Territory) => void
  selectArmy: (army: Army) => void
}

// Movement Context
interface MovementContextValue {
  movementMode: boolean
  showMovementPaths: boolean
  validMovementCells: { x: number; y: number }[]
  moveStrength: number
  moveSubmitted: boolean
  targetTerritory: Territory | null
  animatingArmies: Set<string>
  armyPositions: Record<string, ArmyPosition>
  
  setMovementMode: (mode: boolean) => void
  setShowMovementPaths: (show: boolean) => void
  setValidMovementCells: (cells: { x: number; y: number }[]) => void
  setMoveStrength: (strength: number) => void
  setMoveSubmitted: (submitted: boolean) => void
  setTargetTerritory: (territory: Territory | null) => void
  setAnimatingArmies: (armies: Set<string> | ((prev: Set<string>) => Set<string>)) => void
  setArmyPositions: (positions: Record<string, ArmyPosition> | ((prev: Record<string, ArmyPosition>) => Record<string, ArmyPosition>)) => void
  
  getAdjacentTerritories: (territory: Territory, territories: Territory[][]) => Territory[]
  getValidMovementCells: (army: Army, territories: Territory[][]) => { x: number; y: number }[]
  getArmyDisplayPosition: (army: Army) => { gridX: number; gridY: number }
  cancelMovement: () => void
  initializeMovement: (army: Army, territories: Territory[][]) => void
}

// Battle Context
interface BattleContextValue {
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
  completeBattle: (battle: BattleState, winner: "attacker" | "defender", getArmyDisplayPosition: (army: Army) => { gridX: number; gridY: number }) => void
  addBattleEffect: (battle: BattleState, type: "clash" | "explosion" | "victory", getArmyDisplayPosition: (army: Army) => { gridX: number; gridY: number }) => void
  animateBattle: (battle: BattleState, getArmyDisplayPosition: (army: Army) => { gridX: number; gridY: number }) => void
}

// Create contexts
const GameStateContext = createContext<GameStateContextValue | undefined>(undefined)
const SelectionContext = createContext<SelectionContextValue | undefined>(undefined)
const MovementContext = createContext<MovementContextValue | undefined>(undefined)
const BattleContext = createContext<BattleContextValue | undefined>(undefined)

// Provider component
interface GameContextProviderProps {
  children: ReactNode
  gameAddress: `0x${string}` | undefined
}

export function GameContextProvider({ children, gameAddress }: GameContextProviderProps) {
  const gameState = useGameState(gameAddress)
  const selection = useSelection()
  const movement = useMovement()
  const battle = useBattle()

  return (
    <GameStateContext.Provider value={gameState}>
      <SelectionContext.Provider value={selection}>
        <MovementContext.Provider value={movement}>
          <BattleContext.Provider value={battle}>
            {children}
          </BattleContext.Provider>
        </MovementContext.Provider>
      </SelectionContext.Provider>
    </GameStateContext.Provider>
  )
}

// Custom hooks to use contexts
export function useGameStateContext() {
  const context = useContext(GameStateContext)
  if (context === undefined) {
    throw new Error('useGameStateContext must be used within a GameContextProvider')
  }
  return context
}

export function useSelectionContext() {
  const context = useContext(SelectionContext)
  if (context === undefined) {
    throw new Error('useSelectionContext must be used within a GameContextProvider')
  }
  return context
}

export function useMovementContext() {
  const context = useContext(MovementContext)
  if (context === undefined) {
    throw new Error('useMovementContext must be used within a GameContextProvider')
  }
  return context
}

export function useBattleContext() {
  const context = useContext(BattleContext)
  if (context === undefined) {
    throw new Error('useBattleContext must be used within a GameContextProvider')
  }
  return context
}