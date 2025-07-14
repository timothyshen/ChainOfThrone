import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { getTerritoryColor } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Navigation, Shield, Sword, Users } from "lucide-react"

interface GameOperationPanelProps {
    activePanel: "army" | "territory" | "overview"
    selectedArmy: Army | null
    animatingArmies: Set<string>
    movementMode: boolean
    cancelMovement: () => void
    activeSiege: Siege | null
    activeBattle: Battle | null
}

const GameOperationPanel = ({
    activePanel,
    selectedArmy,
    animatingArmies,
    movementMode,
    cancelMovement,
    activeSiege,
    activeBattle,
}: GameOperationPanelProps) => (
    <div className="space-y-4 p-2">
        {activePanel === "army" && selectedArmy && (
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
                ) : activeSiege && activeSiege.attackerArmy.id === selectedArmy.id ? (
                    <div className="space-y-2">
                        <div className="bg-orange-900/50 border border-orange-600 rounded-lg p-3">
                            <div className="flex items-center gap-2 mb-2">
                                <Shield className="w-4 h-4 text-orange-400" />
                                <span className="text-orange-400 font-semibold">Siege in Progress</span>
                            </div>

                            {activeSiege.phase === "combat" && (
                                <>
                                    <div className="text-sm mb-2 capitalize text-orange-300">
                                        Phase: {activeSiege.siegePhase.replace("_", " ")}
                                    </div>

                                    <div className="w-full bg-slate-700 rounded-full h-2 mb-2">
                                        <div
                                            className="bg-orange-500 h-2 rounded-full transition-all duration-150"
                                            style={{ width: `${activeSiege.progress * 100}%` }}
                                        />
                                    </div>

                                    <div className="space-y-1 text-xs">
                                        <div className="flex justify-between">
                                            <span>Wall Integrity:</span>
                                            <span
                                                className={
                                                    activeSiege.wallIntegrity > 50
                                                        ? "text-green-400"
                                                        : activeSiege.wallIntegrity > 25
                                                            ? "text-yellow-400"
                                                            : "text-red-400"
                                                }
                                            >
                                                {Math.round(activeSiege.wallIntegrity)}%
                                            </span>
                                        </div>
                                        <div className="flex justify-between">
                                            <span>Attacker Losses:</span>
                                            <span className="text-red-400">-{activeSiege.attackerDamage}</span>
                                        </div>
                                        <div className="flex justify-between">
                                            <span>Defender Losses:</span>
                                            <span className="text-red-400">-{activeSiege.defenderDamage}</span>
                                        </div>
                                    </div>
                                </>
                            )}

                            {activeSiege.phase === "results" && (
                                <div className="text-center">
                                    <div
                                        className={`text-lg font-bold ${activeSiege.winner === "attacker" ? "text-green-400" : "text-red-400"
                                            }`}
                                    >
                                        {activeSiege.winner === "attacker" ? "Fortress Captured!" : "Siege Failed!"}
                                    </div>
                                </div>
                            )}
                        </div>
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

export default GameOperationPanel