import { useCallback } from "react"
import { Territory, Army } from "@/lib/types/game"

interface UseMapInteractionsProps {
  movementMode: boolean
  validMovementCells: { x: number; y: number }[]
  selectedArmy: Army | null
  armies: Army[]
  flatTerritories: (Territory & { isSelected: boolean })[]
  handleTerritoryClick: (territory: Territory) => void
  handleMoveToCell: (territory: Territory) => Promise<void>
  handleInitializeBattle: (attacker: Army, target: Army | Territory) => void
  clearSelection: () => void
  cancelMovement: () => void
}

/**
 * useMapInteractions Hook
 *
 * Manages all click interactions on the game map
 * Handles territory clicks, cell clicks, and map background clicks
 */
export function useMapInteractions({
  movementMode,
  validMovementCells,
  selectedArmy,
  armies,
  flatTerritories,
  handleTerritoryClick,
  handleMoveToCell,
  handleInitializeBattle,
  clearSelection,
  cancelMovement,
}: UseMapInteractionsProps) {
  /**
   * Handle background map click
   * Clears selection and movement mode
   */
  const handleMapClick = useCallback(
    (e: React.MouseEvent) => {
      if (e.target === e.currentTarget) {
        clearSelection()
        cancelMovement()
        flatTerritories.forEach((territory) => {
          territory.isSelected = false
        })
      }
    },
    [clearSelection, cancelMovement, flatTerritories]
  )

  /**
   * Handle cell click in movement mode
   * Checks for battles or regular moves
   */
  const handleCellClick = useCallback(
    (gridX: number, gridY: number) => {
      if (
        movementMode &&
        validMovementCells.some((cell) => cell.x === gridX && cell.y === gridY)
      ) {
        const territory = flatTerritories.find(
          (t) => t.x === gridX && t.y === gridY
        )
        if (territory) {
          // Check if this is a battle destination
          const hasEnemyArmy = armies.some(
            (army) =>
              army.x === gridX &&
              army.y === gridY &&
              army.owner !== selectedArmy?.owner
          )

          if (hasEnemyArmy && selectedArmy) {
            const enemyArmy = armies.find(
              (army) =>
                army.x === gridX &&
                army.y === gridY &&
                army.owner !== selectedArmy.owner
            )

            if (enemyArmy) {
              console.log(
                `Initiating battle: ${selectedArmy.owner} vs ${enemyArmy.owner}`
              )
              handleInitializeBattle(selectedArmy, enemyArmy)
            }
          } else {
            // Regular move
            handleMoveToCell(territory)
          }
        }
      }
    },
    [
      movementMode,
      validMovementCells,
      flatTerritories,
      armies,
      selectedArmy,
      handleInitializeBattle,
      handleMoveToCell,
    ]
  )

  /**
   * Handle territory cell click
   * Differentiates between territory and army clicks
   */
  const handleTerritoryCellClick = useCallback(
    (e: React.MouseEvent, territory: Territory) => {
      // Only handle territory clicks if not clicking on an army
      const isArmyClick = e.target !== e.currentTarget
      if (!isArmyClick) {
        handleTerritoryClick(territory)
      }
    },
    [handleTerritoryClick]
  )

  return {
    handleMapClick,
    handleCellClick,
    handleTerritoryCellClick,
  }
}
