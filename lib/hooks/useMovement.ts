'use client'

import { useState, useCallback } from 'react'
import { Territory, Army } from '@/lib/types/game'
import { ArmyPosition } from '@/lib/types/advancedGame'

interface MovementState {
  // Movement mode
  movementMode: boolean
  showMovementPaths: boolean
  validMovementCells: { x: number; y: number }[]
  moveStrength: number
  moveSubmitted: boolean
  
  // Army animations
  animatingArmies: Set<string>
  armyPositions: Record<string, ArmyPosition>
}

interface MovementActions {
  // Mode controls
  setMovementMode: (mode: boolean) => void
  setShowMovementPaths: (show: boolean) => void
  setValidMovementCells: (cells: { x: number; y: number }[]) => void
  setMoveStrength: (strength: number) => void
  setMoveSubmitted: (submitted: boolean) => void
  
  // Animation controls
  setAnimatingArmies: (armies: Set<string> | ((prev: Set<string>) => Set<string>)) => void
  setArmyPositions: (positions: Record<string, ArmyPosition> | ((prev: Record<string, ArmyPosition>) => Record<string, ArmyPosition>)) => void
  
  // Movement logic
  getAdjacentTerritories: (territory: Territory, territories: Territory[][]) => Territory[]
  getValidMovementCells: (army: Army, territories: Territory[][]) => { x: number; y: number }[]
  getArmyDisplayPosition: (army: Army) => { gridX: number; gridY: number }
  cancelMovement: () => void
  initializeMovement: (army: Army, territories: Territory[][]) => void
}

export function useMovement(): MovementState & MovementActions {
  // Movement mode
  const [movementMode, setMovementMode] = useState(false)
  const [showMovementPaths, setShowMovementPaths] = useState(false)
  const [validMovementCells, setValidMovementCells] = useState<{ x: number; y: number }[]>([])
  const [moveStrength, setMoveStrength] = useState<number>(0)
  const [moveSubmitted, setMoveSubmitted] = useState<boolean>(false)
  
  // Army animations
  const [animatingArmies, setAnimatingArmies] = useState<Set<string>>(new Set())
  const [armyPositions, setArmyPositions] = useState<Record<string, ArmyPosition>>({})

  const getAdjacentTerritories = useCallback((territory: Territory, territories: Territory[][]): Territory[] => {
    if (!territory) return []
    const adjacentTerritories: Territory[] = []

    territories.forEach((row) => {
      if (!row) return
      row.forEach((currentTerritory) => {
        if (!currentTerritory) return

        const dx = Math.abs(territory.x - currentTerritory.x)
        const dy = Math.abs(territory.y - currentTerritory.y)
        if (dx + dy === 1) {
          adjacentTerritories.push(currentTerritory)
        }
      })
    })

    return adjacentTerritories
  }, [])

  const getValidMovementCells = useCallback((army: Army, territories: Territory[][]): { x: number; y: number }[] => {
    const armyTerritory = territories[army.y]?.[army.x]
    if (!armyTerritory) return []
    return getAdjacentTerritories(armyTerritory, territories).map(t => ({ x: t.x, y: t.y }))
  }, [getAdjacentTerritories])

  const getArmyDisplayPosition = useCallback((army: Army) => {
    const animatedPosition = armyPositions[army.id]
    if (animatedPosition && animatedPosition.isAnimating) {
      return { gridX: animatedPosition.x, gridY: animatedPosition.y }
    }
    return { gridX: army.x, gridY: army.y }
  }, [armyPositions])

  const cancelMovement = useCallback(() => {
    setMovementMode(false)
    setShowMovementPaths(false)
    setValidMovementCells([])
    setMoveStrength(0)
  }, [])

  const initializeMovement = useCallback((army: Army, territories: Territory[][]) => {
    const armyTerritory = territories[army.y]?.[army.x]
    if (armyTerritory) {
      const validCells = getAdjacentTerritories(armyTerritory, territories)
      setValidMovementCells(validCells.map(t => ({ x: t.x, y: t.y })))
    }
    setShowMovementPaths(true)
    setMovementMode(true)
  }, [getAdjacentTerritories])

  return {
    // State
    movementMode,
    showMovementPaths,
    validMovementCells,
    moveStrength,
    moveSubmitted,
    animatingArmies,
    armyPositions,
    
    // Actions
    setMovementMode,
    setShowMovementPaths,
    setValidMovementCells,
    setMoveStrength,
    setMoveSubmitted,
    setAnimatingArmies,
    setArmyPositions,
    getAdjacentTerritories,
    getValidMovementCells,
    getArmyDisplayPosition,
    cancelMovement,
    initializeMovement,
  }
}