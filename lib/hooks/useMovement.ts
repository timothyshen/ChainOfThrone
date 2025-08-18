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
  targetTerritory: Territory | null
  
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
  setTargetTerritory: (territory: Territory | null) => void
  
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
  const [moveSubmitted, setMoveSubmittedInternal] = useState<boolean>(false)
  const [targetTerritory, setTargetTerritory] = useState<Territory | null>(null)
  
  // Wrap setMoveSubmitted for consistency
  const setMoveSubmitted = useCallback((submitted: boolean) => {
    setMoveSubmittedInternal(submitted);
  }, [])
  
  // Army animations
  const [animatingArmies, setAnimatingArmies] = useState<Set<string>>(new Set())
  const [armyPositions, setArmyPositions] = useState<Record<string, ArmyPosition>>({})

  const getAdjacentTerritories = useCallback((territory: Territory, territories: Territory[][]): Territory[] => {
    if (!territory) return []
    const adjacentTerritories: Territory[] = []

    // Direct approach: check the 4 possible adjacent positions
    const possibleAdjacent = [
      { x: territory.x - 1, y: territory.y },     // Left
      { x: territory.x + 1, y: territory.y },     // Right  
      { x: territory.x, y: territory.y - 1 },     // Up
      { x: territory.x, y: territory.y + 1 }      // Down
    ]

    possibleAdjacent.forEach(pos => {
      // Find territory at this position
      const foundTerritory = territories.flat().find(t => t.x === pos.x && t.y === pos.y)
      if (foundTerritory) {
        adjacentTerritories.push(foundTerritory)
      }
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
    setMoveSubmitted(false)
    setTargetTerritory(null)
  }, [])

  const initializeMovement = useCallback((army: Army, territories: Territory[][]) => {
    // Find the territory where this army is located
    // territories[row][col] where row=y, col=x
    const armyTerritory = territories[army.y]?.[army.x]
    
    if (armyTerritory) {
      // Verify the territory coordinates match the army coordinates
      if (armyTerritory.x === army.x && armyTerritory.y === army.y) {
        const validCells = getAdjacentTerritories(armyTerritory, territories)
        setValidMovementCells(validCells.map(t => ({ x: t.x, y: t.y })))
      } else {
        console.error('❌ Coordinate mismatch:', {
          army: { x: army.x, y: army.y },
          territory: { x: armyTerritory.x, y: armyTerritory.y }
        })
      }
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
    targetTerritory,
    animatingArmies,
    armyPositions,
    
    // Actions
    setMovementMode,
    setShowMovementPaths,
    setValidMovementCells,
    setMoveStrength,
    setMoveSubmitted,
    setTargetTerritory,
    setAnimatingArmies,
    setArmyPositions,
    getAdjacentTerritories,
    getValidMovementCells,
    getArmyDisplayPosition,
    cancelMovement,
    initializeMovement,
  }
}