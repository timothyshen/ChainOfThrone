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
   *
   * 正确的执行顺序：
   * 1. 用户选择军队数量
   * 2. 提交交易到区块链并等待确认
   * 3. 交易确认成功后，执行前端动画
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

      console.log("🐛 Move:", move)

      try {
        // 执行交易并等待区块链确认
        // tx.execute() 会等待交易完全确认后才返回
        await tx.execute(() => makeMove(gameAddress, move))

        // ✅ 交易已确认！现在可以安全地执行动画
        console.log(`✅ Transaction confirmed! Starting animation...`)

        // Update army position with animation flag
        setArmyPositions((prev) => ({
          ...prev,
          [selectedArmy.id]: { ...targetTerritory, isAnimating: true },
        }))

        // Start animation
        setAnimatingArmies((prev) => new Set([...prev, selectedArmy.id]))

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

      } catch (error) {
        // 交易失败，不执行动画
        console.error("❌ Transaction failed, animation cancelled:", error)

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
    ]
  )

  return {
    handleMoveToCell,
    handleAction,
  }
}
