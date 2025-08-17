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


interface GameOperationPanelNewProps {
  gameAddress: `0x${string}` | undefined
  isMobile?: boolean
  setMobileBottomPanelOpen?: (open: boolean) => void
}

const GameOperationPanelNew = ({
  gameAddress,
  isMobile = false,
  setMobileBottomPanelOpen = () => { }
}: GameOperationPanelNewProps) => {
  // Context hooks
  const { selectedArmy } = useSelectionContext()
  const {
    moveStrength,
    moveSubmitted,
    targetTerritory,
    animatingArmies,
    setMoveStrength,
    setMoveSubmitted,
    setValidMovementCells,
    setShowMovementPaths,
    setMovementMode,
    getValidMovementCells,
    cancelMovement
  } = useMovementContext()
  const {
    activeBattle,
    showBattlePreview,
    battleTarget,
    calculateBattleOdds,
    setShowBattlePreview,
    setBattleTarget
  } = useBattleContext()

  // Actions
  const { getTerritoryColor, handleAction, handleStartBattle } = useGameActions(gameAddress, isMobile, setMobileBottomPanelOpen)

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
    return (
      <>
        {showBattlePreview && battleTarget ? (
          <Card className="bg-slate-700 border-slate-600 text-white">
            <CardHeader className="pb-2">
              <CardTitle className="text-lg flex items-center gap-2">
                <Sword className="w-4 h-4" />
                Battle Preview
              </CardTitle>
            </CardHeader>
            <CardContent className="p-4">
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

                {battleTarget.army && (
                  <div className="bg-slate-600 rounded-lg p-3 space-y-2">
                    <div className="text-sm font-semibold">Battle Odds</div>
                    {(() => {
                      const odds = calculateBattleOdds(selectedArmy, battleTarget.army!)
                      return (
                        <div className="space-y-1">
                          <div className="flex justify-between text-sm">
                            <span>Attacker wins:</span>
                            <span className="text-green-400">{(odds.attackerOdds * 100).toFixed(1)}%</span>
                          </div>
                          <div className="flex justify-between text-sm">
                            <span>Defender wins:</span>
                            <span className="text-red-400">{(odds.defenderOdds * 100).toFixed(1)}%</span>
                          </div>
                        </div>
                      )
                    })()}
                  </div>
                )}

                <div className="grid grid-cols-2 gap-2">
                  <Button
                    variant="outline"
                    className="w-full text-black"
                    onClick={() => {
                      setShowBattlePreview(false)
                      setBattleTarget(null)
                    }}
                  >
                    Cancel
                  </Button>
                  <Button
                    className="w-full bg-red-600 hover:bg-red-700 text-white"
                    onClick={() => {
                      if (battleTarget.army) {
                        handleStartBattle(selectedArmy, battleTarget.army)
                      } else if (battleTarget.territory) {
                        handleStartBattle(selectedArmy, battleTarget.territory)
                      }
                    }}
                  >
                    <Sword className="w-4 h-4 mr-2" />
                    Start Battle
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ) : moveSubmitted ? (
          <div className="grid grid-cols-1 gap-2">
            {targetTerritory && (
              <div className="bg-blue-900/50 border border-blue-600 rounded-lg p-2 mb-2">
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
                className="w-full text-black"
                maxLength={Number(selectedArmy.size)}
                onChange={(e) => {
                  const value = parseInt(e.target.value)
                  if (value >= 0 && value <= Number(selectedArmy.size)) {
                    setMoveStrength(value)
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
              className="w-full text-black"
              disabled={selectedArmy && animatingArmies.has(selectedArmy.id) || moveStrength <= 0 || !targetTerritory}
              onClick={async () => {
                if (selectedArmy && !animatingArmies.has(selectedArmy.id) && moveStrength > 0 && targetTerritory) {
                  // Trigger the move with animation
                  await handleAction(targetTerritory, moveStrength)
                }
              }}
            >
              <Navigation className="w-4 h-4 mr-2" />
              {selectedArmy && animatingArmies.has(selectedArmy.id) ? "Moving..." : "Move Army"}
            </Button>
          </div>
        ) : activeBattle && activeBattle.attackerArmy.id === selectedArmy.id ? (
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
        ) : (
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
              className="w-full text-black"
              onClick={cancelMovement}
            >
              Cancel Movement
            </Button>
          </div>
        )}
      </>
    )
  }

  const actionPanelMobile = () => {
    return (
      <Drawer open={showBattlePreview} onOpenChange={() => { }}>
        <DrawerContent>
          <DrawerHeader className="text-left">
            <DrawerTitle>Action Panel</DrawerTitle>
          </DrawerHeader>
          <DrawerFooter className="pt-2">
            <DrawerClose asChild>
              <Button variant="outline">Cancel</Button>
            </DrawerClose>
          </DrawerFooter>
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

export default GameOperationPanelNew