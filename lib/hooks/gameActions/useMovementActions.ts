import { useCallback } from "react"
import { useAccount } from "wagmi"
import { Territory } from "@/lib/types/game"
import { useMakeMove } from "@/lib/hooks/useMakeMove"
import { useTransaction } from "@/lib/hooks/useTransaction"
import { useTransactionToast } from "@/lib/hooks/useTransactionToast"
import {
  useSelectionContext,
  useMovementContext,
  useGameStateContext,
} from "@/lib/contexts/GameContext"
import { ANIMATION_DURATIONS } from "@/lib/constants/animations"
import { logger } from "@/lib/utils/logger"
import { setAdd, setDelete } from "@/lib/utils/setHelpers"

/**
 * useMovementActions Hook
 *
 * Handles army movement logic including target selection and move execution
 * Manages animation states and transaction submission
 */
export function useMovementActions(gameAddress: `0x${string}` | undefined) {
  const { address } = useAccount()
  const { makeMove } = useMakeMove()
  const tx = useTransaction()
  const { selectedTerritory, selectedArmy } = useSelectionContext()
  const {
    movementMode,
    setAnimatingArmies,
    setArmyPositions,
    setMoveSubmitted,
    setTargetTerritory,
    cancelMovement,
  } = useMovementContext()
  const { refreshAllData } = useGameStateContext()

  // Automatically display transaction status notifications
  useTransactionToast(tx.state, {
    success: "Army moved successfully!",
    error: "Failed to move army"
  })

  /**
   * Handle move to cell
   * Stores target territory for move confirmation
   */
  const handleMoveToCell = useCallback(
    async (targetTerritory: Territory) => {
      if (!selectedTerritory || !address || !gameAddress) {
        return
      }

      if (selectedArmy && movementMode) {
        // Store the target territory and show the move strength input
        setTargetTerritory(targetTerritory)
        setMoveSubmitted(true)
        logger.debug(
          `Move target selected: (${targetTerritory.x}, ${targetTerritory.y})`
        )
      }
    },
    [
      selectedTerritory,
      selectedArmy,
      address,
      gameAddress,
      movementMode,
      setMoveSubmitted,
      setTargetTerritory,
    ]
  )

  /**
   * Handle action (execute move)
   *
   * Correct execution order:
   * 1. User selects army size
   * 2. Submit transaction to blockchain and wait for confirmation
   * 3. After transaction is confirmed, execute frontend animation
   */
  const handleAction = useCallback(
    async (targetTerritory: Territory, moveStrength: number) => {
      if (!selectedTerritory || !address || !gameAddress || !selectedArmy) {
        return
      }

      type Move = readonly [number, number, string, number, number, number]
      const move: Move = [
        selectedTerritory.x,
        selectedTerritory.y,
        address,
        targetTerritory.x,
        targetTerritory.y,
        moveStrength,
      ] as const

      logger.debug("Move:", move)

      try {
        // Execute transaction and wait for blockchain confirmation
        // tx.execute() waits for transaction to be fully confirmed before returning
        await tx.execute(() => makeMove(gameAddress, move))

        // Transaction confirmed! Now safe to execute animation
        logger.debug("Transaction confirmed! Starting animation...")

        // Update army position with animation flag
        setArmyPositions((prev) => ({
          ...prev,
          [selectedArmy.id]: { ...targetTerritory, isAnimating: true },
        }))

        // Start animation (using optimized helper)
        setAnimatingArmies((prev) => setAdd(prev, selectedArmy.id))

        // Wait for animation to complete
        setTimeout(async () => {
          // Clear animation state (using optimized helper)
          setAnimatingArmies((prev) => setDelete(prev, selectedArmy.id))

          // Clear the temporary animation position
          setArmyPositions((prev) => {
            const newPositions = { ...prev }
            delete newPositions[selectedArmy.id]
            return newPositions
          })

          logger.debug(
            `Army ${selectedArmy.id} moved to (${targetTerritory.x}, ${targetTerritory.y})`
          )

          // Reset movement state
          cancelMovement()

          // Reset transaction state
          tx.reset()

          // Refresh game state to update roundSubmitted status
          await refreshAllData()
        }, ANIMATION_DURATIONS.ARMY_MOVE) // Animation duration from constants

      } catch (error) {
        // Transaction failed, do not execute animation
        logger.error("Transaction failed, animation cancelled:", error)

        // Reset movement state
        cancelMovement()
      }
    },
    [
      selectedTerritory,
      selectedArmy,
      address,
      gameAddress,
      makeMove,
      tx,
      setAnimatingArmies,
      setArmyPositions,
      cancelMovement,
      refreshAllData,
    ]
  )

  return {
    handleMoveToCell,
    handleAction,
  }
}
