import { Territory } from '@/lib/types/game'
import { Card, CardContent } from "@/components/ui/card"
import { Swords, Castle, Loader2 } from 'lucide-react'
import { cn } from '@/lib/utils'

interface GameMapProps {
    currentPlayer: string
    territories: Territory[][]
    onTerritoryClick: (territory: Territory) => void
    isLoading: boolean
}

export default function GameMap({ currentPlayer, territories, onTerritoryClick, isLoading }: GameMapProps) {
    const gridSize = {
        rows: territories.length,
        cols: territories[0]?.length || 0
    }
    const cellSize = 100
    const padding = 20
    const gridWidth = (gridSize.cols * cellSize) + (padding * 2)
    const gridHeight = (gridSize.rows * cellSize) + (padding * 2)

    if (isLoading) {
        return <div className="flex justify-center items-center h-full">
            <Loader2 className="h-8 w-8 animate-spin" />
        </div>
    }

    return (
        <Card>
            <CardContent className="pt-6">
                <div className="w-full max-w-3xl mx-auto p-4">
                    <div className="grid grid-cols-3 gap-2 aspect-square">
                        {territories.map((row, rowIndex) =>
                            row.map((territory, colIndex) => (
                                <div
                                    key={`${rowIndex}-${colIndex}`}
                                    className={cn(
                                        "relative border-2 border-gray-800 rounded-lg p-4 transition-all duration-200",
                                        "hover:shadow-lg hover:scale-[1.02]",
                                        "flex flex-col items-center justify-between",
                                        territory.isCastle ? "bg-amber-50" : "bg-white",
                                    )}
                                    onClick={() => onTerritoryClick(territory)}
                                >
                                    <div className="text-lg font-semibold mb-2">{territory.isCastle ? "Castle" : "Land"}</div>

                                    {territory.isCastle && <Castle className="w-12 h-12 text-gray-800 mb-2" aria-label="Castle icon" />}

                                    {territory.units.map((unit, index) => (
                                        Number(unit) > 0 && (
                                            <div key={index} className="flex items-center gap-2">
                                                <div
                                                    className={cn(
                                                        "rounded-full w-8 h-8 flex items-center justify-center",
                                                        territory.player === currentPlayer ? "bg-yellow-400" : "bg-gray-600",
                                                    )}
                                                >
                                                    <Swords className={cn("w-5 h-5", territory.player === currentPlayer ? "text-gray-800" : "text-white")} />
                                                </div>
                                                <p className="text-xl font-bold">{Number(unit)}</p>
                                            </div>
                                        )
                                    ))}
                                </div>
                            )),
                        )}
                    </div>
                </div>
            </CardContent>
        </Card>
    )
}


