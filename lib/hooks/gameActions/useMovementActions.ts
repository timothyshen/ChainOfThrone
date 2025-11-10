import { useCallback } from "react"
import { useAccount } from "wagmi"
import { Territory } from "@/lib/types/game"
import { useMakeMove } from "@/lib/hooks/useMakeMove"
import { useToast } from "@/lib/hooks/use-toast"
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
  const { toast } = useToast()
  const { selectedTerritory, selectedArmy } = useSelectionContext()
  const {
    movementMode,
    setAnimatingArmies,
    setArmyPositions,
    setMoveSubmitted,
    setTargetTerritory,
    cancelMovement,
  } = useMovementContext()

  /**
   * Handle move to cell
   * Stores target territory for move confirmation
   */
  const handleMoveToCell = useCallback(
    async (targetTerritory: Territory) => {
      if (!selectedTerritory || !address || !gameAddress) {
        toast({
          title: "Invalid Action",
          description: "Cannot perform this action at this time.",
          variant: "destructive",
        })
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
      toast,
    ]
  )

  /**
   * Handle action (execute move)
   * Submits move to blockchain and handles animation
   */
  const handleAction = useCallback(
    async (targetTerritory: Territory, moveStrength: number) => {
      if (!selectedTerritory || !address || !gameAddress || !selectedArmy) {
        toast({
          title: "Invalid Action",
          description: "Cannot perform this action at this time.",
          variant: "destructive",
        })
        return
      }

      try {
        // Update army position with animation flag
        setArmyPositions((prev) => ({
          ...prev,
          [selectedArmy.id]: { ...targetTerritory, isAnimating: true },
        }))

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
        await makeMove(gameAddress, move)

        // Start animation when user decides to move
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
        }, 800) // Animation duration

        // Reset movement state
        cancelMovement()
      } catch (error) {
        console.error("Error making move:", error)

        // Clear animation on error
        setAnimatingArmies((prev) => {
          const newSet = new Set(prev)
          newSet.delete(selectedArmy.id)
          return newSet
        })

        setArmyPositions((prev) => {
          const newPositions = { ...prev }
          delete newPositions[selectedArmy.id]
          return newPositions
        })

        toast({
          title: "Error",
          description:
            error instanceof Error
              ? error.message
              : "Failed to submit move to the blockchain",
          variant: "destructive",
        })
      }
    },
    [
      selectedTerritory,
      selectedArmy,
      address,
      gameAddress,
      makeMove,
      setAnimatingArmies,
      setArmyPositions,
      cancelMovement,
      toast,
    ]
  )

  return {
    handleMoveToCell,
    handleAction,
  }
}
