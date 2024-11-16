import { Territory, Unit } from '@/lib/types/game'
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import CastleIcon from '@/public/images/castle.svg'
import Image from 'next/image'

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
                                fill={territory.type === 'castle' ? '#FFFACD' : 'white'}
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
                                fontSize="10"
                            >
                                {territory.name}
                            </text>

                            {territory.type === 'castle' && (
                                // castle svg
                                <svg
                                    x={territory.x * 100 + 40}
                                    y={territory.y * 100 + 45}
                                    width="20"
                                    height="20"
                                    viewBox="0 0 24 24"
                                    fill="currentColor"
                                >
                                    <path d="M12 2L2 8v14h20V8L12 2zm-2 17H6v-3h4v3zm8 0h-4v-3h4v3zm2-7H4v-5l8-4.5 8 4.5v5z" />
                                </svg>
                            )}
                            {units.filter(unit => unit.position === territory.id).map((unit, index) => (
                                <g key={unit.id}>
                                    <circle
                                        cx={territory.x * 100 + 50 + index * 20 - 10}
                                        cy={territory.y * 100 + 80}
                                        r="8"
                                        fill='black'
                                        stroke="black"
                                        strokeWidth="2"
                                    />
                                    <text
                                        x={territory.x * 100 + 70 + index * 20 - 10}
                                        y={territory.y * 100 + 81}
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