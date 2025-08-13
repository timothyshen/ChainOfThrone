import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
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
  setMobileBottomPanelOpen = () => {}
}: GameOperationPanelNewProps) => {
  // Context hooks
  const { selectedArmy } = useSelectionContext()
  const { 
    moveStrength, 
    moveSubmitted, 
    animatingArmies,
    setMoveStrength,
    setMoveSubmitted,
    setValidMovementCells,
    setShowMovementPaths,
    setMovementMode,
    getValidMovementCells,
    cancelMovement
  } = useMovementContext()
  const { activeBattle } = useBattleContext()
  
  // Actions
  const { getTerritoryColor } = useGameActions(gameAddress, isMobile, setMobileBottomPanelOpen)

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
        </CardContent>
      </Card>

      {moveSubmitted ? (
        <div className="grid grid-cols-1 gap-2">
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
            disabled={selectedArmy && animatingArmies.has(selectedArmy.id)}
            onClick={() => {
              if (selectedArmy && !animatingArmies.has(selectedArmy.id)) {
                // This would need territories context - will be handled in the refactored version
                // const validCells = getValidMovementCells(selectedArmy)
                // setValidMovementCells(validCells)
                setShowMovementPaths(true)
                setMovementMode(true)
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
                  className={`text-lg font-bold ${
                    activeBattle.winner === "attacker" ? "text-green-400" : "text-red-400"
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
    </div>
  )
}

export default GameOperationPanelNew