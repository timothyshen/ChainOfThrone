import { Territory } from '@/lib/types/game'
import { Card, CardContent } from "@/components/ui/card"

interface GameMapProps {
    currentPlayerId: string
    currentPlayer: string
    territories: Territory[][]
    onTerritoryClick: (territory: Territory) => void
}

export default function GameMap({ currentPlayerId, currentPlayer, territories, onTerritoryClick }: GameMapProps) {
    const gridSize = {
        rows: territories.length,
        cols: territories[0]?.length || 0
    }
    const cellSize = 100
    const padding = 20
    const gridWidth = (gridSize.cols * cellSize) + (padding * 2)
    const gridHeight = (gridSize.rows * cellSize) + (padding * 2)

    return (
        <Card>
            <CardContent className="pt-6">
                <svg
                    viewBox={`0 0 ${gridWidth} ${gridHeight}`}
                    className="w-full h-full border border-gray-300"
                >
                    {territories.map((row, rowIndex) => (
                        row.map((territory, colIndex) => {
                            const x = (colIndex * cellSize) + padding
                            const y = (rowIndex * cellSize) + padding

                            return (
                                <g key={`${rowIndex}-${colIndex}`} onClick={() => onTerritoryClick(territory)}>
                                    <rect
                                        x={x}
                                        y={y}
                                        width={cellSize}
                                        height={cellSize}
                                        fill={territory.isCastle ? '#FFFACD' : 'white'}
                                        stroke="black"
                                        strokeWidth="2"
                                        className="cursor-pointer hover:opacity-80 transition-opacity"
                                    />
                                    <text
                                        x={x + cellSize / 2}
                                        y={y + 25}
                                        textAnchor="middle"
                                        className="text-sm font-medium"
                                    >
                                        {territory.isCastle ? `Castle` : `Land`}
                                    </text>
                                    {territory.isCastle && (
                                        <svg
                                            x={x + 40}
                                            y={y + 35}
                                            width="20"
                                            height="20"
                                            viewBox="0 0 24 24"
                                            fill="currentColor"
                                        >
                                            <path d="M12 2L2 8v14h20V8L12 2zm-2 17H6v-3h4v3zm8 0h-4v-3h4v3zm2-7H4v-5l8-4.5 8 4.5v5z" />
                                        </svg>
                                    )}
                                    {territory.units.map((unit, index) => (
                                        Number(unit) > 0 && (
                                            <g key={index}>
                                                <circle
                                                    cx={x + cellSize / 2}
                                                    cy={y + 70}
                                                    r="5"
                                                    fill={territory.player === currentPlayer ? "#FFFF00" : "#666"}
                                                    stroke="black"
                                                    strokeWidth="2"
                                                />
                                                <text
                                                    x={x + cellSize / 2}
                                                    y={y + 90}
                                                    textAnchor="middle"
                                                    className="text-sm font-medium"
                                                    fill="black"
                                                >
                                                    {Number(unit)}
                                                </text>
                                            </g>
                                        )
                                    ))}
                                </g>
                            )
                        })
                    ))}
                </svg>
            </CardContent>
        </Card>
    )
} 