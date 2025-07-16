import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Navigation, Shield, Sword, Users } from "lucide-react"
import { Army, Territory } from "@/lib/types/game"
import { BattleState } from "@/lib/types/advancedGame"

interface GameOperationPanelProps {
    selectedArmy: Army | null
    animatingArmies: Set<string>
    movementMode: boolean
    cancelMovement: () => void
    activeBattle: BattleState | null
}

const GameOperationPanel = ({
    selectedArmy,
    animatingArmies,
    movementMode,
    cancelMovement,
    activeBattle,
}: GameOperationPanelProps) => {

    const initiateBattle = (target: Army | Territory) => {
        if (!selectedArmy) return
        setBattleTarget({
            army: "size" in target ? (target as Army) : undefined,
            territory: "units" in target ? (target as Territory) : undefined,
        })
        setShowBattlePreview(true)
    }


    return (
        <div className="space-y-4 p-2">
            {selectedArmy && (
                <>
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
                                    <Badge style={{ backgroundColor: getTerritoryColor(selectedArmy.owner) }}>{selectedArmy.owner}</Badge>
                                </div>
                                <div className="flex justify-between">
                                    <span>Size</span>
                                    <span>{selectedArmy.size} troops</span>
                                </div>
                                <div className="flex justify-between">
                                    <span>Position</span>
                                    <span>
                                        ({selectedArmy.gridX}, {selectedArmy.gridY})
                                    </span>
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

                    {movementMode ? (
                        <div className="space-y-2">
                            <div className="bg-green-900/50 border border-green-600 rounded-lg p-3">
                                <div className="flex items-center gap-2 mb-2">
                                    <Navigation className="w-4 h-4 text-green-400" />
                                    <span className="text-green-400 font-semibold">Movement Mode Active</span>
                                </div>
                                <p className="text-sm text-green-300">Click on a highlighted cell to move your army there.</p>
                            </div>
                            <Button variant="outline" className="w-full text-black" onClick={cancelMovement}>
                                Cancel Movement
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
                        <div className="grid grid-cols-1 gap-2">
                            <Button
                                variant="outline"
                                className="w-full text-black"
                                disabled={selectedArmy && animatingArmies.has(selectedArmy.id)}
                                onClick={() => {
                                    if (selectedArmy && !animatingArmies.has(selectedArmy.id)) {
                                        const validCells = getValidMovementCells(selectedArmy)
                                        setValidMovementCells(validCells)
                                        setShowMovementPaths(true)
                                        setMovementMode(true)
                                    }
                                }}
                            >
                                <Navigation className="w-4 h-4 mr-2" />
                                {selectedArmy && animatingArmies.has(selectedArmy.id) ? "Moving..." : "Move Army"}
                            </Button>
                            <Button
                                variant="outline"
                                className="w-full text-black"
                                onClick={() => {
                                    // Find nearby enemies to attack
                                    const nearbyEnemies = armies.filter(
                                        (army) =>
                                            army.owner !== selectedArmy?.owner &&
                                            Math.abs(army.gridX - selectedArmy!.gridX) <= 1 &&
                                            Math.abs(army.gridY - selectedArmy!.gridY) <= 1,
                                    )

                                    const nearbyTerritories = territories.filter(
                                        (territory) =>
                                            territory.owner !== selectedArmy?.owner &&
                                            Math.abs(territory.gridX - selectedArmy!.gridX) <= 1 &&
                                            Math.abs(territory.gridY - selectedArmy!.gridY) <= 1,
                                    )

                                    const firstEnemy = nearbyEnemies[0]
                                    const firstTerritory = nearbyTerritories[0]

                                    if (firstEnemy) {
                                        initiateBattle(firstEnemy)
                                    } else if (firstTerritory) {
                                        initiateBattle(firstTerritory)
                                    }
                                }}
                            >
                                <Sword className="w-4 h-4 mr-2" />
                                Attack Nearby
                            </Button>
                            <Button variant="outline" className="w-full text-black">
                                <Users className="w-4 h-4 mr-2" />
                                Split Army
                            </Button>
                        </div>
                    )}
                </>
            )}
        </div>
    )
}

export default GameOperationPanel