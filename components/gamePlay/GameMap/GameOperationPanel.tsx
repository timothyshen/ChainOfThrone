import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerDescription,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from "@/components/ui/drawer"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Navigation, Shield, Sword, Users } from "lucide-react"
import { Input } from "@/components/ui/input"
import {
  useSelectionContext,
  useMovementContext,
  useBattleContext
} from "@/lib/contexts/GameContext"
import { useGameActions } from "@/lib/hooks/useGameActions"
import { Army, Territory } from "@/lib/types/game"
import { BattleTarget } from "@/lib/types/advancedGame"
import { useEffect } from "react"


// Shared Content Components
interface BattlePreviewContentProps {
  selectedArmy: Army
  battleTarget: BattleTarget
  getTerritoryColor: (owner: string) => string
  calculateBattleOdds: (attacker: Army, defender: Army | Territory) => { attackerOdds: number; defenderOdds: number }
  onCancel: () => void
  onStartBattle: () => void
  isMobile?: boolean
}

const BattlePreviewContent = ({
  selectedArmy,
  battleTarget,
  getTerritoryColor,
  calculateBattleOdds,
  onCancel,
  onStartBattle,
  isMobile = false
}: BattlePreviewContentProps) => (
  <div className="space-y-3">
    <div className="flex justify-between">
      <span>Attacker</span>
      <Badge style={{ backgroundColor: getTerritoryColor(selectedArmy.owner) }}>
        {selectedArmy.owner} ({Number(selectedArmy.size).toLocaleString()})
      </Badge>
    </div>

    {battleTarget.army ? (
      <div className="flex justify-between">
        <span>Defender</span>
        <Badge style={{ backgroundColor: getTerritoryColor(battleTarget.army.owner) }}>
          {battleTarget.army.owner} ({Number(battleTarget.army.size).toLocaleString()})
        </Badge>
      </div>
    ) : battleTarget.territory ? (
      <div className="flex justify-between">
        <span>Target</span>
        <Badge variant="secondary">
          Territory ({battleTarget.territory.x}, {battleTarget.territory.y})
        </Badge>
      </div>
    ) : null}

    <div className={`grid gap-3 ${isMobile ? 'grid-cols-1' : 'grid-cols-2'}`}>
      <Button
        variant="outline"
        className={`${isMobile ? 'h-12 text-base' : ''} text-black`}
        onClick={onCancel}
      >
        Cancel
      </Button>
      <Button
        className={`${isMobile ? 'h-12 text-base' : ''} bg-red-600 hover:bg-red-700 text-white`}
        onClick={onStartBattle}
      >
        <Sword className={`${isMobile ? 'w-5 h-5' : 'w-4 h-4'} mr-2`} />
        Start Battle
      </Button>
    </div>
  </div>
)

interface MovementInputContentProps {
  selectedArmy: Army
  targetTerritory: Territory | null
  moveStrength: number
  animatingArmies: Set<string>
  onMoveStrengthChange: (value: number) => void
  onMoveArmy: () => void
  isMobile?: boolean
}

const MovementInputContent = ({
  selectedArmy,
  targetTerritory,
  moveStrength,
  animatingArmies,
  onMoveStrengthChange,
  onMoveArmy,
  isMobile = false
}: MovementInputContentProps) => (
  <div className="grid grid-cols-1 gap-2">
    {targetTerritory && (
      <div className="bg-blue-200 border border-blue-600 rounded-lg p-2 mb-2">
        <div className="flex items-center gap-2">
          <Navigation className="w-4 h-4 text-blue-400" />
          <span className="text-blue-400 text-sm">
            Moving to ({targetTerritory.x}, {targetTerritory.y})
          </span>
        </div>
      </div>
    )}
    <div className="space-y-1">
      <Input
        type="number"
        placeholder="Enter army number"
        className={`w-full text-black ${isMobile ? 'h-12 text-lg' : ''}`}
        maxLength={Number(selectedArmy.size)}
        onChange={(e) => {
          const value = parseInt(e.target.value)
          if (value >= 0 && value <= Number(selectedArmy.size)) {
            onMoveStrengthChange(value)
          }
        }}
      />
      {moveStrength > Number(selectedArmy.size) && (
        <p className="text-red-500 text-xs">
          Cannot exceed army size of {Number(selectedArmy.size)}
        </p>
      )}
      {moveStrength < 0 && (
        <p className="text-red-500 text-xs">Army size cannot be negative</p>
      )}
    </div>
    <Button
      variant="outline"
      className={`w-full text-black ${isMobile ? 'h-12 text-base' : ''}`}
      disabled={selectedArmy && animatingArmies.has(selectedArmy.id) || moveStrength <= 0 || !targetTerritory}
      onClick={onMoveArmy}
    >
      <Navigation className={`${isMobile ? 'w-5 h-5' : 'w-4 h-4'} mr-2`} />
      {selectedArmy && animatingArmies.has(selectedArmy.id) ? "Moving..." : "Move Army"}
    </Button>
  </div>
)

interface BattleProgressContentProps {
  activeBattle: any // BattleState type
  isMobile?: boolean
}

const BattleProgressContent = ({ activeBattle, isMobile = false }: BattleProgressContentProps) => (
  <div className="space-y-2">
    <div className="bg-red-900/50 border border-red-600 rounded-lg p-3">
      <div className="flex items-center gap-2 mb-2">
        <Sword className="w-4 h-4 text-red-400" />
        <span className="text-red-400 font-semibold">Battle in Progress</span>
      </div>

      {activeBattle.phase === "combat" && (
        <>
          <div className="w-full bg-slate-700 rounded-full h-2 mb-2">
            <div
              className="bg-red-500 h-2 rounded-full transition-all duration-100"
              style={{ width: `${activeBattle.progress * 100}%` }}
            />
          </div>
          <div className="flex justify-between text-xs">
            <span>Attacker: -{activeBattle.attackerDamage}</span>
            <span>Defender: -{activeBattle.defenderDamage}</span>
          </div>
        </>
      )}

      {activeBattle.phase === "results" && (
        <div className="text-center">
          <div
            className={`text-lg font-bold ${activeBattle.winner === "attacker" ? "text-green-400" : "text-red-400"
              }`}
          >
            {activeBattle.winner === "attacker" ? "Victory!" : "Defeat!"}
          </div>
        </div>
      )}
    </div>
  </div>
)

interface MovementModeContentProps {
  onCancel: () => void
  isMobile?: boolean
}

const MovementModeContent = ({ onCancel, isMobile = false }: MovementModeContentProps) => (
  <div className="space-y-2">
    <div className="bg-green-900/50 border border-green-600 rounded-lg p-3">
      <div className="flex items-center gap-2 mb-2">
        <Navigation className="w-4 h-4 text-green-400" />
        <span className="text-green-400 font-semibold">Movement Mode Active</span>
      </div>
      <p className="text-sm text-green-300">
        Click on a highlighted cell to move your army there.
      </p>
    </div>
    <Button
      variant="outline"
      className={`w-full text-black ${isMobile ? 'h-12 text-base' : ''}`}
      onClick={onCancel}
    >
      Cancel Movement
    </Button>
  </div>
)

interface GameOperationPanelProps {
  gameAddress: `0x${string}` | undefined
  isMobile?: boolean
  mobileBottomPanelOpen: boolean
  setMobileBottomPanelOpen?: (open: boolean) => void
}

// Action State Types
type ActionState = 'battlePreview' | 'movementInput' | 'battleProgress' | 'movementMode' | 'none'

// Unified Content Renderer
const getActionContent = (
  actionState: ActionState,
  props: {
    selectedArmy: Army
    battleTarget: BattleTarget | null
    targetTerritory: Territory | null
    moveStrength: number
    animatingArmies: Set<string>
    activeBattle: any
    getTerritoryColor: (owner: string) => string
    calculateBattleOdds: (attacker: Army, defender: Army | Territory) => { attackerOdds: number; defenderOdds: number }
    onBattleCancel: () => void
    onStartBattle: () => void
    onMoveStrengthChange: (value: number) => void
    onMoveArmy: () => void
    onCancelMovement: () => void
    isMobile?: boolean
  }
) => {
  const { isMobile = false } = props

  switch (actionState) {
    case 'battlePreview':
      return props.battleTarget ? (
        <BattlePreviewContent
          selectedArmy={props.selectedArmy}
          battleTarget={props.battleTarget}
          getTerritoryColor={props.getTerritoryColor}
          calculateBattleOdds={props.calculateBattleOdds}
          onCancel={props.onBattleCancel}
          onStartBattle={props.onStartBattle}
          isMobile={isMobile}
        />
      ) : null

    case 'movementInput':
      return (
        <MovementInputContent
          selectedArmy={props.selectedArmy}
          targetTerritory={props.targetTerritory}
          moveStrength={props.moveStrength}
          animatingArmies={props.animatingArmies}
          onMoveStrengthChange={props.onMoveStrengthChange}
          onMoveArmy={props.onMoveArmy}
          isMobile={isMobile}
        />
      )

    case 'battleProgress':
      return (
        <BattleProgressContent
          activeBattle={props.activeBattle}
          isMobile={isMobile}
        />
      )

    case 'movementMode':
      return (
        <MovementModeContent
          onCancel={props.onCancelMovement}
          isMobile={isMobile}
        />
      )

    default:
      return null
  }
}

const getActionTitle = (actionState: ActionState): string => {
  switch (actionState) {
    case 'battlePreview': return 'Battle Preview'
    case 'movementInput': return 'Move Army'
    case 'battleProgress': return 'Battle in Progress'
    case 'movementMode': return 'Movement Mode'
    default: return 'Army Actions'
  }
}

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
    setValidMovementCells,
    setShowMovementPaths,
    setMovementMode,
    getValidMovementCells,
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
  const { getTerritoryColor, handleAction, handleStartBattle } = useGameActions(gameAddress, isMobile, setMobileBottomPanelOpen)

  // Determine current action state
  const getCurrentActionState = (): ActionState => {
    if (showBattlePreview && battleTarget) return 'battlePreview'
    if (moveSubmitted) return 'movementInput'
    if (activeBattle && activeBattle.attackerArmy.id === selectedArmy?.id) return 'battleProgress'
    // Only return 'none' - movementMode state exists but doesn't trigger drawer
    // The movement mode shows path overlays on the map, drawer only opens for specific actions
    return 'none'
  }

  const actionState = getCurrentActionState()

  // Action handlers
  const handleBattleCancel = () => {
    setShowBattlePreview(false)
    setBattleTarget(null)
  }

  const handleStartBattleAction = () => {
    if (battleTarget?.army) {
      handleStartBattle(selectedArmy!, battleTarget.army)
    } else if (battleTarget?.territory) {
      handleStartBattle(selectedArmy!, battleTarget.territory)
    }
  }

  const handleMoveArmyAction = async () => {
    if (selectedArmy && !animatingArmies.has(selectedArmy.id) && moveStrength > 0 && targetTerritory) {
      await handleAction(targetTerritory, moveStrength)
    }
  }

  // Props for content renderer
  const contentProps = {
    selectedArmy: selectedArmy!,
    battleTarget,
    targetTerritory,
    moveStrength,
    animatingArmies,
    activeBattle,
    getTerritoryColor,
    calculateBattleOdds,
    onBattleCancel: handleBattleCancel,
    onStartBattle: handleStartBattleAction,
    onMoveStrengthChange: setMoveStrength,
    onMoveArmy: handleMoveArmyAction,
    onCancelMovement: cancelMovement
  }


  // Auto-manage mobile drawer state based on action state
  useEffect(() => {
    if (isMobile && selectedArmy) {
      const shouldOpenDrawer = actionState !== 'none'

      // Auto-open drawer for actionable states (battle preview, movement input, battle progress)
      if (shouldOpenDrawer && !mobileBottomPanelOpen) {
        setMobileBottomPanelOpen(true)
      }

      // Auto-close drawer when action completes (transitions to 'none')
      if (!shouldOpenDrawer && mobileBottomPanelOpen && actionState === 'none') {
        setMobileBottomPanelOpen(false)
      }
    }
  }, [isMobile, selectedArmy, actionState, mobileBottomPanelOpen, setMobileBottomPanelOpen])

  // Handle drawer close for mobile - reset action states appropriately
  const handleDrawerClose = (open: boolean) => {
    setMobileBottomPanelOpen(open)

    if (!open) {
      // Reset states when drawer is manually closed
      if (actionState === 'battlePreview') {
        handleBattleCancel()
      } else if (actionState === 'movementInput') {
        // For movement input, only reset the move submission state but keep movement mode active
        setMoveSubmitted(false)
        setTargetTerritory(null)
        setMoveStrength(0)
      }
    }
  }

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

  const actionPanelDesktop = () => {
    const content = getActionContent(actionState, { ...contentProps, isMobile: false })

    if (!content) return null

    // For desktop, we can wrap action content in cards if needed
    if (actionState === 'battlePreview') {
      return (
        <Card className="bg-slate-700 border-slate-600 text-white">
          <CardHeader className="pb-2">
            <CardTitle className="text-lg flex items-center gap-2">
              <Sword className="w-4 h-4" />
              {getActionTitle(actionState)}
            </CardTitle>
          </CardHeader>
          <CardContent className="p-4">
            {content}
          </CardContent>
        </Card>
      )
    }

    return content
  }

  const actionPanelMobile = () => {
    const content = getActionContent(actionState, { ...contentProps, isMobile: true })

    return (
      <Drawer open={mobileBottomPanelOpen} onOpenChange={handleDrawerClose}>
        <DrawerContent className="max-h-[85vh]">
          <DrawerHeader className="text-left pb-2">
            <DrawerTitle className="flex items-center gap-2 text-lg">
              {actionState === 'battlePreview' && <Sword className="w-5 h-5" />}
              {actionState === 'movementInput' && <Navigation className="w-5 h-5" />}
              {actionState === 'battleProgress' && <Sword className="w-5 h-5" />}
              {actionState === 'movementMode' && <Navigation className="w-5 h-5" />}
              {getActionTitle(actionState)}
            </DrawerTitle>
          </DrawerHeader>
          <div className="px-4 pb-6 overflow-y-auto">
            {content || (
              <div className="text-center py-4 text-slate-400">
                No actions available
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

  return (
    <div className="space-y-4 p-2">
      <Card className="bg-slate-700 border-slate-600 text-white">
        <CardHeader className="pb-2">
          <CardTitle className="text-lg flex items-center gap-2">
            <Users className="w-4 h-4" />
            Army Details
          </CardTitle>
        </CardHeader>
        <CardContent className="p-4">
          <div className="space-y-3">
            <div className="flex justify-between">
              <span>Owner</span>
              <Badge style={{ backgroundColor: getTerritoryColor(selectedArmy.owner) }}>
                {selectedArmy.owner}
              </Badge>
            </div>
            <div className="flex justify-between">
              <span>Size</span>
              <span>{Number(selectedArmy.size).toLocaleString()} troops</span>
            </div>
            <div className="flex justify-between">
              <span>Position</span>
              <span>({selectedArmy.x}, {selectedArmy.y})</span>
            </div>
            <div className="flex justify-between">
              <span>Status</span>
              <Badge
                variant={selectedArmy.isMoving || animatingArmies.has(selectedArmy.id) ? "default" : "secondary"}
              >
                {animatingArmies.has(selectedArmy.id)
                  ? "Moving..."
                  : selectedArmy.isMoving
                    ? "Moving"
                    : "Stationed"}
              </Badge>
            </div>
          </div>
          {isMobile ? actionPanelMobile() : actionPanelDesktop()}
        </CardContent>
      </Card>


    </div>
  )
}

export default GameOperationPanel