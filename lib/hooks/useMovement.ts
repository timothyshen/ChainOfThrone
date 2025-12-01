'use client'

import { useState, useCallback } from 'react'
import { Territory, Army } from '@/lib/types/game'
import { ArmyPosition } from '@/lib/types/advancedGame'
import { logger } from '@/lib/utils/logger'

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

interface MoveValidationResult {
  isValid: boolean
  reason?: string
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

  // Validation
  validateMove: (army: Army, destination: Territory, currentPlayerAddress: string, territories: Territory[][]) => MoveValidationResult
  isHostileTerritory: (territory: Territory, currentPlayerAddress: string) => boolean
  canArmyMove: (army: Army, currentPlayerAddress: string) => boolean
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

    // SCALABLE: Derive grid dimensions from territories array
    const gridRows = territories.length
    const gridCols = territories[0]?.length || 0

    // Direct approach: check the 4 possible adjacent positions
    const possibleAdjacent = [
      { x: territory.x - 1, y: territory.y },     // Left
      { x: territory.x + 1, y: territory.y },     // Right
      { x: territory.x, y: territory.y - 1 },     // Up
      { x: territory.x, y: territory.y + 1 }      // Down
    ]

    possibleAdjacent.forEach(pos => {
      // OPTIMIZED: Direct array access O(1) instead of .flat().find() O(n)
      // SCALABLE: Validate bounds dynamically based on grid size
      if (pos.x >= 0 && pos.x < gridRows && pos.y >= 0 && pos.y < gridCols) {
        const foundTerritory = territories[pos.x]?.[pos.y]
        if (foundTerritory) {
          adjacentTerritories.push(foundTerritory)
        }
      }
    })

    return adjacentTerritories
  }, [])

  const getValidMovementCells = useCallback((army: Army, territories: Territory[][]): { x: number; y: number }[] => {
    const armyTerritory = territories[army.x]?.[army.y]
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
  }, [setMoveSubmitted])

  const initializeMovement = useCallback((army: Army, territories: Territory[][]) => {
    // Find the territory where this army is located
    // territories[row][col] where row=x, col=y
    const armyTerritory = territories[army.x]?.[army.y]
    
    if (armyTerritory) {
      // Verify the territory coordinates match the army coordinates
      if (armyTerritory.x === army.x && armyTerritory.y === army.y) {
        const validCells = getAdjacentTerritories(armyTerritory, territories)
        setValidMovementCells(validCells.map(t => ({ x: t.x, y: t.y })))
      } else {
        logger.error('Coordinate mismatch:', {
          army: { x: army.x, y: army.y },
          territory: { x: armyTerritory.x, y: armyTerritory.y }
        })
      }
    }
    setShowMovementPaths(true)
    setMovementMode(true)
  }, [getAdjacentTerritories])

  // Zero address constant
  const ZERO_ADDRESS = "0x0000000000000000000000000000000000000000"

  /**
   * Check if a territory is hostile (owned by enemy)
   */
  const isHostileTerritory = useCallback((territory: Territory, currentPlayerAddress: string): boolean => {
    if (!territory.player || territory.player.toLowerCase() === ZERO_ADDRESS.toLowerCase()) {
      return false // Unowned territory is not hostile
    }
    return territory.player.toLowerCase() !== currentPlayerAddress.toLowerCase()
  }, [])

  /**
   * Check if current player can move the army (ownership validation)
   */
  const canArmyMove = useCallback((army: Army, currentPlayerAddress: string): boolean => {
    return army.owner.toLowerCase() === currentPlayerAddress.toLowerCase()
  }, [])

  /**
   * Comprehensive move validation
   */
  const validateMove = useCallback((
    army: Army,
    destination: Territory,
    currentPlayerAddress: string,
    territories: Territory[][]
  ): MoveValidationResult => {
    // 1. Check army ownership
    if (!canArmyMove(army, currentPlayerAddress)) {
      return { isValid: false, reason: "You don't own this army" }
    }

    // 2. Get army's current territory
    const armyTerritory = territories[army.x]?.[army.y]
    if (!armyTerritory) {
      return { isValid: false, reason: "Army position not found" }
    }

    // 3. Check if destination is adjacent
    const adjacentTerritories = getAdjacentTerritories(armyTerritory, territories)
    const isAdjacent = adjacentTerritories.some(t => t.x === destination.x && t.y === destination.y)
    if (!isAdjacent) {
      return { isValid: false, reason: "Destination is not adjacent" }
    }

    // 4. Check if destination is hostile (valid for battle)
    const hostile = isHostileTerritory(destination, currentPlayerAddress)

    // Return valid - caller can decide how to handle hostile vs friendly
    return {
      isValid: true,
      reason: hostile ? "hostile" : "friendly"
    }
  }, [canArmyMove, getAdjacentTerritories, isHostileTerritory])

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

    // Validation
    validateMove,
    isHostileTerritory,
    canArmyMove,
  }
}