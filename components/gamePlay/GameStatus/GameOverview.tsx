import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { MapPin, Crown, Coins, Wheat, Pickaxe } from "lucide-react"
import { useGameStateContext } from "@/lib/contexts/GameContext"
import { useEffect, useState } from "react"
import { Territory } from "@/lib/types/game"

interface GameOverviewProps {
    playerAddress: `0x${string}` | undefined
}


export const GameOverview = ({
    playerAddress
}: GameOverviewProps) => {
    const { territories: gameTerritories, armies } = useGameStateContext()

    const [playerTerritories, setPlayerTerritories] = useState<Territory[]>([])

    useEffect(() => {
        const fetchPlayerTerritories = () => {
            if (!playerAddress) return

            // Find territories controlled by player's armies
            const controlledTerritories = gameTerritories.flat().filter((territory: Territory) => {
                // Check if player has an army on this territory
                const hasPlayerArmy = territory.isCastle || armies.some(army =>
                    army.x === territory.x &&
                    army.y === territory.y &&
                    army.owner === playerAddress
                )
                return hasPlayerArmy
            })

            console.log('🐛 Player controlled territories:', {
                playerAddress,
                totalTerritories: gameTerritories.flat().length,
                totalArmies: armies.length,
                playerArmies: armies.filter(army => army.owner === playerAddress),
                controlledTerritories: controlledTerritories.length,
                territories: controlledTerritories
            })
            setPlayerTerritories(controlledTerritories)
        }
        fetchPlayerTerritories()
    }, [playerAddress, gameTerritories, armies])


    return (
        <>
            {/* Territories */}
            <Card>
                <CardHeader className="pb-2">
                    <CardTitle className="text-sm flex items-center gap-2">
                        <MapPin className="w-4 h-4" />
                        Your Territories
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    {playerTerritories.length === 0 ? (
                        <div className="text-center py-4">
                            <Crown className="w-8 h-8 text-muted-foreground mx-auto mb-2" />
                            <p className="text-sm text-muted-foreground">No territories controlled yet</p>
                        </div>
                    ) : (
                        <div className="space-y-2">
                            <div className="flex justify-between items-center mb-3">
                                <span className="text-sm font-medium">Controlled Territories</span>
                                <span className="text-sm bg-primary/10 text-primary px-2 py-1 rounded">
                                    {playerTerritories.length}
                                </span>
                            </div>
                            <div className="space-y-1 max-h-32 overflow-y-auto">
                                {playerTerritories.map((territory) => (
                                    <div key={territory.id} className="flex items-center justify-between p-2 bg-secondary/50 rounded-lg">
                                        <div className="flex items-center gap-2">
                                            {territory.isCastle ? (
                                                <Crown className="w-4 h-4 text-yellow-500" />
                                            ) : (
                                                <MapPin className="w-4 h-4 text-green-500" />
                                            )}
                                            <span className="text-sm font-medium">{territory.name}</span>
                                        </div>
                                        <span className="text-xs text-muted-foreground">
                                            ({territory.x}, {territory.y})
                                        </span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                </CardContent>
            </Card>
        </>
    )
}