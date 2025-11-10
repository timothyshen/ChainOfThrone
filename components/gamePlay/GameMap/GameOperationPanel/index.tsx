import { useCallback, useEffect } from "react"
import { Sword, Navigation } from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
} from "@/components/ui/drawer"
import { Button } from "@/components/ui/button"
import {
  useSelectionContext,
  useMovementContext,
  useBattleContext
} from "@/lib/contexts/GameContext"
import { useGameActions } from "@/lib/hooks/gameActions"

// Subcomponents
import { ArmyDetails } from "./ArmyDetails"
import { BattlePreview } from "./BattlePreview"
import { MovementInput } from "./MovementInput"
import { BattleProgress } from "./BattleProgress"
import { MovementMode } from "./MovementMode"

// Hooks and types
import { useActionState, getActionTitle } from "./hooks/useActionState"
import type { GameOperationPanelProps } from "./types"

/**
 * GameOperationPanel Component
 *
 * Main orchestrator for game actions panel
 * Handles army selection, movement, and battle interfaces
 */
const GameOperationPanel = ({
  gameAddress,
  isMobile = false,
  mobileBottomPanelOpen,
  setMobileBottomPanelOpen = () => { }
}: GameOperationPanelProps) => {
  // Context hooks
  const { selectedArmy } = useSelectionContext()
  const movementContext = useMovementContext()
  const {
    moveStrength,
    moveSubmitted,
    targetTerritory,
    animatingArmies,
    setMoveStrength,
    setMoveSubmitted,
    setTargetTerritory,
    cancelMovement
  } = movementContext

  const battleContext = useBattleContext()
  const {
    activeBattle,
    showBattlePreview,
    battleTarget,
    calculateBattleOdds,
    setShowBattlePreview,
    setBattleTarget
  } = battleContext

  // Actions
  const { getTerritoryColor, handleAction, handleStartBattle } = useGameActions(
    gameAddress,
    isMobile,
    setMobileBottomPanelOpen
  )

  // Determine current action state
  const actionState = useActionState(
    selectedArmy,
    showBattlePreview,
    battleTarget,
    moveSubmitted,
    activeBattle
  )

  // Action handlers
  const handleBattleCancel = useCallback(() => {
    setShowBattlePreview(false)
    setBattleTarget(null)
  }, [setShowBattlePreview, setBattleTarget])

  const handleStartBattleAction = useCallback(() => {
    if (selectedArmy && battleTarget?.army) {
      handleStartBattle(selectedArmy, battleTarget.army)
    } else if (selectedArmy && battleTarget?.territory) {
      handleStartBattle(selectedArmy, battleTarget.territory)
    }
  }, [selectedArmy, battleTarget, handleStartBattle])

  const handleMoveArmyAction = useCallback(async () => {
    if (selectedArmy && !animatingArmies.has(selectedArmy.id) && moveStrength > 0 && targetTerritory) {
      await handleAction(targetTerritory, moveStrength)
    }
  }, [selectedArmy, animatingArmies, moveStrength, targetTerritory, handleAction])

  // Auto-manage mobile drawer state based on action state
  useEffect(() => {
    if (isMobile && selectedArmy) {
      const shouldOpenDrawer = actionState !== 'none'

      // Auto-open drawer for actionable states
      if (shouldOpenDrawer && !mobileBottomPanelOpen) {
        setMobileBottomPanelOpen(true)
      }

      // Auto-close drawer when action completes
      if (!shouldOpenDrawer && mobileBottomPanelOpen && actionState === 'none') {
        setMobileBottomPanelOpen(false)
      }
    }
  }, [isMobile, selectedArmy, actionState, mobileBottomPanelOpen, setMobileBottomPanelOpen])

  // Handle drawer close for mobile
  const handleDrawerClose = useCallback((open: boolean) => {
    setMobileBottomPanelOpen(open)

    if (!open) {
      // Reset states when drawer is manually closed
      if (actionState === 'battlePreview') {
        handleBattleCancel()
      } else if (actionState === 'movementInput') {
        setMoveSubmitted(false)
        setTargetTerritory(null)
        setMoveStrength(0)
      }
    }
  }, [actionState, handleBattleCancel, setMobileBottomPanelOpen, setMoveSubmitted, setTargetTerritory, setMoveStrength])

  // Render action content based on state
  const renderActionContent = () => {
    if (!selectedArmy) return null

    switch (actionState) {
      case 'battlePreview':
        return battleTarget ? (
          <BattlePreview
            selectedArmy={selectedArmy}
            battleTarget={battleTarget}
            getTerritoryColor={getTerritoryColor}
            calculateBattleOdds={calculateBattleOdds}
            onCancel={handleBattleCancel}
            onStartBattle={handleStartBattleAction}
            isMobile={isMobile}
          />
        ) : null

      case 'movementInput':
        return (
          <MovementInput
            selectedArmy={selectedArmy}
            targetTerritory={targetTerritory}
            moveStrength={moveStrength}
            animatingArmies={animatingArmies}
            onMoveStrengthChange={setMoveStrength}
            onMoveArmy={handleMoveArmyAction}
            isMobile={isMobile}
          />
        )

      case 'battleProgress':
        return (
          <BattleProgress
            activeBattle={activeBattle}
            isMobile={isMobile}
          />
        )

      case 'movementMode':
        return (
          <MovementMode
            onCancel={cancelMovement}
            isMobile={isMobile}
          />
        )

      default:
        return null
    }
  }

  // Mobile drawer rendering
  if (isMobile) {
    return (
      <Drawer open={mobileBottomPanelOpen} onOpenChange={handleDrawerClose}>
        <DrawerContent className="max-h-[85vh]">
          <DrawerHeader className="text-left pb-2">
            <DrawerTitle className="flex items-center gap-2 text-lg">
              {actionState === 'battlePreview' && <Sword className="w-5 h-5" />}
              {(actionState === 'movementInput' || actionState === 'movementMode') && <Navigation className="w-5 h-5" />}
              {actionState === 'battleProgress' && <Sword className="w-5 h-5" />}
              {getActionTitle(actionState)}
            </DrawerTitle>
          </DrawerHeader>
          <div className="px-4 pb-6 overflow-y-auto">
            {selectedArmy ? (
              <>
                <ArmyDetails
                  selectedArmy={selectedArmy}
                  animatingArmies={animatingArmies}
                  getTerritoryColor={getTerritoryColor}
                  isMobile={isMobile}
                />
                <div className="mt-4">
                  {renderActionContent()}
                </div>
              </>
            ) : (
              <div className="text-center py-4 text-slate-400">
                Select an army to view details
              </div>
            )}
          </div>
          {actionState === 'none' && (
            <DrawerFooter className="pt-2">
              <DrawerClose asChild>
                <Button variant="outline" className="h-12 w-full">Close</Button>
              </DrawerClose>
            </DrawerFooter>
          )}
        </DrawerContent>
      </Drawer>
    )
  }

  // Desktop rendering
  if (!selectedArmy) {
    return (
      <div className="space-y-4 p-2">
        <Card className="bg-slate-700 border-slate-600 text-white">
          <CardContent className="p-4">
            <p className="text-center text-slate-400">Select an army to view details</p>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="space-y-4 p-2">
      <ArmyDetails
        selectedArmy={selectedArmy}
        animatingArmies={animatingArmies}
        getTerritoryColor={getTerritoryColor}
        isMobile={isMobile}
      />

      {renderActionContent()}
    </div>
  )
}

export default GameOperationPanel
