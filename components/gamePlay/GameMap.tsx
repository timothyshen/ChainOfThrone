import { Territory, Unit } from '@/lib/types/game'
import { Star } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

interface GameMapProps {
    territories: Territory[]
    units: Unit[]
    onTerritoryClick: (territory: Territory) => void
}

export default function GameMap({ territories, units, onTerritoryClick }: GameMapProps) {
    return (
        <Card>
            <CardHeader>
                <CardTitle>Diplomacy Game Map</CardTitle>
            </CardHeader>
            <CardContent>
                <svg viewBox="0 0 300 300" className="w-full h-full">
                    {territories.map((territory) => (
                        <g key={territory.id}>
                            <rect
                                x={territory.x * 100}
                                y={territory.y * 100}
                                width="100"
                                height="100"
                                fill={territory.type === 'supply' ? '#FFFACD' : 'white'}
                                stroke="black"
                                strokeWidth="2"
                                onClick={() => onTerritoryClick(territory)}
                                className="cursor-pointer hover:opacity-80 transition-opacity"
                            />
                            <text
                                x={territory.x * 100 + 50}
                                y={territory.y * 100 + 40}
                                textAnchor="middle"
                                dominantBaseline="middle"
                                fill="black"
                                fontSize="12"
                            >
                                {territory.name}
                            </text>
                            {territory.type === 'supply' && (
                                <Star
                                    size={24}
                                    fill="gold"
                                    stroke="black"
                                    strokeWidth={1}
                                    x={territory.x * 100 + 38}
                                    y={territory.y * 100 + 60}
                                />
                            )}
                            {units.filter(unit => unit.position === territory.id).map((unit, index) => (
                                <g key={unit.id}>
                                    <circle
                                        cx={territory.x * 100 + 50 + index * 20 - 10}
                                        cy={territory.y * 100 + 80}
                                        r="8"
                                        fill={unit.type === 'army' ? 'black' : 'white'}
                                        stroke="black"
                                        strokeWidth="2"
                                    />
                                    <text
                                        x={territory.x * 100 + 50 + index * 20 - 10}
                                        y={territory.y * 100 + 95}
                                        textAnchor="middle"
                                        dominantBaseline="middle"
                                        fill="black"
                                        fontSize="10"
                                    >
                                        {unit.strength}
                                    </text>
                                </g>
                            ))}
                        </g>
                    ))}
                </svg>
            </CardContent>
        </Card>
    )
} 