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
  const { armies, territories, playerAddresses, playerId } = useGameStateContext()
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
   * Allows selecting any territory with contextual notifications
   */
  const handleTerritoryClick = useCallback(
    (territory: Territory) => {
      console.log("Territory clicked:", territory)

      if (!address) {
        toast({
          title: "Wallet Not Connected",
          description: "Please connect your wallet to interact with the game.",
          variant: "destructive",
        })
        return
      }

      const zeroAddress = "0x0000000000000000000000000000000000000000"

      // Check ownership status
      const playerOwnsTerritory = territory.player?.toLowerCase() === address.toLowerCase()
      const isNeutral = !territory.player || territory.player.toLowerCase() === zeroAddress.toLowerCase()
      const isEnemyOwned = !playerOwnsTerritory && !isNeutral

      // Check if player has army on this territory
      const playerHasArmyOnTerritory = armies.some(
        (army) =>
          army.x === territory.x &&
          army.y === territory.y &&
          army.owner.toLowerCase() === address.toLowerCase()
      )

      // Check enemy army count
      const enemyArmies = armies.filter(
        (army) =>
          army.x === territory.x &&
          army.y === territory.y &&
          army.owner.toLowerCase() !== address.toLowerCase()
      )
      const enemyUnits = enemyArmies.reduce((sum, a) => sum + a.size, 0)

      // Check if player has already submitted their move this round
      const playerIndex = playerId ? parseInt(playerId) : -1
      const hasSubmittedMove = playerIndex >= 0 && playerAddresses[playerIndex]?.roundSubmitted

      // Select the territory
      selectTerritory(territory)

      // Show contextual notification based on territory status
      if (playerOwnsTerritory || playerHasArmyOnTerritory) {
        // Player's own territory - check if move submitted
        if (hasSubmittedMove) {
          toast({
            title: "Move Already Submitted",
            description: "Wait for the next round to make another move.",
          })
        }
      } else if (isNeutral) {
        toast({
          title: territory.isCastle ? `🏰 Neutral Castle: ${territory.name}` : `📍 Neutral Territory`,
          description: territory.isCastle
            ? "Capture this castle to get closer to victory!"
            : "Move your army here to control this territory.",
        })
      } else if (isEnemyOwned) {
        toast({
          title: territory.isCastle ? `⚔️ Enemy Castle: ${territory.name}` : `⚔️ Enemy Territory`,
          description: enemyUnits > 0
            ? `Defended by ${enemyUnits} enemy units. Attack to capture!`
            : "Undefended! Send your army to capture.",
          variant: "destructive",
        })
      }
    },
    [selectTerritory, armies, address, toast, playerId, playerAddresses]
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

      // Check if player has already submitted their move this round
      const playerIndex = playerId ? parseInt(playerId) : -1
      const hasSubmittedMove = playerIndex >= 0 && playerAddresses[playerIndex]?.roundSubmitted

      if (hasSubmittedMove) {
        toast({
          title: "Move Already Submitted",
          description: "You have already submitted your move for this round. Wait for the next round.",
          variant: "default",
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
      playerId,
      playerAddresses,
    ]
  )

  return {
    handleTerritoryClick,
    handleArmyClick,
  }
}
