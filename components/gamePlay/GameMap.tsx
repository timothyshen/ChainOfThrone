import { Territory } from '@/lib/types/game'
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

interface GameMapProps {
    territories: Territory[][]
    onTerritoryClick: (territory: Territory) => void
}

export default function GameMap({ territories, onTerritoryClick }: GameMapProps) {
    // Get grid dimensions from the 2D array
    const gridSize = {
        rows: territories.length,
        cols: territories[0]?.length || 0
    }
    const cellSize = 100
    const gridWidth = gridSize.cols * cellSize
    const gridHeight = gridSize.rows * cellSize

    return (
        <Card>
            <CardHeader>
                <CardTitle>Diplomacy Game Map</CardTitle>
            </CardHeader>
            <CardContent>
                <svg
                    viewBox={`0 0 ${gridWidth} ${gridHeight}`}
                    className="w-full h-full border border-gray-300"
                >
                    {territories.map((row, rowIndex) => (
                        row.map((territory, colIndex) => {
                            const x = colIndex * cellSize
                            const y = rowIndex * cellSize

                            return (
                                <g key={`${rowIndex}-${colIndex}`} onClick={() => onTerritoryClick(territory)}>
                                    {/* Territory cell */}
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

                                    {/* Territory name */}
                                    <text
                                        x={x + cellSize / 2}
                                        y={y + 25}
                                        textAnchor="middle"
                                        className="text-sm font-medium"
                                    >
                                        {`Territory ${rowIndex}-${colIndex}`}
                                    </text>

                                    {/* Castle icon */}
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

                                    {/* Units */}
                                    {territory.units > 0 && (
                                        <g>
                                            <circle
                                                cx={x + cellSize / 2}
                                                cy={y + 70}
                                                r="15"
                                                fill={territory.player === "0x0000000000000000000000000000000000000000" ? "#ddd" : "#666"}
                                                stroke="black"
                                                strokeWidth="2"
                                            />
                                            <text
                                                x={x + cellSize / 2}
                                                y={y + 70}
                                                textAnchor="middle"
                                                dominantBaseline="middle"
                                                fill="white"
                                                fontSize="12"
                                            >
                                                {territory.units}
                                            </text>
                                        </g>
                                    )}
                                </g>
                            )
                        })
                    ))}
                </svg>
            </CardContent>
        </Card>
    )
} 