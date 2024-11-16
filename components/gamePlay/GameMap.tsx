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
                            {/* ... rest of territory rendering logic */}
                        </g>
                    ))}
                </svg>
            </CardContent>
        </Card>
    )
} 