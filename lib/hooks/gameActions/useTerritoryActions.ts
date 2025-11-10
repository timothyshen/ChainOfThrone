import { useCallback } from "react"
import { useAccount } from "wagmi"
import { Territory, Army } from "@/lib/types/game"
import { useToast } from "@/lib/hooks/use-toast"
import {
  useSelectionContext,
  useMovementContext,
  useGameStateContext,
} from "@/lib/contexts/GameContext"

/**
 * useTerritoryActions Hook
 *
 * Handles territory and army selection logic
 * Validates player ownership before allowing selection
 */
export function useTerritoryActions() {
  const { address } = useAccount()
  const { toast } = useToast()
  const { armies, territories } = useGameStateContext()
  const {
    selectedArmy,
    selectedTerritory,
    setSelectedTerritory,
    selectTerritory,
    selectArmy,
  } = useSelectionContext()
  const { movementMode, initializeMovement, cancelMovement } = useMovementContext()

  /**
   * Handle territory click
   * Validates player has an army on the territory before selecting
   */
  const handleTerritoryClick = useCallback(
    (territory: Territory) => {
      console.log("Territory clicked:", territory)

      // Check if the player has an army on this territory
      const playerHasArmyOnTerritory = armies.some(
        (army) =>
          army.x === territory.x &&
          army.y === territory.y &&
          army.owner === address
      )

      if (!address || !playerHasArmyOnTerritory) {
        toast({
          title: "Cannot Select Territory",
          description:
            "You can only select territories where you have an army stationed.",
          variant: "destructive",
        })
        return
      }

      selectTerritory(territory)
    },
    [selectTerritory, armies, address, toast]
  )

  /**
   * Handle army click
   * Validates ownership and initializes movement mode
   */
  const handleArmyClick = useCallback(
    (territory: Territory, army: Army) => {
      console.log("Army clicked:", territory, army)

      // Check if the player owns this army
      if (!address || army.owner !== address) {
        toast({
          title: "Cannot Select Army",
          description: "You can only select armies that you own.",
          variant: "destructive",
        })
        return
      }

      setSelectedTerritory(territory)
      selectArmy(army)

      // Initialize movement for the selected army
      initializeMovement(army, territories)

      // Cancel previous movement if selecting new army while in movement mode
      if (selectedArmy && movementMode) {
        cancelMovement()
      }
    },
    [
      selectArmy,
      setSelectedTerritory,
      initializeMovement,
      territories,
      movementMode,
      selectedArmy,
      cancelMovement,
      address,
      toast,
    ]
  )

  return {
    handleTerritoryClick,
    handleArmyClick,
  }
}
