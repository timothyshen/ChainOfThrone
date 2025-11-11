import { useCallback } from "react"
import { useAccount } from "wagmi"
import { Territory } from "@/lib/types/game"
import { useMakeMove } from "@/lib/hooks/useMakeMove"
import { useTransaction } from "@/lib/hooks/useTransaction"
import { useTransactionToast } from "@/lib/hooks/useTransactionToast"
import {
  useSelectionContext,
  useMovementContext,
} from "@/lib/contexts/GameContext"

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

  // 自动显示交易状态通知
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
        console.log(
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
   * Submits move to blockchain and handles animation
   */
  const handleAction = useCallback(
    async (targetTerritory: Territory, moveStrength: number) => {
      if (!selectedTerritory || !address || !gameAddress || !selectedArmy) {
        return
      }

      // Start animation preparation
      tx.prepare({ armyId: selectedArmy.id })

      // Update army position with animation flag
      setArmyPositions((prev) => ({
        ...prev,
        [selectedArmy.id]: { ...targetTerritory, isAnimating: true },
      }))

      // Start animation when user decides to move
      setAnimatingArmies((prev) => new Set([...prev, selectedArmy.id]))

      type Move = readonly [number, number, string, number, number, number]
      const move: Move = [
        selectedTerritory.x,
        selectedTerritory.y,
        address,
        targetTerritory.x,
        targetTerritory.y,
        moveStrength,
      ] as const

      console.log("🐛 Move:", move)

      // Execute transaction
      await tx.execute(() => makeMove(gameAddress, move))

      // Wait for animation to complete
      setTimeout(() => {
        // Clear animation state
        setAnimatingArmies((prev) => {
          const newSet = new Set(prev)
          newSet.delete(selectedArmy.id)
          return newSet
        })

        // Clear the temporary animation position
        setArmyPositions((prev) => {
          const newPositions = { ...prev }
          delete newPositions[selectedArmy.id]
          return newPositions
        })

        console.log(
          `Army ${selectedArmy.id} moved to (${targetTerritory.x}, ${targetTerritory.y})`
        )

        // Reset movement state
        cancelMovement()

        // Reset transaction state
        tx.reset()
      }, 800) // Animation duration
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
    ]
  )

  return {
    handleMoveToCell,
    handleAction,
  }
}
