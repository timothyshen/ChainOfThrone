'use client'

import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { toast } from "@/lib/hooks/useToast"

type Player = {
  id: string
  name: string
  color: string
  country: string
}

type Unit = {
  id: string
  type: 'army' | 'fleet'
  position: string
}

const availableCountries = [
  { name: 'England', color: '#FF0000' },
  { name: 'France', color: '#0000FF' },
  { name: 'Germany', color: '#000000' },
  { name: 'Italy', color: '#00FF00' },
  { name: 'Austria-Hungary', color: '#FF00FF' },
  { name: 'Russia', color: '#008000' },
  { name: 'Turkey', color: '#FFFF00' },
]

const initialTerritories: { [key: string]: { name: string, type: 'land' | 'sea', supplyCenter: boolean } } = {
  'lon': { name: 'London', type: 'land', supplyCenter: true },
  'lvp': { name: 'Liverpool', type: 'land', supplyCenter: true },
  'edi': { name: 'Edinburgh', type: 'land', supplyCenter: true },
  'bre': { name: 'Brest', type: 'land', supplyCenter: true },
  'par': { name: 'Paris', type: 'land', supplyCenter: true },
  'mar': { name: 'Marseilles', type: 'land', supplyCenter: true },
  'kie': { name: 'Kiel', type: 'land', supplyCenter: true },
}

export function GameSetupComponent({ onGameStart }: { onGameStart: (players: Player[], units: Unit[]) => void }) {
  const [players, setPlayers] = useState<Player[]>([])
  const [currentPlayer, setCurrentPlayer] = useState<Player>({ id: '', name: '', color: '', country: '' })
  const [units, setUnits] = useState<Unit[]>([])
  const [selectedTerritory, setSelectedTerritory] = useState<string | null>(null)

  const handleAddPlayer = () => {
    if (currentPlayer.name && currentPlayer.country) {
      const country = availableCountries.find(c => c.name === currentPlayer.country)
      if (country) {
        const newPlayer: Player = {
          ...currentPlayer,
          id: Date.now().toString(),
          color: country.color
        }
        setPlayers([...players, newPlayer])
        setCurrentPlayer({ id: '', name: '', color: '', country: '' })
      }
    }
  }

  const handleUnitPlacement = (type: 'army' | 'fleet') => {
    if (selectedTerritory && players.length > 0) {
      const player = players[players.length - 1]
      const newUnit: Unit = {
        id: Date.now().toString(),
        type,
        position: selectedTerritory
      }
      setUnits([...units, newUnit])
      setSelectedTerritory(null)
    }
  }

  const handleStartGame = () => {
    if (players.length >= 2 && units.length === players.length * 3) {
      onGameStart(players, units)
    } else {
      toast({
        title: "Invalid Setup",
        description: "Ensure all players have been added and each player has 3 units placed.",
        variant: "destructive",
      })
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Diplomacy Game Setup</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="mb-4">
          <Input
            placeholder="Player Name"
            value={currentPlayer.name}
            onChange={(e) => setCurrentPlayer({ ...currentPlayer, name: e.target.value })}
            className="mb-2"
          />
          <Select onValueChange={(value) => setCurrentPlayer({ ...currentPlayer, country: value })}>
            <SelectTrigger>
              <SelectValue placeholder="Select a country" />
            </SelectTrigger>
            <SelectContent>
              {availableCountries
                .filter(country => !players.some(player => player.country === country.name))
                .map(country => (
                  <SelectItem key={country.name} value={country.name}>
                    {country.name}
                  </SelectItem>
                ))
              }
            </SelectContent>
          </Select>
          <Button onClick={handleAddPlayer} className="mt-2">Add Player</Button>
        </div>
        <div className="mb-4">
          <h3 className="text-lg font-bold mb-2">Players:</h3>
          {players.map(player => (
            <div key={player.id} className="mb-2">
              {player.name} - {player.country}
            </div>
          ))}
        </div>
        <div className="mb-4">
          <h3 className="text-lg font-bold mb-2">Unit Placement:</h3>
          <Select onValueChange={setSelectedTerritory}>
            <SelectTrigger>
              <SelectValue placeholder="Select a territory" />
            </SelectTrigger>
            <SelectContent>
              {Object.entries(initialTerritories).map(([id, territory]) => (
                <SelectItem key={id} value={id}>
                  {territory.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <div className="mt-2">
            <Button onClick={() => handleUnitPlacement('army')} className="mr-2">Place Army</Button>
            <Button onClick={() => handleUnitPlacement('fleet')}>Place Fleet</Button>
          </div>
        </div>
        <div className="mb-4">
          <h3 className="text-lg font-bold mb-2">Placed Units:</h3>
          {units.map(unit => (
            <div key={unit.id} className="mb-2">
              {unit.type} in {initialTerritories[unit.position].name}
            </div>
          ))}
        </div>
        <Button onClick={handleStartGame}>Start Game</Button>
      </CardContent>
    </Card>

  )
}