import { Territory } from '@/lib/types/game'
import { Card, CardContent } from "@/components/ui/card"
import { Loader2, Sword, Crown } from 'lucide-react'
import { useState } from 'react'

interface GameMapProps {
    currentPlayer: string
    territories: Territory[][]
    onTerritoryClick: (territory: Territory) => void
    isLoading: boolean
    isMobileBottomPanelOpen?: boolean
    panelHeight?: number
}

export default function GameMap({
    currentPlayer,
    territories,
    onTerritoryClick,
    isLoading,
    isMobileBottomPanelOpen = false,
    panelHeight = 300
}: GameMapProps) {
    const [selectedTerritory, setSelectedTerritory] = useState<Territory | null>(null)

    const handleTerritoryClick = (territory: Territory) => {
        setSelectedTerritory(territory)
        onTerritoryClick(territory)
    }

    if (isLoading) {
        return <div className="flex justify-center items-center h-full">
            <Loader2 className="h-8 w-8 animate-spin" />
        </div>
    }

    return (
        <Card className="h-full">
            <CardContent className="p-3 h-full flex flex-col border-none">
                {/* Map Grid Container */}
                <div
                    className="overflow-auto h-full md:h-[calc(100vh-200px)] lg:h-[calc(100vh-150px)]"
                    style={{
                        height: isMobileBottomPanelOpen
                            ? `calc(100vh - ${panelHeight + 100}px)`
                            : 'calc(100vh - 200px)', // Reserve space for potential panels
                        maxHeight: '100%'
                    }}
                >
                    <div className="w-full h-full grid grid-cols-3 grid-rows-3 gap-2 min-h-[400px] max-w-4xl mx-auto">
                        {territories.map((row, rowIndex) => (
                            row.map((territory, colIndex) => {
                                const isSelected = selectedTerritory?.id === territory.id
                                const isOwned = territory.player === currentPlayer
                                const totalUnits = territory.units.reduce((total, unit) => total + Number(unit), 0)

                                return (
                                    <div
                                        key={territory.id}
                                        onClick={() => handleTerritoryClick(territory)}
                                        className={`
                                            relative border-2 rounded-lg cursor-pointer transition-all duration-200 
                                            active:scale-95 min-h-[120px] p-3
                                            ${isSelected
                                                ? "border-yellow-400 shadow-lg shadow-yellow-400/50 bg-yellow-50"
                                                : territory.isCastle
                                                    ? "border-amber-600 bg-amber-50"
                                                    : "border-slate-600 bg-white"
                                            }
                                            ${isOwned ? "ring-2 ring-green-400 ring-offset-0" : ""}
                                        `}
                                    >
                                        {/* Territory Header */}
                                        <div className="flex items-center justify-between mb-2">
                                            <div className="flex items-center gap-1">
                                                {territory.isCastle && <Crown className="w-4 h-4 text-amber-600" />}
                                                <span className="text-sm font-bold truncate">{territory.name}</span>
                                            </div>
                                            {isOwned && (
                                                <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                                            )}
                                        </div>

                                        {/* Territory Type */}
                                        <div className="text-xs text-gray-600 mb-2">
                                            {territory.isCastle ? "Castle" : "Territory"}
                                        </div>

                                        {/* Units Display */}
                                        {totalUnits > 0 && (
                                            <div className="flex items-center gap-2 mt-auto">
                                                <div className={`
                                                    flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium
                                                    ${isOwned
                                                        ? "bg-green-100 text-green-800"
                                                        : "bg-gray-100 text-gray-800"
                                                    }
                                                `}>
                                                    <Sword className="w-3 h-3" />
                                                    <span>{totalUnits}</span>
                                                </div>
                                            </div>
                                        )}

                                        {/* Coordinates (for debugging) */}
                                        <div className="absolute top-1 right-1 text-xs text-gray-400">
                                            {rowIndex},{colIndex}
                                        </div>

                                        {/* Player Ownership Indicator */}
                                        {territory.player !== "0x0000000000000000000000000000000000000000" && (
                                            <div className={`
                                                absolute bottom-2 right-2 w-6 h-6 rounded-full border-2 border-white text-xs 
                                                flex items-center justify-center font-bold text-white
                                                ${isOwned ? "bg-green-500" : "bg-gray-500"}
                                            `}>
                                                {territory.player.slice(-2)}
                                            </div>
                                        )}
                                    </div>
                                )
                            })
                        ))}
                    </div>
                </div>

                {/* Instructions */}
                <p className="text-xs text-muted-foreground text-center mt-2 px-2">
                    Click on territories to select them. Green ring indicates your territories.
                </p>
            </CardContent>
        </Card>
    )
} 